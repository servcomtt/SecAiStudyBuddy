# ──────────────────────────────────────────────────────────────────────────────
# Study Buddy — Lab Orchestrator Container
# ──────────────────────────────────────────────────────────────────────────────
# Runs the Node.js orchestrator that manages Docker lab containers.
# Must be started with access to the Docker socket:
#   docker run -v /var/run/docker.sock:/var/run/docker.sock ...
# ──────────────────────────────────────────────────────────────────────────────

FROM node:22-slim

# ── App directory ─────────────────────────────────────────────────────────────

WORKDIR /app

# Install dependencies before copying source so the layer is cached
COPY package.json ./
RUN npm install --omit=dev

# Copy source
COPY server.js ./

# ── Runtime ───────────────────────────────────────────────────────────────────

# Non-root user (Docker socket access requires supplemental group — handled in compose)
RUN useradd -m -u 1001 orchestrator
USER orchestrator

EXPOSE 3002

ENV NODE_ENV=production

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3002/health', r => r.statusCode===200 ? process.exit(0) : process.exit(1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
