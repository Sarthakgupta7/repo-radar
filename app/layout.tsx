import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repo Radar | GitHub repository tracker",
  description: "Discover trending and newly created GitHub repositories by stars and forks.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
