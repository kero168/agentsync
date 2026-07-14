# Project Overview

Acme Widgets is a TypeScript service that manages the widget catalog and
inventory for the Acme storefront. It exposes a REST API consumed by the
web storefront and internal admin tools.

Key directories:

- `src/api` — HTTP handlers
- `src/db` — database access layer
- `src/domain` — business logic, framework-agnostic
