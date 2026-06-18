# Ollama over HTTPS for GitHub Pages / Vercel

## Local LMS (`npm run dev`, http://localhost:3001)

When you open the study SPA from the Express app on **port 3001**, the browser calls Ollama through a **same-origin proxy** at `/sb-ollama/api/tags` and `/sb-ollama/api/chat`. That avoids **CORS** (a page on `http://localhost:3001` cannot reliably call `http://127.0.0.1:11434` without Ollama’s `OLLAMA_ORIGINS`).

1. Start Ollama on the same machine (`ollama serve` or the Ollama app).
2. Pull a model that matches the app default or your Settings choice, e.g. `ollama pull llama3`.
3. Open **`http://localhost:<PORT>/`** where `<PORT>` is your LMS port (default **3001**, or whatever you set with `PORT=…`). Do not use `file://`.
4. If Ollama listens elsewhere, set **`OLLAMA_BASE_URL`** in `.env` (see `.env.example`).

The study SPA uses the LMS path **`/sb-ollama/*`** for **any** `http://localhost` / `http://127.0.0.1` port when served by Express, so custom ports still avoid browser CORS to `127.0.0.1:11434`.

If you serve the SPA from a **static** server only (no Express), `/sb-ollama` will not exist — use direct Ollama with **`OLLAMA_ORIGINS`**, or **`window.SB_OLLAMA_URL`** / a tunnel as in the HTTPS section below.

---

Sites served as **https://** cannot call **http://127.0.0.1:11434** (mixed content). To use Study Buddy and practice-quiz AI from **github.io** or another HTTPS host, expose Ollama on **https://** and point the app at that base URL.

## 1. Set `window.SB_OLLAMA_URL`

Use the **origin only**, no trailing slash, no `/api` path:

```js
window.SB_OLLAMA_URL = 'https://your-subdomain.example.com';
```

The app will call `{SB_OLLAMA_URL}/api/tags` and `{SB_OLLAMA_URL}/api/chat`.

### How to inject it

**Option A — inline in `index.html` (fork / private deploy)**  
Uncomment and edit the block in `content/study-spa/index.html` inside `<head>` (search for `SB_OLLAMA_URL`).

**Option B — local file (not committed)**  
Copy `content/study-spa/sb-ollama-config.SAMPLE.js` to `sb-ollama-config.js`, set your URL, and add **before** other scripts in `index.html`:

```html
<script src="sb-ollama-config.js"></script>
```

`sb-ollama-config.js` is listed in `.gitignore` so secrets are not pushed by default.

## 2. Put Ollama behind HTTPS (pick one)

### A. Cloudflare Tunnel (free, good for personal use)

On the machine where Ollama runs:

```bash
cloudflared tunnel --url http://127.0.0.1:11434
```

Copy the printed **https://**.trycloudflare.com URL into `SB_OLLAMA_URL`. The URL changes each run unless you configure a named tunnel and DNS.

### B. ngrok

```bash
ngrok http 11434
```

Use the **https** forwarding URL. Free ngrok may inject a browser warning page; API calls may need a skip header. After setting `SB_OLLAMA_URL`, add:

```js
window.SB_OLLAMA_FETCH_HEADERS = { 'ngrok-skip-browser-warning': 'true' };
```

(See [ngrok request headers](https://ngrok.com/docs/http/request-headers/) if the value differs for your account.) If `/api/tags` still fails, try Cloudflare Tunnel or ngrok’s paid tier.

### C. Tailscale Funnel / Serve

If you use Tailscale, **Funnel** or **Serve** can expose `http://127.0.0.1:11434` as HTTPS on a stable hostname. See [Tailscale Serve](https://tailscale.com/kb/1242/tailscale-serve).

### D. Your own reverse proxy (Caddy / nginx)

Terminate TLS on a VPS or home server and `proxy_pass` to `http://127.0.0.1:11434`. Set `SB_OLLAMA_URL` to that public `https://` origin.

## 3. CORS: `OLLAMA_ORIGINS`

Ollama must allow your **study site’s origin** (e.g. `https://you.github.io`). On the Ollama host, set before starting Ollama (syntax may vary by OS):

```bash
# Example: GitHub Pages + tunnel origin — list every origin that should call Ollama from the browser
export OLLAMA_ORIGINS="https://you.github.io,https://your-project.vercel.app,https://xxxx.trycloudflare.com"
```

Restart Ollama after changing this. If the browser console shows CORS errors, add the exact page origin (scheme + host + port).

## 4. Security warning

A public **https://** endpoint to Ollama is effectively **remote access to your model API**. Anyone who can guess or discover the URL may abuse it. Prefer:

- Short-lived tunnel URLs, or  
- Tailscale / VPN-only access, or  
- Proxy auth (API key) in front of Ollama (custom reverse proxy), not covered by this repo.

Do **not** commit real tunnel URLs or tokens in a public repository.

## 5. Vercel static build (`vercel.json`)

The deployed CSP allows `connect-src` to **https:** origins so fetches to your tunnel hostname are not blocked by policy. GitHub Pages does not use `vercel.json`; it typically has no extra CSP unless you add one.
