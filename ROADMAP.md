# Roadmap

This roadmap reflects current intent, not a commitment or a schedule.
Priorities shift based on real-world usage and contributions — see
[GOVERNANCE.md](./GOVERNANCE.md) for how decisions get made, and open an
issue if you'd like to influence it.

## Now (0.1.x)

- Gather feedback on the config schema (`agentsync.config.yaml`) and the
  four built-in adapters (Claude Code, AGENTS.md, Cursor, Gemini CLI) from
  real projects before locking anything in as 1.0-stable.
- Harden edge cases in `agentsync check`/`diff` (symlinked output paths,
  very large rule sets, Windows path handling).

## Next (0.2.x)

- Additional target adapters based on demand — candidates include Windsurf,
  GitHub Copilot's repository custom instructions, and Aider's conventions
  file. Each ships only once it has a maintainer willing to keep it
  accurate as the upstream tool evolves (see `ARCHITECTURE.md` for what
  "shipping an adapter" involves).
- `agentsync build --watch` for local development.
- Per-target rule filtering (e.g. a fragment that should only appear in
  `CLAUDE.md`, not in every target).

## Later (pre-1.0)

- A documented plugin mechanism for adapters distributed as separate npm
  packages, rather than only adapters built into this repository.
- Config schema validation with machine-readable error locations (line/column)
  for editor integration.
- Formal JSON Schema for `agentsync.config.yaml`, published for editor
  autocomplete.

## 1.0

- Config schema (`version: 1`) frozen for backward compatibility, with a
  documented migration path for any future `version: 2`.
- Adapter API (`TargetAdapter`) frozen as a public extension point.

## Explicitly out of scope (for now)

- Any network calls, telemetry, or "cloud sync" of rules — agentsync stays
  a local, offline tool by design.
- Two-way sync (editing a generated `CLAUDE.md` and having it write back to
  `rules/`). Generated files are intentionally one-directional and
  marked "do not edit" to keep the mental model simple.

Have a use case this roadmap doesn't cover? Open an issue.
