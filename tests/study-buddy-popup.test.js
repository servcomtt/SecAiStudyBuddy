'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Next.js layout mounts StudyBuddyAskPopup for global AI access', () => {
  const layoutPath = path.join(__dirname, '..', 'webapp', 'app', 'layout.tsx');
  const src = fs.readFileSync(layoutPath, 'utf8');
  assert.ok(src.includes('StudyBuddyAskPopup'));
  assert.ok(src.includes('study-buddy-ask-popup'));
});

test('Study SPA includes Ask Your Study Buddy dialog title and launcher', () => {
  const htmlPath = path.join(__dirname, '..', 'content', 'study-spa', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.ok(html.includes('Ask Your Study Buddy'));
  assert.ok(html.includes('id="sb-ask-fab"'));
  assert.ok(html.includes('id="sb-ask-overlay"'));
  assert.ok(html.includes('sbGetOllamaUrls'));
});
