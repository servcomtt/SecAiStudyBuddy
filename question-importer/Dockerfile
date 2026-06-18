FROM node:22-slim

# canvas native build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

# Writable dirs for uploads and image extraction results
RUN mkdir -p /tmp/qimport-uploads /tmp/qimport-results \
 && chown -R node:node /tmp/qimport-uploads /tmp/qimport-results /app

USER node

ENV IMPORTER_PORT=3003 \
    UPLOAD_DIR=/tmp/qimport-uploads \
    RESULTS_DIR=/tmp/qimport-results

EXPOSE 3003

HEALTHCHECK --interval=20s --timeout=5s --start-period=15s \
  CMD node -e "fetch('http://localhost:3003/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
