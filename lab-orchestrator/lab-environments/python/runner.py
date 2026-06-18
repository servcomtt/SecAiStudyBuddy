#!/usr/bin/env python3
"""
Study Buddy — Lab Runner  v1.0
================================
Tiny HTTP server that runs inside each Docker lab container.
Accepts code-execution and workspace-reset requests from the
Lab Orchestrator, executes them in a sandboxed subprocess, and
returns the results as JSON.

Endpoints
---------
GET  /health        liveness probe
POST /exec          run student code, return {stdout, stderr, exit_code}
POST /reset         wipe /workspace back to empty
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
from http.server import BaseHTTPRequestHandler, HTTPServer

WORKSPACE = '/workspace'
MAX_OUTPUT_BYTES = 16 * 1024   # 16 KB stdout cap
MAX_STDERR_BYTES =  4 * 1024   # 4 KB stderr cap
MAX_TIMEOUT_S    = 60          # hard ceiling regardless of client request


# ── Handler ───────────────────────────────────────────────────────────────────

class LabHandler(BaseHTTPRequestHandler):

    # Suppress the default per-request access log
    def log_message(self, fmt, *args):  # noqa: N802
        pass

    # ── Routing ───────────────────────────────────────────────────────────────

    def do_GET(self):  # noqa: N802
        if self.path == '/health':
            self._json(200, {'status': 'ok'})
        else:
            self._json(404, {'error': 'Not found'})

    def do_POST(self):  # noqa: N802
        body = self._read_body()
        if self.path == '/exec':
            self._handle_exec(body)
        elif self.path == '/reset':
            self._handle_reset()
        else:
            self._json(404, {'error': 'Not found'})

    # ── Exec ──────────────────────────────────────────────────────────────────

    def _handle_exec(self, body):
        code    = body.get('code', '')
        timeout = min(int(body.get('timeout', 30)), MAX_TIMEOUT_S)
        stdin   = body.get('stdin', '') or ''

        if not isinstance(code, str) or not code.strip():
            self._json(400, {'error': 'code must be a non-empty string'})
            return

        # Write code to a temp file inside /workspace so relative file paths work
        fd, fpath = tempfile.mkstemp(suffix='.py', dir=WORKSPACE)
        try:
            with os.fdopen(fd, 'w') as f:
                f.write(code)

            result = subprocess.run(
                [sys.executable, '-u', fpath],
                capture_output=True,
                text=True,
                timeout=timeout,
                input=stdin,
                cwd=WORKSPACE,
                env={
                    **os.environ,
                    # Ensure deterministic locale and unbuffered output
                    'PYTHONUNBUFFERED': '1',
                    'PYTHONDONTWRITEBYTECODE': '1',
                    'LANG': 'C.UTF-8',
                    'LC_ALL': 'C.UTF-8'
                }
            )
            self._json(200, {
                'stdout':    result.stdout[:MAX_OUTPUT_BYTES],
                'stderr':    result.stderr[:MAX_STDERR_BYTES],
                'exit_code': result.returncode
            })

        except subprocess.TimeoutExpired:
            self._json(200, {
                'stdout':    '',
                'stderr':    f'TimeoutError: execution exceeded {timeout}s',
                'exit_code': 124   # UNIX timeout exit code convention
            })

        except Exception as exc:
            self._json(500, {
                'stdout':    '',
                'stderr':    str(exc),
                'exit_code': 1
            })

        finally:
            try:
                os.unlink(fpath)
            except OSError:
                pass

    # ── Reset ─────────────────────────────────────────────────────────────────

    def _handle_reset(self):
        """Remove every file and directory inside /workspace."""
        try:
            for name in os.listdir(WORKSPACE):
                full = os.path.join(WORKSPACE, name)
                if os.path.isfile(full) or os.path.islink(full):
                    os.unlink(full)
                elif os.path.isdir(full):
                    shutil.rmtree(full)
            self._json(200, {'ok': True})
        except Exception as exc:
            self._json(500, {'error': str(exc)})

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {}

    def _json(self, status, data):
        payload = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    os.makedirs(WORKSPACE, exist_ok=True)
    server = HTTPServer(('0.0.0.0', 8080), LabHandler)
    print('Lab runner ready on :8080', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('Lab runner shutting down.', flush=True)
