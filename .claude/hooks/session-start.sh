#!/bin/bash
# SessionStart hook for Strata.
# Ensures Node dependencies are installed so the agent can immediately run
# `npm run lint`, `npm run typecheck` and `npm run build` in web sessions.
set -euo pipefail

# Only run in Claude Code on the web (remote) environments.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Idempotent: npm install is a no-op when node_modules is already in sync,
# and benefits from the container's post-hook state caching.
echo "[session-start] Installing npm dependencies..."
npm install --no-audit --no-fund

echo "[session-start] Dependencies ready. Run: npm run lint | typecheck | build"
