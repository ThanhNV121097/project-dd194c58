import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guest Book",
  description: "A warm public guest book for visitor notes"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
