package main

import (
	"context"
	"database/sql"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net"
	"net/http"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

type app struct {
	db *sql.DB
}

type entry struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Note      string    `json:"note"`
	CreatedAt time.Time `json:"created_at"`
}

type apiError struct {
	Error apiErrorBody `json:"error"`
}

type apiErrorBody struct {
	Code      string        `json:"code"`
	Message   string        `json:"message"`
	Details   []errorDetail `json:"details,omitempty"`
	RequestID string        `json:"request_id"`
}

type errorDetail struct {
	Field   string `json:"field"`
	Code    string `json:"code"`
	Message string `json:"message"`
}

type entryInput struct {
	Name string `json:"name"`
	Note string `json:"note"`
}

type requestContextKey struct{}

type limiter struct {
	mu   sync.Mutex
	seen map[string]*rateWindow
}

type rateWindow struct {
	start time.Time
	read  int
	write int
}

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := migrate(ctx, db); err != nil {
		log.Fatalf("migrate database: %v", err)
	}

	a := app{db: db}
	lim := newLimiter()
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", a.health)
	mux.HandleFunc("GET /health", a.health)
	mux.HandleFunc("POST /v1/entries", lim.wrap("write", a.createEntry))
	mux.HandleFunc("GET /v1/entries", lim.wrap("read", a.listEntries))
	mux.HandleFunc("GET /v1/entries/count", lim.wrap("read", a.countEntries))

	server := &http.Server{Addr: ":" + port(), Handler: requestIDMiddleware(mux), ReadHeaderTimeout: 5 * time.Second}
	log.Printf("listening on %s", server.Addr)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}

func port() string {
	if v := os.Getenv("PORT"); v != "" {
		return v
	}
	if v := os.Getenv("APP_PORT"); v != "" {
		return v
	}
	return "8080"
}

func (a app) health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := a.db.PingContext(ctx); err != nil {
		writeAPIError(w, http.StatusServiceUnavailable, "UNAVAILABLE", "Service unavailable.", requestID(r), nil)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (a app) createEntry(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")
	if contentType != "application/json" && !strings.HasPrefix(contentType, "application/json;") {
		writeAPIError(w, http.StatusBadRequest, "BAD_REQUEST", "Request must be JSON.", requestID(r), nil)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 4096)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	var in entryInput
	if err := dec.Decode(&in); err != nil {
		writeAPIError(w, http.StatusBadRequest, "BAD_REQUEST", "Request validation failed.", requestID(r), nil)
		return
	}
	if err := checkNoTrailingJSON(dec); err != nil {
		writeAPIError(w, http.StatusBadRequest, "BAD_REQUEST", "Request validation failed.", requestID(r), nil)
		return
	}

	name := strings.TrimSpace(in.Name)
	note := strings.TrimSpace(in.Note)
	details := make([]errorDetail, 0, 2)
	if name == "" {
		details = append(details, errorDetail{Field: "name", Code: "REQUIRED", Message: "Name is required."})
	} else if len([]rune(name)) > 60 {
		details = append(details, errorDetail{Field: "name", Code: "TOO_LONG", Message: "Name is too long."})
	}
	if note == "" {
		details = append(details, errorDetail{Field: "note", Code: "REQUIRED", Message: "Note is required."})
	} else if len([]rune(note)) > 280 {
		details = append(details, errorDetail{Field: "note", Code: "TOO_LONG", Message: "Note is too long."})
	}
	if len(details) > 0 {
		writeAPIError(w, http.StatusUnprocessableEntity, "VALIDATION_FAILED", "Request validation failed.", requestID(r), details)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	var e entry
	if err := a.db.QueryRowContext(ctx, `INSERT INTO guestbook_entries (name, note) VALUES ($1, $2) RETURNING id::text, name, note, created_at`, name, note).Scan(&e.ID, &e.Name, &e.Note, &e.CreatedAt); err != nil {
		writeAPIError(w, http.StatusServiceUnavailable, "UNAVAILABLE", "Service unavailable.", requestID(r), nil)
		return
	}
	w.Header().Set("Location", "/v1/entries/"+e.ID)
	writeJSON(w, http.StatusCreated, e)
}

func (a app) listEntries(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	rows, err := a.db.QueryContext(ctx, `SELECT id::text, name, note, created_at FROM guestbook_entries ORDER BY created_at DESC, id DESC`)
	if err != nil {
		writeAPIError(w, http.StatusServiceUnavailable, "UNAVAILABLE", "Service unavailable.", requestID(r), nil)
		return
	}
	defer rows.Close()

	data := make([]entry, 0)
	for rows.Next() {
		var e entry
		if err := rows.Scan(&e.ID, &e.Name, &e.Note, &e.CreatedAt); err != nil {
			writeAPIError(w, http.StatusInternalServerError, "INTERNAL", "Unexpected error.", requestID(r), nil)
			return
		}
		data = append(data, e)
	}
	if err := rows.Err(); err != nil {
		writeAPIError(w, http.StatusInternalServerError, "INTERNAL", "Unexpected error.", requestID(r), nil)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": data})
}

func (a app) countEntries(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	var count int64
	if err := a.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM guestbook_entries`).Scan(&count); err != nil {
		writeAPIError(w, http.StatusServiceUnavailable, "UNAVAILABLE", "Service unavailable.", requestID(r), nil)
		return
	}
	writeJSON(w, http.StatusOK, map[string]int64{"count": count})
}

func checkNoTrailingJSON(dec *json.Decoder) error {
	var v any
	if err := dec.Decode(&v); err == io.EOF {
		return nil
	} else if err == nil {
		return errors.New("extra data")
	} else {
		return err
	}
}

func writeAPIError(w http.ResponseWriter, status int, code, message, requestID string, details []errorDetail) {
	if code == "RATE_LIMITED" {
		w.Header().Set("Retry-After", "60")
	}
	writeJSON(w, status, apiError{Error: apiErrorBody{Code: code, Message: message, Details: details, RequestID: requestID}})
}

func requestID(r *http.Request) string {
	if v := r.Header.Get("X-Request-Id"); v != "" {
		return v
	}
	if v, _ := r.Context().Value(requestContextKey{}).(string); v != "" {
		return v
	}
	return ""
}

func requestIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("X-Request-Id")
		if id == "" {
			id = fmt.Sprintf("req-%d", time.Now().UnixNano())
		}
		w.Header().Set("X-Request-Id", id)
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), requestContextKey{}, id)))
	})
}

func newLimiter() *limiter { return &limiter{seen: make(map[string]*rateWindow)} }

func (l *limiter) wrap(kind string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !l.allow(kind, clientIP(r)) {
			writeAPIError(w, http.StatusTooManyRequests, "RATE_LIMITED", "Too many requests.", requestID(r), nil)
			return
		}
		next(w, r)
	}
}

func (l *limiter) allow(kind, ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	w := l.seen[ip]
	now := time.Now()
	if w == nil || now.Sub(w.start) >= time.Minute {
		w = &rateWindow{start: now}
		l.seen[ip] = w
	}
	if kind == "write" {
		if w.write >= 10 {
			return false
		}
		w.write++
		return true
	}
	if w.read >= 60 {
		return false
	}
	w.read++
	return true
}

func clientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func migrate(ctx context.Context, db *sql.DB) error {
	if _, err := db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`); err != nil {
		return err
	}

	names, err := fs.Glob(migrationFiles, "migrations/*.up.sql")
	if err != nil {
		return err
	}
	sort.Strings(names)

	for _, name := range names {
		version := strings.TrimSuffix(strings.TrimPrefix(name, "migrations/"), ".up.sql")
		var exists bool
		if err := db.QueryRowContext(ctx, `SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE version = $1)`, version).Scan(&exists); err != nil {
			return err
		}
		if exists {
			continue
		}
		sqlText, err := migrationFiles.ReadFile(name)
		if err != nil {
			return err
		}
		if err := applyMigration(ctx, db, version, string(sqlText)); err != nil {
			return fmt.Errorf("%s: %w", version, err)
		}
	}
	return nil
}

func applyMigration(ctx context.Context, db *sql.DB, version string, sqlText string) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, sqlText); err != nil {
		return err
	}
	if _, err := tx.ExecContext(ctx, `INSERT INTO schema_migrations (version) VALUES ($1)`, version); err != nil {
		return err
	}
	return tx.Commit()
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

