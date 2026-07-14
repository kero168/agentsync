# Contributing to agentsync

Thanks for considering a contribution! agentsync is a small, focused CLI,
and we'd like to keep it that way — please read this before opening a large
PR.

## Ground rules

- Be respectful; see our [Code of Conduct](./CODE_OF_CONDUCT.md).
- Open an issue before starting significant work (a new adapter, a new
  command, a breaking config change) so we can agree on the approach first.
- Small, focused PRs are much easier to review than large ones.

## Development setup

Requires Node.js >= 20.

```bash
git clone https://github.com/kero168/agentsync.git
cd agentsync
npm install
npm run build
npm test
```

Useful scripts:

| Script | What it does |
| --- | --- |
| `npm run build` | Bundles `src/` to `dist/` with tsup (ESM, with type declarations). |
| `npm test` | Runs the vitest suite once. |
| `npm run test:watch` | Runs vitest in watch mode. |
| `npm run typecheck` | Runs `tsc --noEmit`. |
| `npm run agentsync -- <args>` | Runs the built CLI, e.g. `npm run agentsync -- build`. |

While iterating on the CLI itself, `npm run dev` starts tsup in watch mode.

## Making changes

1. Fork the repo and create a branch off `main`.
2. Write or update tests under `tests/unit` (pure logic) or
   `tests/integration` (multi-step flows, or the actual built binary in
   `tests/integration/cli-binary.test.ts`).
3. Run `npm run build && npm test` and make sure everything passes.
4. Update `CHANGELOG.md` under an "Unreleased" heading if the change is
   user-visible.
5. Open a PR using the pull request template. Explain *why*, not just *what*.

## Adding a new target adapter

Adapters live in `src/adapters/`. Each one implements `TargetAdapter`
(`src/core/types.ts`): an `id`, a `label`, a `defaultOutput` path, and a
`render(ctx)` function that returns the file contents as a string. See
[ARCHITECTURE.md](./ARCHITECTURE.md) for a full walkthrough and register
your adapter in `src/adapters/index.ts`. Please include:

- Unit tests asserting the rendered output for a representative config.
- An entry in the README "Supported targets" table (both `README.md` and
  `README.ja.md`).
- A `CHANGELOG.md` entry.

## Commit messages

Use the imperative mood ("Add cursor adapter", not "Added" or "Adds"). Keep
the subject line under ~72 characters; add detail in the body if needed.

## Reporting bugs / requesting features

Please use the issue templates under `.github/ISSUE_TEMPLATE/`.

## Release process

Maintainers cut releases by tagging a GitHub Release; `.github/workflows/release.yml`
then builds and publishes to npm via OIDC trusted publishing — no long-lived
npm tokens are stored in this repository. See [GOVERNANCE.md](./GOVERNANCE.md)
for who can do this.
