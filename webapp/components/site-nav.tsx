'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { chapters } from '../lib/course-data';

const primaryNav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/ai', label: 'AI Chat' },
  { href: '/domains', label: 'Domains' },
  { href: '/practice', label: 'Practice' },
];

const reviewNav = [
  { href: '/review/acronyms', label: 'Acronym Flashcards', badge: 'A', icon: '🗂' },
  { href: '/review/terminology', label: 'Terminology', badge: 'T', icon: '📘' },
  { href: '/practice', label: 'Practice Quiz', badge: 'Q', icon: '📝' },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function PrimaryNavLinks({
  pathname,
  mobile = false,
}: {
  pathname: string;
  mobile?: boolean;
}) {
  return primaryNav.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={
        mobile
          ? `mobile-nav__link ${isActive(pathname, item.href) ? 'mobile-nav__link--active' : ''}`
          : `nav-link ${isActive(pathname, item.href) ? 'nav-link--active' : ''}`
      }
    >
      {item.label}
    </Link>
  ));
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar__badge">CY0-001</div>
      <h1 className="sidebar__title">SecAIPlus Study Buddy</h1>
      <p className="sidebar__subtitle">CompTIA SecAI+ exam prep</p>

      <nav className="nav-group">
        <div className="nav-group__label">Overview</div>
        <PrimaryNavLinks pathname={pathname} />
      </nav>

      <nav className="nav-group">
        <div className="nav-group__label">Domains</div>
        {chapters.map((chapter) => {
          const href = `/chapters/${chapter.slug}/topics`;
          return (
            <Link
              key={chapter.slug}
              href={href}
              className={`nav-link ${isActive(pathname, `/chapters/${chapter.slug}`) ? 'nav-link--active' : ''}`}
            >
              <span className="nav-link__badge">D{chapter.number}</span>
              <span>{chapter.title}</span>
            </Link>
          );
        })}
      </nav>

      <nav className="nav-group">
        <div className="nav-group__label">Review</div>
        {reviewNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link nav-link--review ${active ? 'nav-link--review-active' : ''}`}
            >
              <span className={`review-link__icon ${active ? 'review-link__icon--active' : ''}`}>
                {active ? item.badge : item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileToolbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <>
      <nav className="mobile-nav" aria-label="Primary navigation">
        <button
          type="button"
          className="mobile-nav__menu-btn"
          aria-expanded={drawerOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={drawerOpen ? 'Close menu' : 'Open full navigation including chapters'}
          onClick={() => setDrawerOpen((o) => !o)}
        >
          <span className="mobile-nav__menu-icon" aria-hidden>
            {drawerOpen ? '✕' : '☰'}
          </span>
        </button>
        <div className="mobile-nav__links">
          <PrimaryNavLinks pathname={pathname} mobile />
        </div>
      </nav>

      {drawerOpen ? (
        <>
          <div
            className="mobile-drawer-overlay"
            role="presentation"
            aria-hidden
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            id="mobile-nav-drawer"
            className="mobile-drawer"
            aria-label="Full site navigation"
          >
            <div className="mobile-drawer__header">
              <div>
                <div className="mobile-drawer__badge">CY0-001</div>
                <h2 className="mobile-drawer__title">SecAIPlus Study Buddy</h2>
                <p className="mobile-drawer__subtitle">CompTIA SecAI+ exam prep</p>
              </div>
              <button
                type="button"
                className="mobile-drawer__close"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
              >
                ×
              </button>
            </div>
            <nav className="mobile-drawer__section">
              <div className="mobile-drawer__label">Overview</div>
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-drawer__link ${isActive(pathname, item.href) ? 'mobile-drawer__link--active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <nav className="mobile-drawer__section">
              <div className="mobile-drawer__label">Domains</div>
              {chapters.map((chapter) => {
                const href = `/chapters/${chapter.slug}/topics`;
                return (
                  <Link
                    key={chapter.slug}
                    href={href}
                    className={`mobile-drawer__link mobile-drawer__link--chapter ${isActive(pathname, `/chapters/${chapter.slug}`) ? 'mobile-drawer__link--active' : ''}`}
                  >
                    <span className="mobile-drawer__ch-num">D{chapter.number}</span>
                    <span>{chapter.title}</span>
                  </Link>
                );
              })}
            </nav>
            <nav className="mobile-drawer__section">
              <div className="mobile-drawer__label">Review</div>
              {reviewNav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mobile-drawer__link mobile-drawer__link--chapter mobile-drawer__link--review ${active ? 'mobile-drawer__link--review-active' : ''}`}
                  >
                    <span className={`mobile-drawer__ch-num mobile-drawer__review-icon ${active ? 'mobile-drawer__review-icon--active' : ''}`}>
                      {active ? item.badge : item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      ) : null}
    </>
  );
}
