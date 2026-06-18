/**
 * Copy this file to sb-ollama-config.js and set your HTTPS Ollama base URL.
 * sb-ollama-config.js is gitignored — do not commit real URLs for public tunnels.
 *
 * Load before other app scripts in index.html:
 *   <script src="sb-ollama-config.js"></script>
 *
 * See docs/OLLAMA_HTTPS.md
 */
window.SB_OLLAMA_URL = 'https://YOUR-TUNNEL-OR-PROXY.example.com';

// Optional — free ngrok interstitial bypass (see docs/OLLAMA_HTTPS.md)
// window.SB_OLLAMA_FETCH_HEADERS = { 'ngrok-skip-browser-warning': 'true' };
