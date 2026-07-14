# agentsync

**One set of instructions. Every AI coding assistant. Always in sync.**

[![CI](https://github.com/kero168/agentsync/actions/workflows/ci.yml/badge.svg)](https://github.com/kero168/agentsync/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/agentsync-cli.svg)](https://www.npmjs.com/package/agentsync-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node >= 20](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

日本語版 README は [README.ja.md](./README.ja.md) をご覧ください。

## The problem

Every AI coding assistant wants its own project instructions file: Claude
Code reads `CLAUDE.md`, the open [AGENTS.md](https://agents.md) standard is
used by Codex-style agents, Cursor reads rule files under `.cursor/rules/`,
Gemini CLI reads `GEMINI.md` — and the list keeps growing. Hand-maintaining
four near-identical files means they drift the moment someone updates one
and forgets the others.

## The fix

agentsync keeps **one** source of truth — `agentsync.config.yaml` plus
Markdown rule fragments in `rules/` — and generates every tool-specific file
from it. `agentsync check` verifies nothing has drifted, so you can enforce
this in CI the same way you'd enforce a linter.

```
agentsync.config.yaml  +  rules/*.md   ──build──►  CLAUDE.md
                                                     AGENTS.md
                                                     .cursor/rules/agentsync.mdc
                                                     GEMINI.md
```

100% local. No network calls, no telemetry, no external API — agentsync
only reads your config and rule files and writes the generated output.

## Quick start

```bash
npm install --save-dev agentsync-cli
npx agentsync init          # scaffold agentsync.config.yaml + rules/
npx agentsync build         # generate CLAUDE.md, AGENTS.md, Cursor rules, GEMINI.md
npx agentsync check         # exit 1 if generated files are out of sync (CI-friendly)
npx agentsync diff          # show what would change, without writing anything
```

See [docs/quickstart.md](./docs/quickstart.md) for a walkthrough, or browse
a working project in [examples/basic](./examples/basic).

## Commands

| Command | What it does |
| --- | --- |
| `agentsync init [dir]` | Scaffolds `agentsync.config.yaml` and a starter `rules/` directory. |
| `agentsync build` | Renders every enabled target from config + rules and writes the files. |
| `agentsync check` | Re-renders in memory and diffs against what's on disk; exits `1` on drift. Designed for CI. |
| `agentsync diff` | Prints a unified-style diff of what `build` would change, without writing anything. |

All four commands accept `-c, --config <path>` (custom config location) and
`--only <ids>` (comma-separated target ids, e.g. `--only claude,cursor`).

## Supported targets

| Target | Adapter id | Output | Format |
| --- | --- | --- | --- |
| Claude Code | `claude` | `CLAUDE.md` | Markdown |
| AGENTS.md standard | `agents` | `AGENTS.md` | Markdown ([agents.md](https://agents.md)) |
| Cursor | `cursor` | `.cursor/rules/agentsync.mdc` | Markdown + YAML frontmatter |
| Gemini CLI | `gemini` | `GEMINI.md` | Markdown |

New targets are added by implementing a small `TargetAdapter` interface and
registering it — see [ARCHITECTURE.md](./ARCHITECTURE.md) for the extension
points and a worked example.

## Configuration

```yaml
version: 1

project:
  name: my-project
  description: "Coding guidelines shared by every AI assistant on this project."

sources:
  rulesDir: rules

rulesOrder:            # optional; unlisted files are appended alphabetically
  - 00-overview.md
  - 10-coding-style.md
  - 20-testing.md

targets:
  claude:
    enabled: true
    output: CLAUDE.md
  agents:
    enabled: true
    output: AGENTS.md
  cursor:
    enabled: true
    output: .cursor/rules/agentsync.mdc
  gemini:
    enabled: true
    output: GEMINI.md
```

Rule fragments are plain Markdown files. A leading `# Heading` becomes the
section title in every generated file; otherwise the title is derived from
the filename.

## CI usage

```yaml
# .github/workflows/ci.yml (excerpt)
- run: npx agentsync check
```

`agentsync check` exits non-zero the moment `CLAUDE.md`, `AGENTS.md`, the
Cursor rule file, or `GEMINI.md` no longer match `agentsync.config.yaml` +
`rules/*.md` — the same drift-detection pattern as `prettier --check` or
`terraform plan -detailed-exitcode`.

## Comparison with similar tools

[ruler](https://github.com/intellectronica/ruler) solves a closely related
problem — centralizing instructions for multiple AI coding agents — and is
worth evaluating alongside agentsync. The table below is a good-faith,
feature-level comparison based on each project's public documentation; it
does not include adoption metrics, since we have no reliable way to verify
those from this repository. Please check each project's own repository for
the current, authoritative feature set before deciding.

| | agentsync | ruler |
| --- | --- | --- |
| Single source of truth | `agentsync.config.yaml` + `rules/*.md` fragments | A central rules directory |
| Target format | Pluggable adapters (this repo ships 4) | Multiple agent formats supported |
| Drift detection (`check`, CI exit code) | Yes, first-class command | Not the primary focus |
| Diff preview before writing | Yes (`agentsync diff`) | Varies by version |
| Runtime dependencies | Minimal (`commander`, `yaml`, `picocolors`) | See upstream `package.json` |
| Network/telemetry | None | See upstream docs |
| License | MIT | See upstream `LICENSE` |

If you rely on an agent format agentsync doesn't ship yet, or your workflow
centers on a feature this table doesn't capture, ruler (or another tool) may
be a better fit today — agentsync's adapter system is designed so that gap
can close over time. Corrections to this table are welcome via PR.

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md). Please
also read our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](./SECURITY.md) for how to report a vulnerability.

## License

[MIT](./LICENSE) © 2026 kero168
