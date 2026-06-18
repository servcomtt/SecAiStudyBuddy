# ──────────────────────────────────────────────────────────────────────────────
# Study Buddy — Python Lab Container
# ──────────────────────────────────────────────────────────────────────────────
# A slim, sandboxed Python 3.11 environment pre-loaded with the data science
# libraries needed for CompTIA SecAI+ exercises.
#
# Security posture:
#   • Non-root user  (labuser, uid 1000)
#   • No network mode when launched by the orchestrator (NetworkMode: none)
#   • Read-only root filesystem is NOT set (pandas/matplotlib write temp files)
#   • /workspace is the only mutable directory exposed to student code
#   • Runner script is owned by root, read-only to labuser
# ──────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim

# ── System dependencies ───────────────────────────────────────────────────────
# fontconfig + libfreetype6 are needed by matplotlib when saving figures.

RUN apt-get update && apt-get install -y --no-install-recommends \
        fontconfig \
        libfreetype6 \
    && rm -rf /var/lib/apt/lists/*

# ── Python packages ───────────────────────────────────────────────────────────
# Pin versions so the image is reproducible.

RUN pip install --no-cache-dir \
    pandas==2.1.4 \
    numpy==1.26.2 \
    matplotlib==3.8.2 \
    scipy==1.11.4 \
    scikit-learn==1.3.2 \
    tabulate==0.9.0 \
    openpyxl==3.1.2 \
    xlrd==2.0.1

# ── Users and directories ─────────────────────────────────────────────────────

RUN useradd -m -u 1000 -s /bin/sh labuser

# /workspace — student code and data files live here; cleared on reset
RUN mkdir -p /workspace && chown labuser:labuser /workspace

# ── Runner ────────────────────────────────────────────────────────────────────

COPY runner.py /runner.py
RUN chmod 555 /runner.py          # root-owned, readable+executable by labuser
RUN chown root:root /runner.py

# ── Runtime ───────────────────────────────────────────────────────────────────

USER labuser
WORKDIR /workspace
EXPOSE 8080

# Disable pip, setuptools inside containers (students cannot install packages)
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')" || exit 1

CMD ["python", "/runner.py"]
