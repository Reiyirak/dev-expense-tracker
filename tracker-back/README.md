# Tracker Back — Phase 2 (Reserved)

This folder will hold the **ASP.NET Core Web API** for the Dev Expense Tracker.

> **Do not scaffold this project yet.** Finish the Angular curriculum in `../tracker-front/docs/curriculum.md` first. Phase 2 starts when you say you're done.

## Planned stack

- .NET 8+ (LTS)
- ASP.NET Core Web API — Controllers or Minimal APIs (your call)
- Entity Framework Core with SQLite
- No auth (single-user personal app)

## REST contract the frontend will assume

See `../tracker-front/docs/curriculum.md` → "Future: .NET Backend Integration (Phase 2 Preview)" for the full table.

| Method | Path | Body | Returns | Maps to store mutator |
|---|---|---|---|---|
| `GET` | `/api/expenses` | — | `Expense[]` | initial hydration |
| `POST` | `/api/expenses` | `ExpenseDraft` | `Expense` | `addExpense` |
| `PUT` | `/api/expenses/{id}` | `Expense` | `Expense` | `updateExpense` |
| `DELETE` | `/api/expenses/{id}` | — | `204` | `removeExpense` |

## Integration notes for when Phase 2 starts

- Dev URL: `https://localhost:5001` (ASP.NET Core default with `launchSettings.json`)
- Angular dev proxy: `tracker-front/proxy.conf.json` forwarding `/api/*` → `https://localhost:5001`
- CORS: not needed in dev (proxy handles it); needed only if you bypass the proxy
- The frontend reads `apiBaseUrl: '/api'` from `environment.ts` — change one string to repoint

## Folder sketch (what Phase 2 will create)

```
tracker-back/
├── TrackerBack.sln
├── src/
│   ├── TrackerBack.Api/           ← ASP.NET Core Web API project
│   │   ├── Controllers/
│   │   │   └── ExpensesController.cs
│   │   ├── Program.cs
│   │   └── appsettings.json
│   └── TrackerBack.Domain/        ← Entities + DTOs (optional split)
│       └── Expense.cs
└── tests/
    └── TrackerBack.Tests/         ← xUnit + WebApplicationFactory
```
