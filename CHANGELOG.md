# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
(pre-1.0, so minor versions may include breaking changes — see
[ROADMAP.md](./ROADMAP.md) for the plan toward 1.0).

## [0.1.0] - 2026-07-14

Initial public release.

### Added

- `agentsync init` — scaffold `agentsync.config.yaml` and a starter `rules/`
  directory (`00-overview.md`, `10-coding-style.md`, `20-testing.md`).
- `agentsync build` — render every enabled target from config + rule
  fragments and write the output files.
- `agentsync check` — verify generated files are in sync with source;
  exits `1` on drift, suitable for CI.
- `agentsync diff` — show a unified-style diff of what `build` would
  change, without writing anything.
- Built-in adapters for four targets: Claude Code (`CLAUDE.md`), the
  [AGENTS.md](https://agents.md) standard (`AGENTS.md`), Cursor
  (`.cursor/rules/agentsync.mdc`), and Gemini CLI (`GEMINI.md`).
- Adapter pattern (`TargetAdapter`) for adding further target formats.
- `--only <ids>` and `-c, --config <path>` flags on `build`/`check`/`diff`.
- `rulesOrder` config option for pinning rule fragment order.
- Example projects under `examples/`.

[0.1.0]: https://github.com/kero168/agentsync/releases/tag/v0.1.0
