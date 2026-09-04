"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./GuestBookPage.module.css";

type Entry = {
  readonly id: number;
  readonly name: string;
  readonly note: string;
  readonly created_at: string;
};

type GuestBookPageData = {
  readonly count: number;
  readonly entries: readonly Entry[];
  readonly apiUnavailableMessage: string;
  readonly showApiUnavailable?: boolean;
};

type GuestBookPageProps = {
  data: GuestBookPageData;
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

function formatEntryDate(value: string) {
  return new Date(value).toLocaleString(undefined, DATE_FORMAT);
}

export default function GuestBookPage({ data }: GuestBookPageProps) {
  const [entries, setEntries] = useState(data.entries);
  const [count, setCount] = useState(data.count);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [apiUnavailable, setApiUnavailable] = useState(Boolean(data.showApiUnavailable));

  const newestEntries = useMemo(
    () => [...entries].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
    [entries],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedNote = note.trim();

    if (trimmedName.length === 0 || trimmedNote.length === 0) {
      setMessage("Enter name and note to sign book.");
      return;
    }

    const nextEntry: Entry = {
      id: Date.now(),
      name: trimmedName,
      note: trimmedNote,
      created_at: new Date().toISOString(),
    };

    setEntries((current) => [nextEntry, ...current]);
    setCount((current) => current + 1);
    setName("");
    setNote("");
    setMessage("Thanks. Entry appears at top of list with no reload.");
    setApiUnavailable(false);
  }

  if (apiUnavailable) {
    return (
      <main className={styles.page}>
        <section className={styles.notice} role="alert">
          <h1 className={styles.title}>Guest Book</h1>
          <p className={styles.noticeMessage}>{data.apiUnavailableMessage}</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="guest-book-title">
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Shop door guest book</p>
          <h1 id="guest-book-title" className={styles.title}>
            A little welcome on every visit.
          </h1>
          <p className={styles.intro}>
            Visitors leave a name and a short note. Everyone can read what came before. New entries fade in quietly.
          </p>
          <ul className={styles.stats} aria-label="Visitor stats">
            <li className={styles.stat}>
              <strong>{count}</strong>
              <span>Visitors so far</span>
            </li>
            <li className={styles.stat}>
              <strong>{newestEntries.length}</strong>
              <span>Recent notes</span>
            </li>
          </ul>
        </header>

        <section className={styles.layout}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h2 className={styles.sectionTitle}>Sign the book</h2>
            <div className={styles.field}>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ada Lovelace" />
              <p className={styles.help}>1–60 characters after trimming.</p>
            </div>
            <div className={styles.field}>
              <label htmlFor="note">Note</label>
              <textarea id="note" name="note" maxLength={280} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Loved the tea and the calm corner by the window." />
              <p className={styles.help}>1–280 characters after trimming.</p>
            </div>
            <button className={styles.primary} type="submit">Leave note</button>
            {message ? <p className={styles.banner} role="status">{message}</p> : null}
          </form>

          <section className={styles.entries} aria-labelledby="entries-title">
            <h2 id="entries-title" className={styles.sectionTitle}>Latest notes</h2>
            <div className={styles.feed} aria-live="polite">
              {newestEntries.map((entry) => (
                <article key={entry.id} className={`${styles.card} fade-in`}>
                  <div className={styles.cardTop}>
                    <div className={styles.name}>{entry.name}</div>
                    <div className={styles.date}>{formatEntryDate(entry.created_at)}</div>
                  </div>
                  <p className={styles.note}>{entry.note}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
