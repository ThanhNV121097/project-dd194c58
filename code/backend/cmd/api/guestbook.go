package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode"
)

type entry struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Note      string `json:"note"`
	CreatedAt string `json:"created_at"`
}

type apiError struct {
	Error struct {
		Code      string        `json:"code"`
		Message   string        `json:"message"`
		Details   []errorDetail `json:"details,omitempty"`
		RequestID string        `json:"request_id"`
	} `json:"error"`
}

type errorDetail struct {
	Field   string `json:"field"`
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (a app) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", a.healthz)
	mux.HandleFunc("GET /health", a.health)
	mux.HandleFunc("GET /v1/entries", a.listEntries)
	mux.HandleFunc("GET /v1/entries/count", a.countEntries)
	mux.HandleFunc("POST /v1/entries", a.createEntry)
	return mux
}

func (a app) healthz(w http.ResponseWriter, r *http.Request) { a.health(w, r) }

func (a app) health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := a.db.PingContext(ctx); err != nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "UNAVAILABLE", "Service unavailable.", nil)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (a app) listEntries(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT id, name, note, created_at FROM guestbook_entries ORDER BY created_at DESC, id DESC`)
	if err != nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "UNAVAILABLE", "Service unavailable.", nil)
		return
	}
	defer rows.Close()
	items := make([]entry, 0)
	for rows.Next() {
		var e entry
		var id int64
		var createdAt time.Time
		if err := rows.Scan(&id, &e.Name, &e.Note, &createdAt); err != nil {
			writeAPIError(w, r, http.StatusInternalServerError, "INTERNAL", "Unexpected failure.", nil)
			return
		}
		e.ID = strconv.FormatInt(id, 10)
		e.CreatedAt = createdAt.UTC().Format(time.RFC3339)
		items = append(items, e)
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": items})
}

func (a app) countEntries(w http.ResponseWriter, r *http.Request) {
	var count int64
	if err := a.db.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM guestbook_entries`).Scan(&count); err != nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "UNAVAILABLE", "Service unavailable.", nil)
		return
	}
	writeJSON(w, http.StatusOK, map[string]int64{"count": count})
}

func (a app) createEntry(w http.ResponseWriter, r *http.Request) {
	if ct := r.Header.Get("Content-Type"); ct != "" && !strings.HasPrefix(ct, "application/json") {
		writeAPIError(w, r, http.StatusBadRequest, "BAD_REQUEST", "Request must be JSON.", nil)
		return
	}
	var body struct{ Name, Note json.RawMessage }
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4<<10))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&body); err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "BAD_REQUEST", "Request must be valid JSON.", nil)
		return
	}
	var name, note string
	if err := json.Unmarshal(body.Name, &name); err != nil { writeAPIError(w, r, http.StatusBadRequest, "BAD_REQUEST", "Request must be valid JSON.", nil); return }
	if err := json.Unmarshal(body.Note, &note); err != nil { writeAPIError(w, r, http.StatusBadRequest, "BAD_REQUEST", "Request must be valid JSON.", nil); return }
	name = trimUnicode(name)
	note = trimUnicode(note)
	details := make([]errorDetail, 0, 2)
	if name == "" { details = append(details, errorDetail{"name", "REQUIRED", "Name is required."}) } else if len([]rune(name)) > 60 { details = append(details, errorDetail{"name", "TOO_LONG", "Name is too long."}) }
	if note == "" { details = append(details, errorDetail{"note", "REQUIRED", "Note is required."}) } else if len([]rune(note)) > 280 { details = append(details, errorDetail{"note", "TOO_LONG", "Note is too long."}) }
	if len(details) > 0 { writeAPIError(w, r, http.StatusUnprocessableEntity, "VALIDATION_FAILED", "Request validation failed.", details); return }
	var id int64
	var createdAt time.Time
	if err := a.db.QueryRowContext(r.Context(), `INSERT INTO guestbook_entries (name, note) VALUES ($1, $2) RETURNING id, created_at`, name, note).Scan(&id, &createdAt); err != nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "UNAVAILABLE", "Service unavailable.", nil)
		return
	}
	w.Header().Set("Location", "/v1/entries/"+strconv.FormatInt(id, 10))
	writeJSON(w, http.StatusCreated, entry{ID: strconv.FormatInt(id, 10), Name: name, Note: note, CreatedAt: createdAt.UTC().Format(time.RFC3339)})
}

func trimUnicode(s string) string { return strings.TrimFunc(s, unicode.IsSpace) }

func writeAPIError(w http.ResponseWriter, r *http.Request, status int, code, message string, details []errorDetail) {
	var payload apiError
	payload.Error.Code, payload.Error.Message, payload.Error.Details, payload.Error.RequestID = code, message, details, requestID(r)
	writeJSON(w, status, payload)
}

func requestID(r *http.Request) string {
	if v := r.Header.Get("X-Request-Id"); v != "" { return v }
	return fmt.Sprintf("%d", time.Now().UnixNano())
}
