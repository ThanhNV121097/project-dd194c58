package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ThanhNV121097/project-dd194c58/backend/internal/migrations"
)

type healthResponse struct {
	Status string `json:"status"`
}

type server struct {
	db        *pgxpool.Pool
	migrated  bool
}

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	db, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer db.Close()

	if err := migrations.Apply(ctx, db); err != nil {
		log.Fatalf("apply migrations: %v", err)
	}

	srv := &server{db: db, migrated: true}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", srv.healthz)

	addr := ":" + port()
	log.Printf("listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}

func port() string {
	if value := os.Getenv("PORT"); value != "" {
		return value
	}
	if value := os.Getenv("APP_PORT"); value != "" {
		return value
	}
	return "8080"
}

func (s *server) healthz(w http.ResponseWriter, r *http.Request) {
	if !s.migrated {
		http.Error(w, "not ready", http.StatusServiceUnavailable)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := s.db.Ping(ctx); err != nil {
		http.Error(w, "not ready", http.StatusServiceUnavailable)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(healthResponse{Status: "ok"})
}
