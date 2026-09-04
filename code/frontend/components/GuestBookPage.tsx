"use client";

import styles from "./GuestBookPage.module.css";

export default function GuestBookPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top">
          Guest Book
        </a>
        <nav className={styles.nav} aria-label="Primary">
          <a className={styles.navLink} href="#sign">
            Sign
          </a>
          <a className={styles.navLink} href="#entries">
            Entries
          </a>
          <a className={styles.navLink} href="#count">
            Count
          </a>
        </nav>
      </header>

      <section className={styles.form} id="sign">
        <label className={styles.field}>
          <span>Name</span>
          <input className={styles.input} type="text" />
        </label>
        <label className={styles.field}>
          <span>Note</span>
          <textarea className={styles.textarea} />
        </label>
      </section>
    </main>
  );
}
