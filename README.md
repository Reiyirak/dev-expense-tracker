# Dev Expense Tracker

Personal expense tracker for development tools and services — categories: **hosting, APIs, domains, courses**.

## Layout

```
dev-expense-tracker/
├── tracker-front/        ← Angular 22 application
└── tracker-back/         ← ASP.NET Core Web API (Phase 2)
```

The two apps are siblings on purpose:

- `tracker-front` never imports from `tracker-back` — they communicate over REST.
- A dev proxy (`proxy.conf.json`) forwards `/api/*` from the Angular dev server to the .NET dev server.
- Each app runs independently; together they form the full app.

## Status

- **tracker-front:** in progress. See `tracker-front/docs/curriculum.md`.
- **tracker-back:** reserved. Scaffolded after the Angular curriculum is finished.

## Conventions

- One repo, two apps. No monorepo tooling (Nx / Turborepo) needed — folders are enough.
- Each app has its own `README.md`, its own dependencies, its own build pipeline.
- A `proxy.conf.json` in `tracker-front/` is the only cross-app config — committed, not generated.
