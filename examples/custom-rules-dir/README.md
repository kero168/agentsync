# Example: custom-rules-dir

Demonstrates two things the "basic" example doesn't:

1. A non-default rules directory (`sources.rulesDir: guidelines` instead of `rules/`).
2. Disabling targets you don't use — Cursor and Gemini are `enabled: false`
   here, so `agentsync build` only writes `CLAUDE.md` and `AGENTS.md`.

`rulesOrder` only pins `overview.md` first; `security.md` isn't listed, so
it's appended afterwards in alphabetical order. Run `agentsync build --only claude`
to generate just one target regardless of what's enabled in config.
