'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { STUDY_BUDDY_OPEN_EVENT } from '../lib/study-buddy-events';

import { AiChat } from './ai-chat';

export function StudyBuddyAskPopup() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openPopup = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onExternalOpen = () => openPopup();
    window.addEventListener(STUDY_BUDDY_OPEN_EVENT, onExternalOpen);
    return () => window.removeEventListener(STUDY_BUDDY_OPEN_EVENT, onExternalOpen);
  }, [openPopup]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const layer = (
    <>
      <button
        type="button"
        className="sb-ask-fab"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Ask Your Study Buddy"
        title="Ask Your Study Buddy"
      >
        <span className="sb-ask-fab__glyph" aria-hidden>
          💬
        </span>
        <span className="sb-ask-fab__sr">Ask Your Study Buddy</span>
      </button>

      {open ? (
        <div
          className="sb-ask-overlay"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            className="sb-ask-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sb-ask-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="sb-ask-modal__header">
              <h2 id="sb-ask-title">Ask Your Study Buddy</h2>
              <button
                type="button"
                className="sb-ask-modal__close"
                onClick={close}
                aria-label="Close Study Buddy"
              >
                ×
              </button>
            </header>
            <div className="sb-ask-modal__body">
              <AiChat variant="modal" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(layer, document.body);
}
