CREATE TABLE IF NOT EXISTS guestbook_entries (
    id bigserial PRIMARY KEY,
    name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
    note text NOT NULL CHECK (char_length(note) BETWEEN 1 AND 280),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guestbook_entries_created_at_idx ON guestbook_entries (created_at DESC, id DESC);
