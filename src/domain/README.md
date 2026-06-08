# Domain Layer

Pure business types, entities, validation schemas, and **interfaces** (contracts).

- `entities/` — plain TypeScript types/classes that represent core business objects (User, Category, Product, Quote, SiteContent).
- `schemas/` — Zod validation schemas (input validation for forms and API).
- `interfaces/` — repository and service contracts. The application layer depends on these abstractions (Dependency Inversion).

**Rule:** This layer must not import from `application/` or `infrastructure/`.
