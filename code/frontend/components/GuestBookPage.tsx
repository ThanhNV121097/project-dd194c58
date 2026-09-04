"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./GuestBookPage.module.css";
import { mockGuestBook } from "../lib/mock/build-guest-book-api";

export default function GuestBookPage() {
  const [entries, setEntries] = useState(mockGuestBook.entries);
  const [count, setCount] = useState(mockGuestBook.count);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const latest = useMemo(() => entries[0], [entries]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setBanner(null);
    const next = mockGuestBook.createEntry(name, note);
    if (typeof next === "string") {
      setBanner(next);
      setLoading(false);
      return;
    }
    setEntries([next, ...entries]);
    setCount((value) => value + 1);
    setName("");
    setNote("");
    setBanner("Thanks. Your note is at top of list.");
    setLoading(false);
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Shop door guest book</p>
            <h1 className={styles.title}>A little welcome on every visit.</h1>
            <p className={styles.lead}>
              Visitors leave a name and a short note. Everyone can read what came before.
            </p>
          </div>
          <div className={styles.countCard} id="visit-count">
            <span className={styles.countValue}>{count}</span>
            <span className={styles.countLabel}>Visitors so far</span>
          </div>
        </header>

        <section className={styles.grid}>
          <form className={styles.form} id="sign" onSubmit={handleSubmit}>
            <h2 className={styles.sectionTitle}>Sign the book</h2>
            <label className={styles.field}>
              <span>Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} />
            </label>
            <label className={styles.field}>
              <span>Note</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={280} />
            </label>
            <p className={styles.help}>Trimmed to 1-60 chars for name, 1-280 for note.</p>
            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? "Leaving note…" : "Leave note"}
            </button>
            {banner ? <div className={styles.banner}>{banner}</div> : null}
          </form>

          <section className={styles.listWrap} id="entries">
            <h2 className={styles.sectionTitle}>Latest notes</h2>
            <p className={styles.subtle}>{latest ? `Newest entry: ${latest.name}` : "No entries yet."}</p>
            <div className={styles.list} aria-live="polite">
              {entries.map((entry) => (
                <article className={styles.card} key={entry.id}>
                  <div className={styles.cardTop}>
                    <strong>{entry.name}</strong>
                    <time>{entry.created_at}</time>
                  </div>
                  <p>{entry.note}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
