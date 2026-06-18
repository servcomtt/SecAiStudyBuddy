import { test, expect } from '@playwright/test';

import {
  OLLAMA_TIMEOUT,
  OLLAMA_UPSTREAM,
} from '../lib/upstream-errors';

/** GET /api/chat — enough for AiChat to enable the composer (mirrors successful health). */
function healthyChatGetJson() {
  return JSON.stringify({
    available: true,
    model: 'e2e-model',
    modelInstalled: true,
    installedModels: ['e2e-model'],
    error: null,
  });
}

/**
 * POST error bodies mirror app/api/chat (429) and lib/api-error-map (502/504 from Ollama proxy).
 * Keep strings in sync when changing those modules.
 */
const RATE_LIMIT_POST_BODY = {
  error: 'Too many chat requests. Please wait a moment and try again.',
  code: 'RATE_LIMIT',
  requestId: 'e2e-rate-limit',
} as const;

const TIMEOUT_POST_BODY = {
  requestId: 'e2e-504',
  code: OLLAMA_TIMEOUT,
  error:
    'The AI service took too long to respond. Please try again with a shorter question.',
  hint: 'If this keeps happening, check that Ollama is running and not overloaded.',
} as const;

const UPSTREAM_POST_BODY = {
  requestId: 'e2e-502',
  code: OLLAMA_UPSTREAM,
  error: 'Connection to Ollama failed (e2e mock).',
  hint: 'Confirm Ollama is running and OLLAMA_MODEL is installed (`ollama list`).',
} as const;

async function mockApiChat(
  page: import('@playwright/test').Page,
  post: { status: number; body: Record<string, unknown>; headers?: Record<string, string> },
) {
  await page.route((url) => url.pathname === '/api/chat', async (route) => {
    const req = route.request();
    if (req.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: healthyChatGetJson(),
      });
      return;
    }
    if (req.method() === 'POST') {
      await route.fulfill({
        status: post.status,
        contentType: 'application/json',
        headers: post.headers ?? {},
        body: JSON.stringify(post.body),
      });
      return;
    }
    await route.continue();
  });
}

test.describe('AI smoke — home to Study chat', () => {
  test('redirects / to dashboard, then opens AI Chat', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByRole('link', { name: /^AI Chat$/ }).click();
    await expect(page).toHaveURL(/\/ai$/);
    await expect(
      page.getByRole('heading', { level: 3, name: 'Study chat' }),
    ).toBeVisible();
    await expect(page.getByText('Local AI', { exact: true })).toBeVisible();
  });

  test('/ai loads Study chat and shows status region', async ({ page }) => {
    await page.goto('/ai');
    await expect(page.getByRole('heading', { name: 'Study chat' })).toBeVisible();
    await expect(page.locator('.ai-status-banner')).toBeVisible();
  });
});

test.describe('AI /api/chat error states (mocked fetch)', () => {
  test('429: JSON shape + rate-limit copy in UI', async ({ page }) => {
    const postResponse = page.waitForResponse(
      (res) =>
        res.url().includes('/api/chat') &&
        res.request().method() === 'POST' &&
        res.status() === 429,
    );

    await mockApiChat(page, {
      status: 429,
      headers: { 'Retry-After': '60' },
      body: { ...RATE_LIMIT_POST_BODY },
    });

    await page.goto('/ai');
    await page.locator('#ai-chat-input').fill('Hello from e2e');
    await expect(page.getByRole('button', { name: 'Send' })).toBeEnabled();
    await page.getByRole('button', { name: 'Send' }).click();

    const res = await postResponse;
    expect(res.headers()['retry-after']).toBe('60');
    const json = (await res.json()) as Record<string, unknown>;
    expect(json).toMatchObject({
      error: RATE_LIMIT_POST_BODY.error,
      code: 'RATE_LIMIT',
      requestId: RATE_LIMIT_POST_BODY.requestId,
    });
    expect(Object.keys(json).sort()).toEqual(['code', 'error', 'requestId'].sort());

    await expect(page.locator('.ai-chat-error').first()).toContainText(
      'Too many chat requests',
    );
  });

  test('504: JSON shape + friendly timeout copy', async ({ page }) => {
    const postResponse = page.waitForResponse(
      (res) =>
        res.url().includes('/api/chat') &&
        res.request().method() === 'POST' &&
        res.status() === 504,
    );

    await mockApiChat(page, { status: 504, body: { ...TIMEOUT_POST_BODY } });

    await page.goto('/ai');
    await page.locator('#ai-chat-input').fill('Trigger 504');
    await page.getByRole('button', { name: 'Send' }).click();

    const res = await postResponse;
    const json = (await res.json()) as Record<string, unknown>;
    expect(json).toMatchObject({
      requestId: TIMEOUT_POST_BODY.requestId,
      code: OLLAMA_TIMEOUT,
      error: TIMEOUT_POST_BODY.error,
      hint: TIMEOUT_POST_BODY.hint,
    });
    expect(Object.keys(json).sort()).toEqual(['code', 'error', 'hint', 'requestId'].sort());

    await expect(page.locator('.ai-chat-error').first()).toContainText(
      'took too long',
    );
  });

  test('502: JSON shape + error banner shows message', async ({ page }) => {
    const postResponse = page.waitForResponse(
      (res) =>
        res.url().includes('/api/chat') &&
        res.request().method() === 'POST' &&
        res.status() === 502,
    );

    await mockApiChat(page, { status: 502, body: { ...UPSTREAM_POST_BODY } });

    await page.goto('/ai');
    await page.locator('#ai-chat-input').fill('Trigger 502');
    await page.getByRole('button', { name: 'Send' }).click();

    const res = await postResponse;
    const json = (await res.json()) as Record<string, unknown>;
    expect(json).toMatchObject({
      requestId: UPSTREAM_POST_BODY.requestId,
      code: OLLAMA_UPSTREAM,
      error: UPSTREAM_POST_BODY.error,
      hint: UPSTREAM_POST_BODY.hint,
    });
    expect(Object.keys(json).sort()).toEqual(['code', 'error', 'hint', 'requestId'].sort());

    await expect(page.locator('.ai-chat-error').first()).toContainText(
      'Connection to Ollama failed',
    );
  });
});
