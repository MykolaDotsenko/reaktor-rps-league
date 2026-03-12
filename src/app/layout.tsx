import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RPS League',
  description: 'Rock-Paper-Scissors match results and leaderboards',
};

const NAV_LINKS = [
  { href: '/', label: 'Latest' },
  { href: '/day', label: 'By Day' },
  { href: '/player', label: 'Player' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-950 text-gray-100`}>
        <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-900/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight text-white">
              RPS League
            </Link>
            <nav className="flex flex-wrap gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mt-16 border-t border-gray-800">
          <div className="mx-auto max-w-5xl px-4 py-4 text-center text-xs text-gray-600">
            All times in UTC · Data from Bad API · Reaktor 2026 Homework
          </div>
        </footer>
      </body>
    </html>
  );
}