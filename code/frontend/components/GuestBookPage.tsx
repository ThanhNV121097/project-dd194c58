"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createEntry, fetchEntries, fetchEntryCount, type GuestBookEntry } from "../lib/mock/connect-page-to-api";
import styles from "./GuestBookPage.module.css";

type LoadState = "loading" | "ready" | "error";

const friendlyError = "Could not reach guest book API. Try again in a moment.";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function GuestBookPage() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<GuestBookEntry[]>([]);
  const [count, setCount] = useState(0);
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const latestLabel = useMemo(() => (count === 1 ? "Visitor" : "Visitors"), [count]);

  async function refresh() {
    try {
      const [nextEntries, nextCount] = await Promise.all([fetchEntries(), fetchEntryCount()]);
      setEntries(nextEntries);
      setCount(nextCount.count);
      setState("ready");
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
      const entry = await createEntry({ name, note });
      const [nextEntries, nextCount] = await Promise.all([fetchEntries(), fetchEntryCount()]);
      setEntries(nextEntries.length ? nextEntries : [entry, ...entries]);
      setCount(nextCount.count);
      setName("");
      setNote("");
      setState("ready");
    } catch {
      setMessage(friendlyError);
      setState("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="title">
        <div className={styles.brandRow}>
          <span className={styles.dot} aria-hidden="true" />
          <span>Shop door guest book</span>
        </div>
        <h1 id="title" className={styles.title}>A little welcome on every visit.</h1>
        <p className={styles.lead}>Visitors leave a name and a short note. Everyone can read what came before. New entries fade in quietly, like fresh ink on a page.</p>
        <div className={styles.stats} aria-label="Guest book stats">
          <div className={styles.stat}><strong>{count}</strong><span>{latestLabel}</span></div>
          <div className={styles.stat}><strong>{entries.length}</strong><span>Recent notes</span></div>
          <div className={styles.stat}><strong>Live</strong><span>API-backed list</span></div>
        </div>
        {state === "error" ? <p className={styles.notice} role="alert">{message ?? friendlyError}</p> : null}
      </section>

      <section className={styles.layout} aria-labelledby="sign-title">
        <form className={styles.form} onSubmit={onSubmit}>
          <h2 id="sign-title">Sign the book</h2>
          <p className={styles.subtle}>Add your name and a short note. Trimmed input, clear validation, friendly errors.</p>
          <label className={styles.field}>
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} name="name" maxLength={60} placeholder="Ada Lovelace" required />
            <small>1–60 characters after trimming.</small>
          </label>
          <label className={styles.field}>
            <span>Note</span>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} name="note" maxLength={280} placeholder="Loved the tea and the calm corner by the window." required />
            <small>1–280 characters after trimming.</small>
          </label>
          <div className={styles.actions}>
            <button className={styles.primary} type="submit" disabled={saving}>{saving ? "Leaving note..." : "Leave note"}</button>
            <span className={styles.count}>Count stays visible while posting.</span>
          </div>
        </form>

        <section className={styles.entries} aria-labelledby="entries-title">
          <h2 id="entries-title">Latest notes</h2>
          <div className={styles.feed} aria-live="polite">
            {entries.length ? entries.map((entry) => (
              <article className={styles.card} key={entry.id}>
                <div className={styles.cardTop}><strong>{entry.name}</strong><span>{formatDate(entry.created_at)}</span></div>
                <p>{entry.note}</p>
              </article>
            )) : state === "loading" ? <p className={styles.subtle}>Loading entries...</p> : <p className={styles.subtle}>No notes yet. Be first to sign.</p>}
          </div>
        </section>
      </section>
    </main>
  );
}
