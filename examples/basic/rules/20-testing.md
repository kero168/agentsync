# Testing

- Every bug fix needs a regression test.
- Domain logic: unit tests only, no database or network access.
- API handlers: integration tests against a test database.
- Run `npm test` locally; CI will re-run the full suite on every PR.
