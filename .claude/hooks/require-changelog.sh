#!/bin/bash
# PreToolUse hook: enforce the CLAUDE.md changelog-discipline rule.
#
# Blocks a `git commit` when code/config/data is staged but CLAUDE.md is not,
# so the Changelog can't drift out of date. Reads the PreToolUse event JSON on
# stdin; exit 2 blocks the tool call and surfaces the reason to Claude.
set -euo pipefail

input="$(cat)"
command="$(printf '%s' "$input" | jq -r '.tool_input.command // ""')"

# Only act on git commit invocations.
if ! printf '%s' "$command" | grep -Eq 'git[[:space:]]+commit'; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

staged="$(git diff --cached --name-only 2>/dev/null || true)"

# Nothing staged (e.g. --amend message-only or --allow-empty): let git proceed.
[ -z "$staged" ] && exit 0

# CLAUDE.md is staged: rule satisfied.
if printf '%s\n' "$staged" | grep -qx 'CLAUDE.md'; then
  exit 0
fi

# Otherwise block.
echo "BLOCKED: CLAUDE.md is not staged. Per the changelog-discipline rule in CLAUDE.md, every commit that changes code/config/data must update the Changelog section in the SAME commit. Add a dated entry and \`git add CLAUDE.md\` before committing." >&2
exit 2
