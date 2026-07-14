# Example: basic

A minimal but complete agentsync project: one `agentsync.config.yaml`, four
rule fragments under `rules/`, and all four built-in targets enabled.

## Try it

From this directory (after installing agentsync globally, or via `npx`):

```bash
npx agentsync-cli build
npx agentsync-cli check
```

`build` generates `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/agentsync.mdc`,
and `GEMINI.md` from `agentsync.config.yaml` and `rules/*.md`. `check` verifies
they're still in sync — this is the command to run in CI.

The generated files in this directory are committed so you can see the
output without running the CLI; regenerate them at any time with `build`.
