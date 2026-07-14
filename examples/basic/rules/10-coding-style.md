# Coding Style

- TypeScript strict mode is on; do not add `any` without a comment explaining why.
- Business logic lives in `src/domain` and must not import from `src/api`.
- Prefer pure functions in `src/domain`; push side effects to the edges.
- Run `npm run lint` before proposing a change is complete.
