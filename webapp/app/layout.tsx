import Link from 'next/link';
import type { Viewport } from 'next';

import { StudyBuddyAskPopup } from '../components/study-buddy-ask-popup';
import { MobileToolbar, SidebarNav } from '../components/site-nav';
import { appMeta } from '../lib/course-data';
import './globals.css';

export const metadata = {
  title: 'SecAIPlus Study Buddy',
  description: 'CompTIA SecAI+ study companion with chapters, drills, quizzes, labs, and AI help.',
};

/** Mobile web: device width, notched safe areas (Apple HIG), readable initial scale. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <StudyBuddyAskPopup />
          <SidebarNav />
          <MobileToolbar />
          <main className="main-shell">
            <header className="topbar">
              <div>
                <p className="eyebrow">Study workspace</p>
                <h1>{appMeta.title}</h1>
              </div>
              <Link
                href="/dashboard"
                className="topbar__button topbar__button--layout-dashboard"
              >
                Dashboard
              </Link>
            </header>
            <div className="page-shell">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
