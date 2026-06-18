'use strict';

/**
 * Guards against regressions: primary mobile/main toolbars stay at the top
 * (study-spa #bottom-nav, webapp .mobile-nav).
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function firstBracedBlock(source, needle) {
  const i = source.indexOf(needle);
  assert.ok(i >= 0, `expected to find ${JSON.stringify(needle)}`);
  const open = source.indexOf('{', i);
  assert.ok(open >= 0);
  let depth = 0;
  for (let j = open; j < source.length; j += 1) {
    const c = source[j];
    if (c === '{') depth += 1;
    if (c === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(open + 1, j);
      }
    }
  }
  throw new Error('unclosed CSS block');
}

test('study-spa #bottom-nav is fixed to the top, not the viewport bottom', () => {
  const filePath = path.join(__dirname, '..', 'content', 'study-spa', 'index.html');
  const html = fs.readFileSync(filePath, 'utf8');
  const block = firstBracedBlock(html, '#bottom-nav {');
  assert.match(block, /\bposition:\s*fixed\b/);
  assert.match(block, /\btop:\s*0\b/);
  assert.ok(!/\bbottom:\s*0\b/.test(block), '#bottom-nav must not pin to bottom: 0');
});

test('webapp .mobile-nav uses fixed top in the narrow layout breakpoint', () => {
  const filePath = path.join(__dirname, '..', 'webapp', 'app', 'globals.css');
  const css = fs.readFileSync(filePath, 'utf8');
  const breakpoint = css.indexOf('@media (max-width: 860px)');
  assert.ok(breakpoint >= 0, 'expected max-width 860px breakpoint');
  const fromBp = css.slice(breakpoint);
  const block = firstBracedBlock(fromBp, '.mobile-nav {');
  assert.match(block, /\bposition:\s*fixed\b/);
  assert.match(block, /\btop:\s*0\b/);
  assert.ok(!/\bbottom:\s*0\b/.test(block), '.mobile-nav must not pin to bottom: 0');
});

test('webapp root layout lists MobileToolbar before topbar', () => {
  const filePath = path.join(__dirname, '..', 'webapp', 'app', 'layout.tsx');
  const src = fs.readFileSync(filePath, 'utf8');
  const tMobile = src.indexOf('<MobileToolbar');
  const tTop = src.indexOf('<header className="topbar"');
  assert.ok(tMobile >= 0 && tTop >= 0);
  assert.ok(tMobile < tTop, 'MobileToolbar should render above the top bar');
});
