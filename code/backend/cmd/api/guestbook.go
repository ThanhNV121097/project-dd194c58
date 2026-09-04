package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

type guestbookEntry struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Note      string    `json:"note"`
	CreatedAt string    `json:"created_at"`
}

type apiError struct {
	Error apiErrorBody `json:"error"`
}

type apiErrorBody struct {
	Code      string       `json:"code"`
	Message   string       `json:"message"`
	Details   []apiErrItem `json:"details,omitempty"`
	RequestID string       `json:"request_id"`
}

type apiErrItem struct {
	Field   string `json:"field"`
	Code    string `json:"code"`
	Message string `json:"message"`
}

type rateBucket struct {
	windowStart time.Time
	count       int
}

type rateLimiter struct {
	mu sync.Mutex
	m  map[string]*rateBucket
}

func (r *rateLimiter) allow(key string, limit int, window time.Duration) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.m == nil {
		r.m = map[string]*rateBucket{}
	}
	now := time.Now()
	bucket := r.m[key]
	if bucket == nil || now.Sub(bucket.windowStart) >= window {
		r.m[key] = &rateBucket{windowStart: now, count: 1}
		return true
	}
	if bucket.count >= limit {
		return false
	}
	bucket.count++
	return true
}

type requestContextKey string

const requestIDKey requestContextKey = "request_id"

var limiter rateLimiter

func (a app) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", a.health)
	mux.HandleFunc("POST /v1/entries", a.createEntry)
	mux.HandleFunc("GET /v1/entries", a.listEntries)
	mux.HandleFunc("GET /v1/entries/count", a.countEntries)
	return a.withRequestID(a.withRateLimit(mux))
}

func (a app) withRequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("X-Request-Id")
		if id == "" {
			id = randomID()
		}
		w.Header().Set("X-Request-Id", id)
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), requestIDKey, id)))
	})
}

func (a app) withRateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		limit := 60
		if r.Method == http.MethodPost {
			limit = 10
		}
		ip := clientIP(r.RemoteAddr)
		if !limiter.allow(r.Method+":"+ip, limit, time.Minute) {
			w.Header().Set("Retry-After", "60")
			writeAPIError(w, http.StatusTooManyRequests, "RATE_LIMITED", "Too many requests.", nil, requestID(r.Context()))
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a app) listEntries(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	rows, err := a.db.QueryContext(ctx, `SELECT id, name, note, created_at FROM guestbook_entries ORDER BY created_at DESC, id DESC`)
	if err != nil {
		writeDBError(w, err, requestID(r.Context()))
		return
	}
	defer rows.Close()
	var out []guestbookEntry
	for rows.Next() {
		var entry guestbookEntry
		var id int64
		var createdAt time.Time
		if err := rows.Scan(&id, &entry.Name, &entry.Note, &createdAt); err != nil {
			writeDBError(w, err, requestID(r.Context()))
			return
		}
		entry.ID = strconv.FormatInt(id, 10)
		entry.CreatedAt = createdAt.UTC().Format(time.RFC3339)
		out = append(out, entry)
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": out})
}

func (a app) countEntries(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	var count int
	if err := a.db.QueryRowContext(ctx, `SELECT count(*) FROM guestbook_entries`).Scan(&count); err != nil {
		writeDBError(w, err, requestID(r.Context()))
		return
	}
	writeJSON(w, http.StatusOK, map[string]int{"count": count})
}

func (a app) createEntry(w http.ResponseWriter, r *http.Request) {
	if ct := r.Header.Get("Content-Type"); ct != "" && !strings.HasPrefix(ct, "application/json") {
		writeAPIError(w, http.StatusBadRequest, "BAD_REQUEST", "Request body must be JSON.", nil, requestID(r.Context()))
		return
	}
	var body struct {
		Name string `json:"name"`
		Note string `json:"note"`
	}
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4<<10))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&body); err != nil {
		writeAPIError(w, http.StatusBadRequest, "BAD_REQUEST", "Request body must be JSON.", nil, requestID(r.Context()))
		return
	}
	name := strings.TrimSpace(body.Name)
	note := strings.TrimSpace(body.Note)
	var details []apiErrItem
	if name == "" {
		details = append(details, apiErrItem{Field: "name", Code: "REQUIRED", Message: "Name is required."})
	} else if len([]rune(name)) > 60 {
		details = append(details, apiErrItem{Field: "name", Code: "TOO_LONG", Message: "Name is too long."})
	}
	if note == "" {
		details = append(details, apiErrItem{Field: "note", Code: "REQUIRED", Message: "Note is required."})
	} else if len([]rune(note)) > 280 {
		details = append(details, apiErrItem{Field: "note", Code: "TOO_LONG", Message: "Note is too long."})
	}
	if len(details) > 0 {
		writeAPIError(w, http.StatusUnprocessableEntity, "VALIDATION_FAILED", "Request validation failed.", details, requestID(r.Context()))
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	var id int64
	var createdAt time.Time
	if err := a.db.QueryRowContext(ctx, `INSERT INTO guestbook_entries (name, note) VALUES ($1, $2) RETURNING id, created_at`, name, note).Scan(&id, &createdAt); err != nil {
		writeDBError(w, err, requestID(r.Context()))
		return
	}
	w.Header().Set("Location", "/v1/entries/"+strconv.FormatInt(id, 10))
	writeJSON(w, http.StatusCreated, guestbookEntry{ID: strconv.FormatInt(id, 10), Name: name, Note: note, CreatedAt: createdAt.UTC().Format(time.RFC3339)})
}

func writeDBError(w http.ResponseWriter, err error, requestID string) {
	if errors.Is(err, context.DeadlineExceeded) || errors.Is(err, sql.ErrConnDone) {
		writeAPIError(w, http.StatusServiceUnavailable, "UNAVAILABLE", "Service unavailable.", nil, requestID)
		return
	}
	writeAPIError(w, http.StatusInternalServerError, "INTERNAL", "Internal error.", nil, requestID)
}

func writeAPIError(w http.ResponseWriter, status int, code string, message string, details []apiErrItem, requestID string) {
	writeJSON(w, status, apiError{Error: apiErrorBody{Code: code, Message: message, Details: details, RequestID: requestID}})
}

func requestID(ctx context.Context) string {
	value, _ := ctx.Value(requestIDKey).(string)
	return value
}

func randomID() string {
	return fmt.Sprintf("%016x", rand.Int63())
}

func clientIP(remote string) string {
	host, _, err := net.SplitHostPort(remote)
	if err != nil {
		return remote
	}
	return host
}
