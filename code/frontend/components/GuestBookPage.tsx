"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./GuestBookPage.module.css";

type Entry = {
  id: string;
  name: string;
  note: string;
  created_at: string;
};

type ApiError = {
  error?: {
    code?: string;
    message?: string;
    details?: Array<{ field?: string; code?: string; message?: string }>;
  };
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const emptyForm = { name: "", note: "" };

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function readJSON<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export default function GuestBookPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [count, setCount] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [banner, setBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const latest = useMemo(() => entries[0], [entries]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [entriesResponse, countResponse] = await Promise.all([
          fetch(`${apiBase}/v1/entries`),
          fetch(`${apiBase}/v1/entries/count`),
        ]);
        if (!entriesResponse.ok || !countResponse.ok) throw new Error("load failed");
        const entriesBody = await readJSON<{ data: Entry[] }>(entriesResponse);
        const countBody = await readJSON<{ count: number }>(countResponse);
        if (!active) return;
        setEntries(entriesBody.data);
        setCount(countBody.count);
      } catch {
        if (!active) return;
        setBanner("API unavailable. Please try again later.");
      } finally {
        if (!active) return;
        setReady(true);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setBanner(null);

    try {
      const response = await fetch(`${apiBase}/v1/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const body = (await readJSON<ApiError>(response).catch(() => ({}))) as ApiError;
        const message = body.error?.details?.[0]?.message ?? body.error?.message ?? "API unavailable. Please try again later.";
        setBanner(message);
        return;
      }
      const next = await readJSON<Entry>(response);
      setEntries((current) => [next, ...current]);
      setCount((value) => value + 1);
      setForm(emptyForm);
      setBanner("Thanks. Your note is at top of list.");
    } catch {
      setBanner("API unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
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
          <form className={styles.form} id="sign" onSubmit={submitForm}>
            <h2 className={styles.sectionTitle}>Sign the book</h2>
            <label className={styles.field}>
              <span>Name</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} maxLength={60} />
            </label>
            <label className={styles.field}>
              <span>Note</span>
              <textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} maxLength={280} />
            </label>
            <p className={styles.help}>Trimmed to 1-60 chars for name, 1-280 for note.</p>
            <button className={styles.button} type="submit" disabled={loading || !ready}>
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
                    <time>{formatDate(entry.created_at)}</time>
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
