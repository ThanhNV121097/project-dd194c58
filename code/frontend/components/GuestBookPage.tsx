"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createEntry,
  fetchEntries,
  fetchEntryCount,
  type GuestBookEntry,
} from "../lib/mock/connect-page-to-api";
import styles from "./GuestBookPage.module.css";

type LoadState = "loading" | "ready" | "error";

const friendlyError = "Could not reach guest book API. Try again in a moment.";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function GuestBookPage() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<GuestBookEntry[]>([]);
  const [count, setCount] = useState(0);
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try {
      const [nextEntries, nextCount] = await Promise.all([
        fetchEntries(),
        fetchEntryCount(),
      ]);
      setEntries(nextEntries);
      setCount(nextCount.count);
      setState("ready");
      setMessage(null);
    } catch {
      setState("error");
      setMessage(friendlyError);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await createEntry({ name, note });
      await refresh();
      setName("");
      setNote("");
    } catch {
      setState("error");
      setMessage(friendlyError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.wrap}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Guest Book home">
          <span className={styles.brandMark} aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M6 4h10l2 2v14H6z" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
          </span>
          <span>
            <span className={styles.eyebrow}>Shop door guest book</span>
            <br />
            Guest Book
          </span>
        </a>
        <nav className={styles.nav} aria-label="Primary">
          <a className={styles.navLink} href="#sign">
            Sign
          </a>
          <a className={styles.navLink} href="#entries">
            Entries
          </a>
          <a className={styles.navLink} href="#visit-count">
            Count
          </a>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div>
          <p className={styles.eyebrow}>Warm paper, deep green ink</p>
          <h1 id="hero-title">A little welcome on every visit.</h1>
          <p className={styles.lead}>
            Visitors leave a name and a short note. Everyone can read what came before. New
            entries fade in quietly, like fresh ink on a page.
          </p>
          <div className={styles.statRow} id="visit-count">
            <div className={styles.stat}>
              <strong>{count}</strong>
              <span>Visitors so far</span>
            </div>
            <div className={styles.stat}>
              <strong>{entries.length}</strong>
              <span>Recent notes</span>
            </div>
            <div className={styles.stat}>
              <strong>Live</strong>
              <span>API-backed list</span>
            </div>
          </div>
        </div>

        <div className={styles.heroArt} aria-hidden="true">
          <div className={styles.paperPanel}>
            <div className={styles.sampleCard}>
              <p>“Thanks for stopping by.”</p>
              <span>Sample note card style</span>
            </div>
            <svg className={styles.scribble} viewBox="0 0 200 200">
              <path
                d="M20 120c28-44 58-64 80-60 32 6 52 48 80 42s16-56-10-60-54 34-76 54-36 44-70 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </section>

      <section className={styles.section} id="sign" aria-labelledby="sign-title">
        <form className={styles.form} onSubmit={onSubmit}>
          <h2 id="sign-title">Sign the book</h2>
          <p className={styles.subtle}>
            Add your name and a short note. Trimmed input, clear validation, friendly errors.
          </p>
          <label className={styles.field}>
            <span>Name</span>
            <input
              className={styles.textInput}
              value={name}
              onChange={(event) => setName(event.target.value)}
              name="name"
              maxLength={60}
              placeholder="Ada Lovelace"
              required
            />
            <small>1–60 characters after trimming.</small>
          </label>
          <label className={styles.field}>
            <span>Note</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              name="note"
              maxLength={280}
              placeholder="Loved the tea and the calm corner by the window."
              required
            />
            <small>1–280 characters after trimming.</small>
          </label>
          <div className={styles.actions}>
            <button className={styles.primary} type="submit" disabled={saving}>
              {saving ? "Leaving note..." : "Leave note"}
            </button>
            <span className={styles.count}>Count stays visible while posting.</span>
          </div>
          {message ? (
            <p className={styles.notice} role="alert">
              {message}
            </p>
          ) : null}
        </form>

        <div className={styles.stack}>
          <section className={styles.entries} id="entries" aria-labelledby="entries-title">
            <h2 id="entries-title">Latest notes</h2>
            <div className={styles.feed} aria-live="polite">
              {state === "loading" ? (
                <p className={styles.subtle}>Loading entries...</p>
              ) : entries.length ? (
                entries.map((entry) => (
                  <article className={styles.card} key={entry.id}>
                    <div className={styles.cardTop}>
                      <strong>{entry.name}</strong>
                      <span>{formatDate(entry.created_at)}</span>
                    </div>
                    <p>{entry.note}</p>
                  </article>
                ))
              ) : (
                <p className={styles.subtle}>No notes yet. Be first to sign.</p>
              )}
            </div>
          </section>

          <section className={styles.entries} aria-labelledby="api-title">
            <h2 id="api-title">API state</h2>
            <div className={styles.row}>
              <div className={styles.mini}>
                <strong>OK</strong>
                <span>GET /health responds</span>
              </div>
              <div className={styles.mini}>
                <strong>DB</strong>
                <span>Entries survive restart</span>
              </div>
            </div>
            <p className={styles.subtle}>
              All content on screen comes from the API in the finished app. This mock shows the
              same layout and states.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
