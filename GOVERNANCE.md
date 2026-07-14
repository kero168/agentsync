# Governance

agentsync is currently a **BDFL-style, single-maintainer project**. This
document describes how decisions are made today and how governance is
expected to evolve as the project grows.

## Roles

### Maintainer

Maintainers have merge access and publish rights. Today that is the project
creator, [kero168](https://github.com/kero168) — see
[MAINTAINERS.md](./MAINTAINERS.md) for the current list. Maintainers are
responsible for:

- Reviewing and merging pull requests.
- Triaging issues.
- Cutting releases (see [CONTRIBUTING.md](./CONTRIBUTING.md#release-process)).
- Upholding the [Code of Conduct](./CODE_OF_CONDUCT.md).

### Contributor

Anyone who opens an issue, submits a pull request, or participates in
discussions. No special access is required.

## Decision making

- **Day-to-day changes** (bug fixes, docs, small features that don't change
  the config schema or add a new adapter): a maintainer may merge after
  normal code review.
- **Larger changes** (new adapters, new commands, breaking config changes):
  should be proposed as an issue first, to build consensus before
  significant implementation work happens.
- **Disagreements** are resolved by discussion; if consensus can't be
  reached, the maintainer(s) make the final call, favoring the
  simplest option consistent with agentsync's scope (see
  [ARCHITECTURE.md](./ARCHITECTURE.md) and [ROADMAP.md](./ROADMAP.md)).

## Becoming a maintainer

Consistent, high-quality contributions (code, review, triage, docs) over
time are the path to a maintainer invitation. There's no fixed threshold —
it's judgment, exercised transparently, by existing maintainers.

## Evolving this document

As agentsync gains more maintainers, we expect this document to move toward
a more formal multi-maintainer model (e.g. lazy consensus, a defined voting
process for breaking changes). Changes to this file itself require a
maintainer PR, called out explicitly as a governance change.
