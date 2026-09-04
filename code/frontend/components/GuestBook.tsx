"use client";

import type { FormEvent } from 'react';
import { useState } from 'react';
import { guestBookMock } from '@/lib/mock/build-guest-book-api';
import styles from './GuestBook.module.css';

type Entry = (typeof guestBookMock.entries)[number];

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function GuestBookPage() {
  const [entries, setEntries] = useState<Entry[]>(guestBookMock.entries);
  const [count, setCount] = useState(guestBookMock.count);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const newestLabel = count === 1 ? 'Visitor so far' : 'Visitors so far';

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const note = form.note.trim();

    if (!name) return setError('Name needed. Use 1–60 characters after trimming.');
    if (name.length > 60) return setError('Name too long. Keep it at 60 characters or less.');
    if (!note) return setError('Note needed. Use 1–280 characters after trimming.');
    if (note.length > 280) return setError('Note too long. Keep it at 280 characters or less.');

    const created_at = new Date().toISOString();
    const nextEntry = { id: crypto.randomUUID(), name, note, created_at };

    setEntries((current) => [nextEntry, ...current]);
    setCount((current) => current + 1);
    setForm(emptyForm);
    setError(null);
    setMessage('Thanks. Entry appears at top of list with no reload.');
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Guest Book home">
          <span className={styles.brandMark} aria-hidden="true">✦</span>
          <span>
            <span className={styles.eyebrow}>Shop door guest book</span>
            <span className={styles.brandName}>Guest Book</span>
          </span>
        </a>
      </header>

      <section className={styles.hero} id="top">
        <div>
          <p className={styles.kicker}>Warm paper, deep green ink</p>
          <h1 className={styles.title}>A little welcome on every visit.</h1>
          <p className={styles.lead}>Visitors leave a name and a short note. Everyone can read what came before. New entries fade in quietly, like fresh ink on a page.</p>
          <div className={styles.stats} aria-label="Guest book stats">
            <div className={styles.stat}><strong>{count}</strong><span>{newestLabel}</span></div>
            <div className={styles.stat}><strong>{entries.length}</strong><span>Recent notes</span></div>
            <div className={styles.stat}><strong>Live</strong><span>API-backed list</span></div>
          </div>
        </div>
        <div className={styles.paper} aria-hidden="true">
          <div className={styles.previewNote}>“Thanks for stopping by.”</div>
        </div>
      </section>

      <section className={styles.layout} aria-labelledby="sign-title">
        <form className={styles.card} onSubmit={submitForm}>
          <h2 id="sign-title">Sign the book</h2>
          <p className={styles.subtle}>Add your name and a short note. Trimmed input, clear validation, friendly errors.</p>
          <label className={styles.field}>
            <span>Name</span>
            <input value={form.name} maxLength={60} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ada Lovelace" />
            <small>1–60 characters after trimming.</small>
          </label>
          <label className={styles.field}>
            <span>Note</span>
            <textarea value={form.note} maxLength={280} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Loved the tea and the calm corner by the window." />
            <small>1–280 characters after trimming.</small>
          </label>
          <div className={styles.actions}>
            <button className={styles.primary} type="submit">Leave note</button>
            <span className={styles.badge}>Count stays visible while posting</span>
          </div>
          {message ? <p className={styles.notice} role="status">{message}</p> : null}
          {error ? <p className={styles.notice} role="alert">Could not reach API. Try again in a moment. {error}</p> : null}
        </form>

        <section className={styles.card} id="entries" aria-labelledby="entries-title">
          <h2 id="entries-title">Latest notes</h2>
          <div className={styles.feed} aria-live="polite">
            {entries.map((entry) => (
              <article key={entry.id} className={styles.entry}>
                <div className={styles.entryTop}>
                  <div className={styles.name}>{entry.name}</div>
                  <div className={styles.date}>{new Date(entry.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                </div>
                <p className={styles.note}>{entry.note}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
