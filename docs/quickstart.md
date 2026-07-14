# Quickstart

This walks through setting up agentsync in a new or existing project.

## 1. Install

```bash
npm install --save-dev agentsync-cli
```

Or use it without installing, via `npx agentsync-cli <command>`. The rest
of this guide assumes a local install and uses the shorter `npx agentsync`
form once it's in `node_modules/.bin`.

## 2. Initialize

From your project root:

```bash
npx agentsync init
```

This creates:

```
agentsync.config.yaml
rules/
  00-overview.md
  10-coding-style.md
  20-testing.md
```

Pass `--name <project-name>` to set the project name up front, or `--force`
to overwrite an existing `agentsync.config.yaml`.

## 3. Edit your rules

Open the generated files under `rules/` and replace the placeholder text
with real guidance for your project — architecture notes, coding
conventions, testing expectations, anything you'd otherwise put in
`CLAUDE.md` by hand. Each file's leading `# Heading` becomes a section
heading in every generated target file.

Add more fragments freely, e.g. `rules/30-git-workflow.md`. By default,
files are included in alphabetical order; pin an explicit order in
`agentsync.config.yaml` under `rulesOrder` if you want fragments in a
specific sequence regardless of filename.

## 4. Build

```bash
npx agentsync build
```

This generates every target enabled in `agentsync.config.yaml`:
`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/agentsync.mdc`, and `GEMINI.md` by
default. Commit these files — they're meant to be read by your AI coding
assistants directly from the repo, not regenerated at tool-invocation time.

To generate only some targets, e.g. while iterating on wording:

```bash
npx agentsync build --only claude
```

## 5. Verify with check

```bash
npx agentsync check
```

Exits `0` if every generated file matches what `agentsync build` would
produce right now, or `1` if anything has drifted (someone hand-edited a
generated file, or edited `rules/`/`agentsync.config.yaml` without
rebuilding). Add this to CI so drift gets caught in review, not discovered
by a confused teammate three weeks later:

```yaml
# .github/workflows/ci.yml
- run: npx agentsync check
```

## 6. Inspect drift with diff

If `check` fails, `diff` shows exactly what changed:

```bash
npx agentsync diff
```

Then run `agentsync build` to apply the change, or fix `rules/` /
`agentsync.config.yaml` if the diff shows something unintended.

## Where to go next

- [README.md](../README.md) for the full command and configuration
  reference, and a feature comparison with similar tools.
- [ARCHITECTURE.md](../ARCHITECTURE.md) to add a new target adapter.
- [examples/](../examples) for complete, working configurations.
