package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"
)

type guestbookEntry struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Note      string    `json:"note"`
	CreatedAt time.Time `json:"created_at"`
}

type guestbookEntriesResponse struct {
	Data []guestbookEntry `json:"data"`
}

type guestbookCountResponse struct {
	Count int64 `json:"count"`
}

type guestbookCreateRequest struct {
	Name string `json:"name"`
	Note string `json:"note"`
}

func (a app) listEntries(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT id, name, note, created_at FROM guestbook_entries ORDER BY created_at DESC, id DESC`)
	if err != nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "UNAVAILABLE", "Service unavailable.", nil)
		return
	}
	defer rows.Close()

	entries := make([]guestbookEntry, 0)
	for rows.Next() {
		var entry guestbookEntry
		if err := rows.Scan(&entry.ID, &entry.Name, &entry.Note, &entry.CreatedAt); err != nil {
			writeAPIError(w, r, http.StatusInternalServerError, "INTERNAL", "Internal server error.", nil)
			return
		}
		entries = append(entries, entry)
	}
	if err := rows.Err(); err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "INTERNAL", "Internal server error.", nil)
		return
	}

	writeJSON(w, http.StatusOK, guestbookEntriesResponse{Data: entries})
}

func (a app) countEntries(w http.ResponseWriter, r *http.Request) {
	var count int64
	if err := a.db.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM guestbook_entries`).Scan(&count); err != nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "UNAVAILABLE", "Service unavailable.", nil)
		return
	}
	writeJSON(w, http.StatusOK, guestbookCountResponse{Count: count})
}

func (a app) createEntry(w http.ResponseWriter, r *http.Request) {
	var req guestbookCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "BAD_REQUEST", "Request body must be valid JSON.", nil)
		return
	}

	name := strings.TrimSpace(req.Name)
	note := strings.TrimSpace(req.Note)
	if name == "" || note == "" || len(name) > 60 || len(note) > 280 {
		writeAPIError(w, r, http.StatusUnprocessableEntity, "VALIDATION_FAILED", "Name and note must be within length limits.", nil)
		return
	}

	var entry guestbookEntry
	if err := a.db.QueryRowContext(r.Context(), `INSERT INTO guestbook_entries (name, note) VALUES ($1, $2) RETURNING id, name, note, created_at`, name, note).Scan(&entry.ID, &entry.Name, &entry.Note, &entry.CreatedAt); err != nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "UNAVAILABLE", "Service unavailable.", nil)
		return
	}
	writeJSON(w, http.StatusCreated, entry)
}

func writeAPIError(w http.ResponseWriter, r *http.Request, status int, code string, message string, details any) {
	_ = r
	payload := map[string]any{
		"error": map[string]any{
			"code":    code,
			"message": message,
		}
	}
	if details != nil {
		payload["error"].(map[string]any)["details"] = details
	}
	writeJSON(w, status, payload)
}

var _ = errors.New
var _ = sql.ErrNoRows
