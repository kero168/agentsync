# Security Policy

## Supported versions

agentsync is pre-1.0. Security fixes are made against the latest published
`0.x` release on npm. Once 1.0 ships, this table will be updated to reflect
a proper support window.

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |
| < 0.1 | No |

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, use GitHub's private vulnerability reporting for this repository
(the "Security" tab → "Report a vulnerability"), which opens a private
advisory visible only to maintainers. If that isn't available to you, open
a regular issue asking a maintainer to reach out to you for a private
channel, without including exploit details.

Please include:

- A description of the vulnerability and its potential impact.
- Steps to reproduce, or a minimal proof-of-concept `agentsync.config.yaml` /
  `rules/` setup if relevant.
- The agentsync version (`agentsync --version`) and Node.js version.

We aim to acknowledge new reports within 5 business days, and to release a
fix or mitigation, or provide a clear timeline, within 30 days for
confirmed issues.

## Scope and threat model

agentsync is a local, offline CLI: it reads `agentsync.config.yaml` and
Markdown files under `rules/`, and writes generated files to disk. It makes
no network requests and executes no external commands or user-supplied
code. The realistic security surface is therefore narrow — primarily:

- Path handling (`output:` paths, `--config`, `init <directory>`) staying
  within the intended project tree.
- YAML parsing of `agentsync.config.yaml` not being usable for code
  execution or resource-exhaustion attacks (we use the `yaml` package's
  safe parsing API, not `eval`-based parsing).

Supply-chain hardening (CodeQL, OpenSSF Scorecard, Dependabot, npm
provenance/OIDC trusted publishing on release) is described in
`.github/workflows/`.
