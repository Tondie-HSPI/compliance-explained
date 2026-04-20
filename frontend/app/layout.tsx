import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compliance Explained Platform",
  description: "Governed obligation index and decision support."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

