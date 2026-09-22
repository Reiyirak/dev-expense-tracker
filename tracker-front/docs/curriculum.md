# Angular 22 Dev Expense Tracker — Lesson-by-Lesson Curriculum

> **Stack:** Angular CLI · Angular 22 · TypeScript (strict) · Tailwind CSS v4
> **Project:** Dev Expense Tracker (categories: hosting, APIs, domains, courses)
> **Pedagogy:** No spoilers — concept explanations are abstract; you write the app-specific logic. Full HTML/Tailwind templates are provided as the exception so you focus on Angular mechanics, not styling.

---

## How to use this curriculum

1. **Read the "Concepts" section first.** It teaches the syntax shape — not the answer to the lesson's task.
2. **Read the "Build" section second.** This is what *you* implement. There are no full Angular TS solutions here on purpose.
3. **Open `docs/alternatives.md` when a lesson points to it.** That's where the older paradigm lives, fully worked out, alongside the modern approach used in the main codebase.
4. **Templates marked "Provided" are copy-paste ready** HTML + Tailwind. Everything else is yours to write.
5. **Each module ends with a self-check.** Use it before moving on.

---

## Pedagogical rules (locked in)

| Rule | What it means in practice |
|---|---|
| **No spoilers** | I never give you the exact TypeScript that solves the lesson's task. Generic syntax only. |
| **Alternatives documented, not implemented** | When a concept has a legacy + modern form, the modern form goes in `src/`. The legacy form goes in `docs/alternatives.md`. |
| **Templates are an exception** | HTML + Tailwind is given in full so you can stay focused on Angular TS, signal wiring, and form logic. Templates must pass AXE checks and meet WCAG AA minimums. |
| **Follow `AGENTS.md` strictly** | The project's `AGENTS.md` carries Angular's official v22 best-practices. It's authoritative for: `@Service` over `@Injectable({providedIn: 'root'})`, `host` object over `@HostBinding`/`@HostListener`, `class` bindings over `ngClass`, `NgOptimizedImage` over `<img>`, inline templates for small components, no `any` (use `unknown`). When a lesson contradicts it, AGENTS.md wins. |
| **Concepts repeat → skip explanation** | If a concept appeared earlier, a later lesson just says "Use the pattern from Lesson X to do Y." No re-teaching. |

---

## How we'll work together

- **Two environments, one canonical copy.** Windows is the bootstrap environment (where `ng new`, git init, and the first push happen). Arch Linux on WSL2 is where all development happens from Lesson 1.1 onward. Keep the canonical project on the Linux ext4 filesystem (e.g. `~/projects/dev-expense-tracker`) — *not* under `/mnt/c/...` — for filesystem-perf reasons with `node_modules`.
- **Sync before edits.** Before starting each lesson, you'll `git pull` on Linux so your working copy matches the remote. I'll wait for your go-ahead before making file changes.
- **I don't make changes unilaterally.** When you ask me to "update the curriculum", "scaffold X", or "show me how to do Y", I'll propose or apply — but I won't edit files without you telling me to.
- **OS-aware snippets.** PowerShell blocks stay on Windows-only steps (initialization, push). Bash blocks stay on Linux-only steps (clone, dev). Everything else is OS-neutral.
- **Package manager: pnpm.** All examples use `pnpm`. The `ng new` flag `--package-manager=pnpm` makes this the default for new installs; CI/scripts should use `pnpm` too.

### Session management

- **Fork at module boundaries, not at 80%.** Modules 1–5 each end with a self-check — that's the natural pause. A forked session stays tight (~20–30 turns) and refreshes from `docs/curriculum.md`, so it doesn't need to *remember* the whole plan.
- **Root session keeps continuity.** Forks create children, they don't replace the parent. The root session stays for project-wide memory (folder structure, workflow rules, the future .NET plan).
- **Maintain `docs/progress.md`** as a short running log so any forked session has instant orientation:
  ```markdown
  # Progress

  ## Module 1 — status
  - Lessons completed: (none yet)
  - Next: 1.1
  - Notes: —
  ```
  After forking, the new session reads both `docs/curriculum.md` and `docs/progress.md` to ground itself.
- **Escape hatch:** if I start losing the thread — hallucinating earlier decisions, repeating recommendations, slowing down — fork immediately regardless of where you are. Module boundaries are the *default*, not a hard rule.
- **Don't:** fork mid-lesson (kills flow), fork on every question (fragments context), or pre-empt at "exactly 80%" (the number has no meaning to the model's actual context state).

---

## Workspace Layout — `dev-expense-tracker/` monorepo

The project is project-isolated: one folder holds both apps as siblings. No monorepo tooling — plain folders are enough.

```
angular-project/
└── dev-expense-tracker/
    ├── README.md                 ← project entry point
    ├── tracker-front/            ← Angular CLI workspace (ng new runs here)
    │   ├── src/app/
    │   │   ├── expenses/
    │   │   ├── dashboard/
    │   │   ├── budget/
    │   │   └── shared/
    │   ├── docs/
    │   │   ├── curriculum.md
    │   │   └── alternatives.md
    │   └── (Angular CLI files: angular.json, package.json, …)
    └── tracker-back/             ← reserved for the .NET solution (Phase 2)
        └── README.md             ← placeholder until ASP.NET Core is scaffolded
```

**Why this layout?**
- Each app is self-contained: own `README.md`, own dependencies, own build pipeline. Easy to zip, move, or split into separate repos later.
- `tracker-front` and `tracker-back` are siblings — the dev proxy wiring is trivial when both live at the same depth.
- The frontend never imports from `tracker-back/`; in Phase 2 you wire them together with a base URL + a dev proxy.
- The feature folders inside `src/app/` stay exactly as Module 1 specifies — internal layout is unchanged.

**Phase 2 integration (sketch only — covered later):**
- Angular's `ExpenseApi` service talks to a REST API exposed by ASP.NET Core.
- A `proxy.conf.json` in `tracker-front/` forwards `/api/*` to the .NET dev server (`https://localhost:5001`) so there's no CORS noise.
- The `localStorage` persistence from Lesson 2.4 becomes an offline cache, not the source of truth.

---

# Pre-Lesson Checklist — One-Time Setup

> **Do this once, before Lesson 1.1.** Everything after this assumes the workspace is scaffolded, the `docs/` folder is in place, and the dev server boots cleanly. The work spans **two environments**: Windows for bootstrap, Arch Linux on WSL2 for all development from this point on.

## 0. Verify prerequisites

You will install the same toolchain on both sides. Versions must match closely.

### On Windows (PowerShell)

```powershell
node --version         # v20.x or v22.x for Angular 22
pnpm --version         # pnpm 9.x or newer
ng version             # Angular CLI 22.x
git --version
```

If `ng` is not found:

```powershell
npm install -g @angular/cli@22
```

If `pnpm` is not found, install via corepack (bundled with Node.js):

```powershell
corepack enable
corepack prepare pnpm@latest --activate
```

### On Arch Linux (bash, inside WSL2)

```bash
node --version
pnpm --version
git --version
```

If anything is missing, the recommended path is corepack for pnpm and your choice of `nvm` / `fnm` / `volta` for Node:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## 1. Package manager — pnpm (locked in)

The curriculum uses `pnpm` everywhere. This is set during `ng new` via `--package-manager=pnpm`. Don't switch later without good reason; lockfile churn is annoying.

## 2. Scaffold the Angular workspace (Windows only)

This step happens on Windows. Subsequent development happens on Linux.

### 2a. Run `ng new`

From a PowerShell prompt:

```powershell
cd "C:\Users\Pichu\Documents\ColimaSoft\Learning\frontend\angular\angular-project\dev-expense-tracker"

ng new tracker-front `
  --routing `
  --style=css `
  --strict `
  --ssr=false `
  --package-manager=pnpm
```

**Flags explained:**
- `--routing` — generates `app.routes.ts`
- `--style=css` — Tailwind handles styling; we don't need SCSS
- `--strict` — sets `strict: true`, `noImplicitOverride`, `strictTemplates`
- `--ssr=false` — no server-side rendering
- `--package-manager=pnpm` — uses pnpm for installs and lockfile
- (no `--skip-git`) — Angular 22 initializes git + a tailored `.gitignore` for you

**Heads-up:** `ng new` will see `tracker-back/` in the parent and ask to proceed. The new workspace is created *inside* `tracker-front/`, so it's safe to confirm.

### 2b. Move the `docs/` folder into the new workspace

The `docs/` folder with `curriculum.md` currently lives at `angular-project/docs/`. Move it under the Angular workspace so it travels with the code:

```powershell
Move-Item `
  -Path "C:\Users\Pichu\Documents\ColimaSoft\Learning\frontend\angular\angular-project\docs" `
  -Destination "C:\Users\Pichu\Documents\ColimaSoft\Learning\frontend\angular\angular-project\dev-expense-tracker\tracker-front\docs"
```

### 2c. Confirm the dev server boots on Windows

```powershell
cd "C:\Users\Pichu\Documents\ColimaSoft\Learning\frontend\angular\angular-project\dev-expense-tracker\tracker-front"
pnpm start
```

Open `http://localhost:4200` — you should see the default Angular welcome page. Stop with `Ctrl+C`.

> **Heads-up:** Windows + WSL2 + `ng serve` works, but pnpm + WSL2 has historical filesystem-perf issues with `node_modules` on `/mnt/c/...`. That's why we initialize on Windows but **do all real work on Linux** in step 4.

## 3. Resolve the git scope (one-time decision)

`ng new` initialized git inside `tracker-front/`. Pick one:

| Option | Where git lives | Trade-off |
|---|---|---|
| **A. Keep at `tracker-front/`** | Nested repo inside the Angular app | `tracker-back/` would need its own repo later |
| **B. Consolidate at `dev-expense-tracker/`** | Single repo covering both apps | One history across the full project; **recommended for your layout** |
| **C. Skip git for now** | Don't init anywhere until you decide | Simpler while learning |

To consolidate at `dev-expense-tracker/` (recommended):

```powershell
# Stop any running ng serve first
cd "C:\Users\Pichu\Documents\ColimaSoft\Learning\frontend\angular\angular-project\dev-expense-tracker"

Remove-Item -Recurse -Force tracker-front/.git

git init
git add .
git commit -m "chore: scaffold dev-expense-tracker (Angular 22 + .NET backend placeholder)"
```

## 4. Push to GitHub, then clone on Arch Linux (WSL2)

This is the handoff: Windows → GitHub → Linux. **All future work happens on Linux.**

### 4a. Create the GitHub repo

1. On github.com, create a new repo (e.g. `dev-expense-tracker`). Don't initialize with a README, `.gitignore`, or license — we already have those.
2. Note the remote URL (HTTPS or SSH, your call).

### 4b. Push from Windows

```powershell
cd "C:\Users\Pichu\Documents\ColimaSoft\Learning\frontend\angular\angular-project\dev-expense-tracker"

git remote add origin <your-github-url>
git branch -M main
git push -u origin main
```

### 4c. Clone on Arch Linux (WSL2)

Open a bash shell inside WSL2:

```bash
# Keep the project on the Linux ext4 filesystem — NOT under /mnt/c/...
mkdir -p ~/projects
cd ~/projects

git clone <your-github-url> dev-expense-tracker
cd dev-expense-tracker/tracker-front

pnpm install
pnpm start
```

> **pnpm 9+ build-script policy.** Angular needs `@parcel/watcher` (file watching for `ng serve`) and `esbuild` (the bundler) to compile their native binaries. pnpm 9 doesn't run these by default for security. If `pnpm install` reports `ERR_PNPM_IGNORED_BUILDS` for `@parcel/watcher`, `esbuild`, `lmdb`, `msgpackr-extract`:
>
> 1. Open `tracker-front/package.json` and add:
>    ```json
>    "pnpm": {
>      "onlyBuiltDependencies": [
>        "@parcel/watcher",
>        "esbuild",
>        "lmdb",
>        "msgpackr-extract"
>      ]
>    }
>    ```
> 2. Run `pnpm install` again. The four packages should build and `pnpm start` will work.
> 3. Commit the `package.json` change so the allowlist travels with the project.
>
> Why not just `pnpm approve-builds <pkg>`? The non-interactive form only works during the window after install where pnpm has those packages flagged as "pending approval." Once that window closes (re-running install, switching terminals), `pnpm approve-builds <pkg>` refuses with `ERR_PNPM_APPROVE_BUILDS_UNKNOWN_PACKAGES`. Editing `package.json` directly is the reliable path.

Open `http://localhost:4200` from your Windows browser — WSL2 forwards `localhost` automatically.

**Why not `/mnt/c/...`?** WSL2's 9P filesystem bridge is slow for the thousands of small files in `node_modules`. With the project on Linux's ext4, `pnpm install` and `ng serve` are dramatically faster.

### 4d. From this point on, all edits happen on Linux

When you ask me to make a change, I'll show you the change on the Windows copy **only if you ask**. The canonical working copy is your Linux clone.

**Sync before every edit session:**

```bash
cd ~/projects/dev-expense-tracker
git pull
```

**Recommended `.gitattributes` (one-time, on Linux):**

```bash
# Force LF line endings everywhere except Windows-specific files
cat > .gitattributes <<'EOF'
* text=auto eol=lf

*.png binary
*.jpg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
EOF

git add .gitattributes
git commit -m "chore: enforce LF line endings"
```

This prevents CRLF surprises when editing across Windows and Linux.

## Pre-Lesson Self-Check

- [x] `node --version` ≥ 20.x on **both** Windows and Linux
- [x] `pnpm --version` reports a recent version on both
- [x] `ng version` reports 22.x
- [x] `ng new tracker-front` completed with `--package-manager=pnpm`
- [x] `docs/curriculum.md` lives inside `tracker-front/docs/`
- [x] Git initialized at `dev-expense-tracker/` and pushed to GitHub
- [x] Cloned to `~/projects/dev-expense-tracker` on Linux
- [x] `pnpm install` and `pnpm start` boot the dev server at `http://localhost:4200` from Linux
- [x] `.gitattributes` committed

When all boxes are ticked, start Lesson 1.1.

---

# Module 1 — Project Setup & Modern Architecture

**Goal:** Stand up a zoneless, standalone Angular 22 workspace with Tailwind, feature-folder layout, and a styled shell.

---

## Lesson 1.1 — Bootstrap the Workspace

> **Before this lesson:** complete the **Pre-Lesson Checklist** above. The workspace should already be scaffolded and `ng serve` should boot. This lesson is about *understanding* what the CLI gave you, not running it again.

**Concepts**
- `ng new` flags and what each one does (`--standalone` is now default, `--style=css`, `--routing`, `--strict`, `--ssr=false`)
- Workspace vs project layout; `angular.json` build target anatomy (`architect.build` block)
- Angular CLI version pinning and Node engine compatibility for Angular 22
- `tsconfig.json` compiler options: `strict`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `strictTemplates`

**Syntax shape (abstract)**
```text
ng new <project-name> [flags]
  --style=css
  --routing
  --strict
  --ssr=false
  --package-manager=<npm|pnpm|yarn>
```

**What you will build**
1. Open `package.json` and confirm Angular 22.x is pinned in `dependencies` and `devDependencies`.
2. Open `angular.json` and read the `projects.<name>.architect.build` block — identify `outputPath`, `main`, `polyfills`, and `tsConfig`.
3. Open `tsconfig.json` and `tsconfig.app.json`; confirm `strict`, `strictTemplates`, `noImplicitOverride`, and `noFallthroughCasesInSwitch` are present. Add any that are missing.
4. Run `ng serve` and verify the default page renders with no compiler warnings.

**Self-check**
- [x] `ng version` reports Angular 22.x
- [x] `tsconfig.json` has `"strict": true` and `"strictTemplates": true`
- [x] `ng serve` boots with no warnings
- [x] You can explain what each `ng new` flag you used does

---

## Lesson 1.2 — Tailwind CSS Integration

**Concepts**
- Tailwind v4 vs v3 difference: v4 uses `@tailwindcss/postcss` (or `@tailwindcss/cli`) and a CSS-first config via `@theme`
- `@import "tailwindcss";` (v4) replaces the three `@tailwind` directives
- `content` array replaced by automatic source detection in v4 (still configurable via `@source`)
- Tailwind utility families you'll use throughout: layout, spacing, typography, color, ring, shadow, transition

**Syntax shape (abstract)**
```css
/* styles.css */
@import "tailwindcss";

@theme {
  --color-brand-500: oklch(...);
}
```

**What you will build**
1. Install Tailwind v4 + its PostCSS plugin (and `postcss` itself).
2. Create `.postcssrc.json` at the workspace root wiring `@tailwindcss/postcss`.
3. Replace `src/styles.css` content with `@import "tailwindcss";`.
4. Replace `src/app/app.component.html` with the provided shell template below.
5. Restart `pnpm start` (PostCSS config changes need a clean rebuild).
6. Verify in the browser: hover state on nav links, keyboard-focus rings (Tab to see them — they're `focus-visible`, not `focus`).

**Provided Template — `app.component.html` (root shell)**
```html
<div class="min-h-screen bg-slate-50 text-slate-900">
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <h1 class="text-xl font-semibold tracking-tight">Dev Expense Tracker</h1>
      <nav class="flex gap-1 text-sm font-medium text-slate-600" aria-label="Primary">
        <a class="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-slate-900
                  focus-visible:bg-slate-100 focus-visible:text-slate-900
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-slate-900 focus-visible:ring-offset-2"
           routerLink="/dashboard">Dashboard</a>
        <a class="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-slate-900
                  focus-visible:bg-slate-100 focus-visible:text-slate-900
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-slate-900 focus-visible:ring-offset-2"
           routerLink="/expenses">Expenses</a>
        <a class="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-slate-900
                  focus-visible:bg-slate-100 focus-visible:text-slate-900
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-slate-900 focus-visible:ring-offset-2"
           routerLink="/budget">Budget</a>
      </nav>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-6 py-8">
    <router-outlet />
  </main>
</div>
```

**Self-check**
- [x] Tailwind utilities apply without errors
- [x] `<router-outlet />` renders inside the shell
- [x] No `*::ng-deep` or shadow-piercing hacks needed (we're not using component encapsulation overrides)

---

## Lesson 1.3 — Standalone Components & Feature Folder Layout

**Concepts**
- Standalone components are now the default — no `standalone: true` flag needed
- `bootstrapApplication(AppComponent, appConfig)` replaces `platformBrowserDynamic().bootstrapModule(AppModule)`
- `appConfig: ApplicationConfig = { providers: [...] }` collects router, change detection, etc.
- Feature-folder layout convention: each feature owns its components, routes, store, types
- File-naming convention: `*.component.ts`, `*.service.ts`, `*.store.ts`, `*.types.ts`

**Syntax shape (abstract)**
```ts
// main.ts
bootstrapApplication(AppComponent, appConfig);

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // other providers
  ],
};
```

**What you will build**
1. Verify the CLI-generated files are in place: `src/main.ts` uses `bootstrapApplication`; `src/app/app.config.ts` exports `ApplicationConfig`; `src/app/app.routes.ts` exports `Routes[]`.
2. Create the four feature folders under `src/app/`:
   - `expenses/`
   - `dashboard/`
   - `budget/`
   - `shared/`
3. Stub one page component per feature folder using **inline templates** (per AGENTS.md's "small component" rule). Suggested names: `ExpensesPageComponent`, `DashboardPageComponent`, `BudgetPageComponent`. Do **not** set `standalone: true` in `@Component` decorators — it's the default in Angular v20+.
4. Wire routes in `app.routes.ts`. Use eager imports for now; we'll convert to lazy `loadComponent` in Lesson 5.3. Make `dashboard` the default redirect.
5. Verify navigation by clicking the nav links in the browser shell.

**Alternative to document** → `docs/alternatives.md §1 — NgModules vs. Standalone Bootstrap`

**Self-check**
- [x] `main.ts` uses `bootstrapApplication`
- [x] `app.config.ts` exports `ApplicationConfig`
- [x] `app.routes.ts` exports `Routes[]` with the dashboard redirect + three feature routes
- [x] Feature folders exist: `src/app/{expenses,dashboard,budget,shared}/`
- [x] Each feature folder has at least one component file (e.g., `expenses-page.component.ts`)
- [x] No `@NgModule` declarations anywhere in `src/`
- [x] No `standalone: true` in any `@Component` decorator (it's the default — don't set it)
- [x] Clicking nav links routes between the three placeholder pages without errors

---

## Lesson 1.4 — Zoneless Change Detection (Verify, Don't Configure)

> **Angular v22+ ships zoneless by default.** Unlike earlier versions where you had to opt in with `provideZonelessChangeDetection()` and remove `zone.js` from polyfills, v22 generates a zoneless config out of the box. This lesson is **verification** — confirming what the CLI gave you — not configuration.

**Concepts**
- Why Zone.js existed historically: monkey-patched async APIs (`Promise`, `setTimeout`, XHR, `addEventListener`) to trigger global change detection
- The cost: every async op re-checked the entire view tree, even changes unrelated to your view
- Angular v22 default: zoneless — no provider needed, no `polyfills` array, signal reads/writes trigger re-render
- `ChangeDetectionStrategy.OnPush` is the default in Angular v22+ — **do not set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorators** (per AGENTS.md). It's automatic.
- Pitfalls in zoneless: any state mutation outside a signal silently breaks re-render. Use `signal()`, `computed()`, `toSignal()`, `async` pipe, or explicit `markForCheck()`.

**Syntax shape (abstract)**
```ts
// src/app/app.config.ts — Angular 22+ default, zoneless by default
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // No provideZonelessChangeDetection() needed — it's the default in v22+
    provideRouter(routes),
  ],
};
```

If you ever need Zone for a third-party library:
```ts
import { provideZoneChangeDetection } from '@angular/core';

providers: [
  provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
]
```

**What you will build**
1. Read `src/app/app.config.ts` — confirm there's no `provideZoneChangeDetection` and no `zone.js` import. Zoneless should already be the default.
2. Read `angular.json` — confirm there's no `polyfills` array (or it's empty).
3. Audit templates for non-signal async sources:
   ```bash
   grep -rn 'subscribe\|setInterval\|setTimeout\|addEventListener' src/app/
   ```
   Should return nothing meaningful.
4. Verify the app runs cleanly: `pnpm start`, navigate between pages, edit a placeholder, watch hot-reload. No Zone-related warnings in browser console.
5. No `NgZone` injections anywhere in `src/`.

**Alternative to document** → `docs/alternatives.md §2 — Zone.js retained mode`

**Self-check**
- [x] `app.config.ts` has no `provideZoneChangeDetection` and no Zone imports
- [x] `angular.json` has no `polyfills` array (or it's empty)
- [x] App renders and routes work as expected
- [x] Hot-reload still fires on file save
- [x] No Zone-related errors in browser console
- [x] No `NgZone` injections anywhere in `src/`

---

# Module 2 — State Management with Signal Stores

**Goal:** A central `ExpenseStore` service backed by signals, with computed totals and `localStorage` persistence.

---

## Lesson 2.1 — Domain Models

**Concepts**
- `interface` vs `type alias`: interfaces for object shapes, types for unions/intersections
- String literal unions for closed sets (`type Category = 'hosting' | 'apis' | 'domains' | 'courses'`)
- `readonly` fields and `as const` arrays for ID generation and category lists
- Branded types pattern (optional, for later when you need nominal IDs)

**Syntax shape (abstract)**
```ts
interface Money {
  readonly amount: number;
  readonly currency: 'USD' | 'EUR' | 'MXN';
}

type Category = 'hosting' | 'apis' | 'domains' | 'courses';
```

**What you will build**
- Define `Expense`, `Budget`, `Category` in `src/app/shared/types.ts`.
- Export a `CATEGORIES: readonly Category[]` constant.

**Self-check**
- [ ] `CATEGORIES` is `readonly` and typed `readonly Category[]`
- [ ] `Expense` has `id`, `category: Category`, `amount: number`, `date: string` (ISO), optional `note`

---

## Lesson 2.2 — Signal Primitives

**Concepts**
- `signal(initialValue)` — writable reactive cell
- Read with `signal()` (calling it like a function), write with `.set(v)` or `.update(fn)`
- `computed(() => ...)` — derived signal that auto-tracks dependencies and memoizes
- Equality function option for object signals: `signal([], { equal: (a, b) => a.length === b.length })`

**Syntax shape (abstract)**
```ts
const count = signal(0);
const doubled = computed(() => count() * 2);

count.set(5);              // → doubled() becomes 10
count.update(v => v + 1);  // → doubled() becomes 12
```

**What you will build**
- In `src/app/shared/expense.store.ts`, create a class with:
  - writable signal: `expenses: WritableSignal<Expense[]>`
  - writable signal: `budget: WritableSignal<Budget>`
  - computed: `monthlyTotal`
  - computed: `byCategory`
  - computed: `alertLevel` (returns `'ok' | 'warn' | 'over'` based on threshold)

**Alternative to document** → `docs/alternatives.md §3 — BehaviorSubject vs. signal()`

**Self-check**
- [ ] All three computed signals exist and recompute when inputs change
- [ ] You can call `store.monthlyTotal()` from a template and see a number
- [ ] `byCategory()` returns an object keyed by `Category`

---

## Lesson 2.3 — Functional Dependency Injection

**Concepts**
- `inject(Token)` works in field initializers and inside constructor bodies (injection context)
- `@Service()` → app-singleton via root injector (Angular 22+ preferred over `@Injectable({providedIn: 'root'})`)
- Component-level `providers: []` → fresh instance per component subtree
- `inject(EnvironmentInjector)` and `runInInjectionContext` for advanced cases (skip unless you hit them)

**Syntax shape (abstract)**
```ts
@Service()                          // Angular 22+ — replaces @Injectable({providedIn: 'root'})
class FooService {
  private logger = inject(Logger);
  // ...
}
```

**What you will build**
- Mark `ExpenseStore` with `@Service()`.
- Replace any constructor injection with field-level `inject()` calls.
- In a stub component, `inject(ExpenseStore)` and read `store.monthlyTotal()`.

**Self-check**
- [ ] `ExpenseStore` is provided in root
- [ ] No constructor-based injection anywhere in `src/`
- [ ] `inject()` calls happen in field initializers (not inside `ngOnInit`)

---

## Lesson 2.4 — Encapsulation & Side Effects

**Concepts**
- Hide mutators behind public methods; expose `readonly` views via `.asReadonly()`
- `effect(fn)` — runs whenever any signal it reads changes; can return a cleanup `OnDestroyFn`
- `effect()` runs in injection context; outside it, you need an `Injector` or `EffectRef`
- Avoid writing to signals inside an `effect` (causes loops) — use `untracked()` to read without subscribing
- `effect()` must be created in an injection context; in services, that means in the constructor or field initializer

**Syntax shape (abstract)**
```ts
@Service()                         // Angular 22+ — replaces @Injectable({providedIn: 'root'})
class Store {
  private readonly _items = signal<Item[]>([]);
  readonly items = this._items.asReadonly();

  constructor() {
    effect(() => {
      const snap = this._items();
      localStorage.setItem('items', JSON.stringify(snap));
    });
  }

  add(item: Item) { this._items.update(list => [...list, item]); }
}
```

**What you will build**
- Make all writable signals private; expose read-only views.
- Add mutator methods: `addExpense`, `removeExpense`, `setBudget`, `setAlertThreshold`.
- Add an `effect()` that persists the expenses list and budget to `localStorage`.
- Add a hydration step: read from `localStorage` on construction; fall back to defaults.

**Self-check**
- [ ] Private fields use `_` prefix and are `readonly`
- [ ] Public read views use `.asReadonly()`
- [ ] Reloading the page restores the persisted state
- [ ] No infinite-loop warnings in the console from the `effect`

---

# Module 3 — Form Handling & Data Logging

**Goal:** A validated expense-entry form connected to the store.

---

## Lesson 3.1 — Form Paradigm Choice

**Concepts**
- **Reactive Forms** — programmatic, synchronous, type-friendly with `nonNullableFormGroup`, ideal for complex/validated forms
- **Template-Driven Forms** — declarative via `[(ngModel)]`, simpler for trivial inputs
- For a tool with validation rules + a store-driven submit, Reactive Forms is the right call
- Decision is committed here: **main codebase uses Reactive Forms**

**Alternative to document** → `docs/alternatives.md §4 — Template-Driven Forms walk-through`

**Self-check**
- [ ] `ReactiveFormsModule` is in `app.config.ts` providers
- [ ] `FormsModule` (template-driven) is **not** imported

---

## Lesson 3.2 — Signal Forms vs Typed Reactive Forms

**Concepts**
- **Signal Forms** (Angular 22, experimental → stable): `form()`, `Field`, schema-based validation, native signal integration
- **Typed Reactive Forms**: `FormGroup<{ amount: FormControl<number | null> }>`, `nonNullable` variants, validators as pure functions
- For an Angular 22 curriculum that wants modern signals end-to-end, **Signal Forms** is the recommended path
- Decision: **main codebase uses Signal Forms**; typed Reactive Forms lives in `docs/alternatives.md`

**Syntax shape (abstract)**
```ts
// Signal Forms (modern)
const expenseForm = form({
  amount: 0,
  category: '' as Category,
  date: '',
  note: '',
});
```

```ts
// Typed Reactive Forms (legacy)
const expenseForm = new FormGroup({
  amount: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
  category: new FormControl<Category>('hosting', { nonNullable: true }),
});
```

**Alternative to document** → `docs/alternatives.md §5 — Typed Reactive Forms walk-through`

**What you will build**
- In `ExpenseFormComponent`, create the form instance at component level.
- Bind inputs through `form.name` signal accessors.
- Write the submit handler (signature only — no logic given).

**Self-check**
- [ ] Form is created once (not inside a method)
- [ ] Field accessors are reactive in the template

---

## Lesson 3.3 — Validation Patterns

**Concepts**
- Built-ins: `required`, `min`, `max`, `pattern`, `email`, `minLength`, `maxLength`
- Custom validators: function returning `null` or `{ key: value }`
- Cross-field validators at the group level
- With Signal Forms: schema-driven validators via `schema(...)` + `validate(...)`
- Display errors via computed signals that read the field's error state

**Syntax shape (abstract)**
```ts
// Validator factory
function positiveAmount(c: AbstractControl) {
  return c.value > 0 ? null : { positive: true };
}
```

**What you will build**
- Apply validators: required amount, positive number, valid category, valid date.
- Add a `note` field with max length 200.
- Show inline error text per field using Tailwind classes you pick.

**Provided Template — `expense-form.component.html`**
```html
<form
  class="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
  (submit)="onSubmit($event)"
  novalidate
>
  <header>
    <h2 class="text-lg font-semibold">Log a new expense</h2>
    <p class="text-sm text-slate-500">Track where your dev budget goes.</p>
  </header>

  <div class="grid gap-4 sm:grid-cols-2">
    <!-- Amount -->
    <label class="block text-sm">
      <span class="mb-1 block font-medium text-slate-700">Amount (USD)</span>
      <input
        type="number"
        inputmode="decimal"
        step="0.01"
        min="0"
        name="amount"
        class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm
               focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      />
      <!-- You bind [value] / [class.border-red-500] / error text via signals -->
      <p class="mt-1 hidden text-xs text-red-600">Amount must be greater than 0.</p>
    </label>

    <!-- Category -->
    <label class="block text-sm">
      <span class="mb-1 block font-medium text-slate-700">Category</span>
      <select
        name="category"
        class="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm
               focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      >
        <!-- Options rendered with @for over CATEGORIES -->
        <option value="hosting">Hosting</option>
        <option value="apis">APIs</option>
        <option value="domains">Domains</option>
        <option value="courses">Courses</option>
      </select>
    </label>

    <!-- Date -->
    <label class="block text-sm">
      <span class="mb-1 block font-medium text-slate-700">Date</span>
      <input
        type="date"
        name="date"
        class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm
               focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      />
    </label>

    <!-- Note -->
    <label class="block text-sm sm:col-span-2">
      <span class="mb-1 block font-medium text-slate-700">Note (optional)</span>
      <input
        type="text"
        name="note"
        maxlength="200"
        placeholder="e.g. Annual Vercel renewal"
        class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm
               focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      />
    </label>
  </div>

  <footer class="flex items-center justify-between">
    <p class="text-xs text-slate-500">All amounts in USD. You can edit categories later.</p>
    <button
      type="submit"
      class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white
             hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900
             focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Save expense
    </button>
  </footer>
</form>
```

**Self-check**
- [ ] Submitting with `amount = 0` shows the amount error
- [ ] Submitting with empty `category` is blocked
- [ ] Errors clear when the field becomes valid (don't rely on `(blur)` alone)

---

## Lesson 3.4 — Connecting Form to Store

**Concepts**
- Submit handler signature: takes a typed payload, no `any`
- Mutator methods on the store accept validated input, not raw form values
- ID generation: `crypto.randomUUID()` (built-in), or `Date.now()` + random suffix
- Reset the form on successful submit; preserve values on validation failure
- Use `untracked()` when reading store state inside an `effect` that also writes to it

**Syntax shape (abstract)**
```ts
onSubmit(payload: ExpenseDraft) {
  const expense: Expense = { ...payload, id: crypto.randomUUID() };
  this.store.addExpense(expense);
  this.form.reset();
}
```

**What you will build**
- Wire the form's submit handler to `ExpenseStore.addExpense()`.
- Generate a stable `id` per new entry.
- Reset the form on success; do **not** reset on validation failure.
- Confirm the new row appears in the dashboard list (built in Module 4).

**Self-check**
- [ ] New entries appear in the dashboard without a manual refresh
- [ ] Form clears after successful submit
- [ ] No `any` types in the submit path

---

# Module 4 — Dashboard & Signal-Driven Communication

**Goal:** A dashboard that reads computed store signals and renders via `@if`/`@for`, with child components receiving data through signal inputs.

---

## Lesson 4.1 — Signal Inputs / Outputs / Model

**Concepts**
- `input<T>()` — optional signal input
- `input.required<T>()` — required signal input (compile error if missing)
- `input<T>({ alias: 'foo' })` — alias for templates that need a different name
- `output<T>()` — emits typed values; consumers bind via `(event)="..."`
- `model<T>()` — two-way bindable signal (replaces `[(ngModel)]`-style patterns in child components)
- Signal inputs are read with `()` in templates and TS

**Syntax shape (abstract)**
```ts
@Component({...})
class CardComponent {
  title = input.required<string>();
  expanded = model<boolean>(false);
  closed = output<void>();
}
```

**Alternative to document** → `docs/alternatives.md §6 — @Input / @Output decorators`

**What you will build**
- `MetricCardComponent` with `title = input.required<string>()` and `value = input.required<number>()`
- `AlertBannerComponent` with `level = input<'ok' | 'warn' | 'over'>()` and `dismissed = output<void>()`
- `ExpenseRowComponent` with `expense = input.required<Expense>()` and `removed = output<string>()`

**Self-check**
- [ ] No `@Input()` or `@Output()` decorators anywhere in `src/`
- [ ] Required inputs throw a clear compile error when omitted
- [ ] `(removed)` event payload is the expense id, not the whole object

---

## Lesson 4.2 — Modern Control Flow

**Concepts**
- `@if (cond) {} @else if {} @else {}` — branch without structural directive overhead
- `@for (item of items(); track item.id) {} @empty {}` — loop with mandatory `track`
- `@switch` / `@case` / `@default`
- `@let` — local template variables (Angular 18+)
- `@defer` — lazy render (covered in Module 5)
- `track` is mandatory; pick a stable key (id) so DOM nodes are reused

**Syntax shape (abstract)**
```html
@if (loading()) {
  <p>Loading…</p>
} @else if (error()) {
  <p>Something went wrong.</p>
} @else {
  <ul>
    @for (item of items(); track item.id) {
      <li>{{ item.name }}</li>
    } @empty {
      <li>No items yet.</li>
    }
  </ul>
}
```

**Alternative to document** → `docs/alternatives.md §7 — *ngIf / *ngFor legacy control flow`

**What you will build**
- Render the expense list with `@for (e of expenses(); track e.id)`.
- Handle the empty state with `@empty`.
- Render category chips with `@switch` on `expense.category`.

**Self-check**
- [ ] No `*ngIf` or `*ngFor` anywhere in `src/`
- [ ] Every `@for` has a `track` expression
- [ ] Empty state appears when the list is empty

---

## Lesson 4.3 — Dynamic Tailwind Classes

**Concepts**
- Class binding via `[class]="..."` (string) or `[class.foo]="cond"` (boolean)
- Computed class objects for multi-class toggles
- Tailwind v4: classes are tree-shaken by content scanning — classes added only at runtime must be in the safelist (or a `@source` directive in v4)
- For dynamic alert colors, prefer a `[className]` computed string built from a literal map

**Syntax shape (abstract)**
```ts
const colorFor = (level: 'ok' | 'warn' | 'over') => ({
  ok:   'bg-emerald-50 text-emerald-900 ring-emerald-200',
  warn: 'bg-amber-50 text-amber-900 ring-amber-200',
  over: 'bg-red-50 text-red-900 ring-red-200',
}[level]);
```

**What you will build**
- `AlertBannerComponent` reads `level()` input, applies color tiers at 60% / 90% / 100% of budget.
- `MetricCardComponent` shows a progress bar whose color shifts by `alertLevel()`.
- All color classes appear in your templates or `@source` directives so Tailwind doesn't purge them.

**Provided Template — `dashboard.component.html`**
```html
<section class="space-y-6">
  <header class="flex items-end justify-between">
    <div>
      <h2 class="text-2xl font-semibold tracking-tight">Monthly overview</h2>
      <p class="text-sm text-slate-500">Budget vs. spend for the current month.</p>
    </div>
    <p class="text-sm text-slate-500">
      Threshold alert at
      <span class="font-medium text-slate-900">{{ store.alertThresholdPct() }}%</span>
    </p>
  </header>

  <app-alert-banner
    [level]="store.alertLevel()"
    (dismissed)="onAlertDismissed()"
  />

  <div class="grid gap-4 sm:grid-cols-3">
    <app-metric-card
      title="Spent this month"
      [value]="store.monthlyTotal()"
    />
    <app-metric-card
      title="Budget"
      [value]="store.budget().monthlyLimit"
    />
    <app-metric-card
      title="Remaining"
      [value]="store.remainingBudget()"
    />
  </div>

  <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <header class="mb-4 flex items-center justify-between">
      <h3 class="text-base font-semibold">Expense log</h3>
      <span class="text-xs text-slate-500">{{ store.expenses().length }} entries</span>
    </header>

    <ul class="divide-y divide-slate-100">
      @for (e of store.expenses(); track e.id) {
        <li class="flex items-center justify-between py-3">
          <app-expense-row
            [expense]="e"
            (removed)="store.removeExpense($event)"
          />
        </li>
      } @empty {
        <li class="py-6 text-center text-sm text-slate-500">
          No expenses logged yet. Add one above.
        </li>
      }
    </ul>
  </div>
</section>
```

**Self-check**
- [ ] Banner color changes when you cross 60% and 90%
- [ ] Progress bar color matches banner level
- [ ] Removing a row from the list triggers the store's `removeExpense(id)` mutator

---

# Module 5 — Filtering, CSV Export & Advanced Features

**Goal:** Make the app feel like a tool — debounced filters, lazy-loaded charts, CSV export.

---

## Lesson 5.1 — RxJS ↔ Signal Interop

**Concepts**
- `toSignal(observable$, { initialValue })` — bridges an Observable into a signal
- `toObservable(signal)` — bridges a signal into an Observable (for operators that need a stream)
- Common pattern: input event → `Subject` → `debounceTime` → `distinctUntilChanged` → `toSignal` → `computed`
- Avoid double bridging: pick one direction; pick signals for state, observables for streams
- `takeUntilDestroyed()` (Angular 16+) auto-unsubscribes when host is destroyed

**Syntax shape (abstract)**
```ts
const query$ = this.searchControl.valueChanges.pipe(
  startWith(''),
  debounceTime(300),
  distinctUntilChanged(),
);

const query = toSignal(query$, { initialValue: '' });

readonly filtered = computed(() =>
  this.all().filter(x => x.name.includes(this.query())),
);
```

**What you will build**
- A `FilterBarComponent` with a debounced search input and a category `<select>`.
- Both feed into the store's filter state (extend the store with `filter` signal + `filteredExpenses` computed).
- The dashboard list re-renders reactively.

**Self-check**
- [ ] Typing fast does not thrash the list
- [ ] Clearing the search restores the full list
- [ ] No manual `unsubscribe()` calls

---

## Lesson 5.2 — `httpResource()` for External Data

**Concepts**
- `httpResource(() => url)` — declarative resource; returns a signal-like object with `.value`, `.isLoading`, `.error`
- The function passed in is reactive: re-runs when any signal it reads changes
- Use `httpResource` when the URL or params depend on signals; use `HttpClient` for one-off requests
- Pair with `linkedSignal` or local computed signals to derive display values
- Error handling via `.error()`; loading UI via `.isLoading()`

**Syntax shape (abstract)**
```ts
const data = httpResource<RateTable>(() => '/api/usd-rates');

// in template
@if (data.isLoading()) { ... }
@else if (data.error()) { ... }
@else { ... use data.value() ... }
```

**Alternative to document** → `docs/alternatives.md §8 — HttpClient + toSignal manual bridge`

**What you will build**
- Optional feature: fetch a static USD rates endpoint and let users view expenses in another currency.
- If you don't want external deps, mock the endpoint with a `assets/rates.json` and `httpResource('/assets/rates.json')`.

**Self-check**
- [ ] Loading state appears during the request
- [ ] Error state appears on network failure
- [ ] Switching currencies re-renders totals reactively

---

## Lesson 5.3 — Standalone Routing & `@defer` Lazy Loading

**Concepts**
- Routes with `loadComponent: () => import('./...').then(m => m.X)`
- Route-level `providers: []` for feature-scoped services
- `canActivate` / `canMatch` functional guards
- `@defer (on viewport)` — render when the block scrolls into view
- `@defer (on idle)` — render when the browser is idle
- `@defer (on hover)` with `@placeholder` — render on first interaction
- `@loading` / `@error` / `@placeholder` slots
- Heavy components (a recharts/chart.js wrapper) are perfect candidates

**Syntax shape (abstract)**
```ts
// routes
{
  path: 'dashboard',
  loadComponent: () =>
    import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
}
```

```html
@defer (on viewport) {
  <app-monthly-chart />
} @loading {
  <div class="h-64 animate-pulse rounded-xl bg-slate-100"></div>
} @error {
  <p class="text-sm text-red-600">Chart failed to load.</p>
} @placeholder {
  <div class="h-64 rounded-xl border border-dashed border-slate-200"></div>
}
```

**What you will build**
- Configure routes in `app.routes.ts` with `loadComponent` for `DashboardComponent` and `ExpensesPageComponent`.
- Add a chart component (any wrapper — your choice) and wrap it with `@defer (on viewport)`.
- Show skeleton / placeholder / loading states.

**Self-check**
- [ ] Initial bundle does **not** contain the chart code (verify via `ng build --stats-json` or `source-map-explorer`)
- [ ] `@defer` triggers as you scroll
- [ ] `@loading` slot appears, then swaps in the chart

---

## Lesson 5.4 — CSV Export Utility

**Concepts**
- CSV escaping rules: wrap values containing `,`, `"`, or newlines in double quotes; double internal quotes
- `Blob` + `URL.createObjectURL` for in-browser downloads
- `document.createElement('a')` + `.click()` to trigger the download
- `URL.revokeObjectURL` cleanup
- Compose with computed signals: `exportRows()` derives the filtered list

**Syntax shape (abstract)**
```ts
function escape(value: unknown): string {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: ReadonlyArray<readonly string[]>, headers: readonly string[]): string {
  const head = headers.map(escape).join(',');
  const body = rows.map(r => r.map(escape).join(',')).join('\n');
  return `${head}\n${body}`;
}

function download(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

**What you will build**
- A `csv.util.ts` file with `escapeCell`, `toCsv`, and `downloadCsv` helpers.
- An `ExportButtonComponent` (template provided below) wired to a method that calls your utility with `store.filteredExpenses()`.
- Filename pattern: `expenses-YYYY-MM-DD.csv`.

**Provided Template — `export-button.component.html`**
```html
<button
  type="button"
  (click)="onExport()"
  class="inline-flex items-center gap-2 rounded-md border border-slate-300
         bg-white px-3 py-2 text-sm font-medium text-slate-700
         hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900
         focus:ring-offset-2"
>
  <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 3a1 1 0 0 1 1 1v7.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L9 11.586V4a1 1 0 0 1 1-1Z"/>
    <path d="M3 15a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z"/>
  </svg>
  Export CSV
</button>
```

**Self-check**
- [ ] CSV opens cleanly in Excel / Sheets
- [ ] Notes containing commas are quoted correctly
- [ ] Filename includes today's date
- [ ] Filter state is respected (only filtered rows export)

---

# Self-Check — End of Curriculum

- [ ] App boots zoneless, with Tailwind, in a feature-folder layout
- [ ] `ExpenseStore` uses private signals + public computed + `.asReadonly()` + `effect()` persistence
- [ ] Form uses Signal Forms (modern) with validators; template-driven alternative is in `docs/alternatives.md`
- [ ] Dashboard reads store signals through `input.required()` and renders via `@if`/`@for` with `track`
- [ ] Filter bar uses RxJS ↔ Signal interop with debounce
- [ ] CSV export works with proper escaping
- [ ] Heavy chart loads via `@defer`
- [ ] All eight `docs/alternatives.md` sections are populated as you go

---

---

# Future: .NET Backend Integration (Phase 2 Preview)

> You are learning Angular first. **Don't build any of this yet.** This is a forward-looking contract so the frontend code you write today doesn't paint itself into a corner.

**Planned stack (your call later):**
- ASP.NET Core Web API (.NET 8+) — lives in `tracker-back/`
- Entity Framework Core with SQLite (single-user app, no auth)
- Controllers or Minimal APIs (your preference)
- Dev proxy: Angular `proxy.conf.json` in `tracker-front/` forwarding `/api/*` → `https://localhost:5001`

**REST contract the frontend will assume:**

| Method | Path | Body | Returns | Maps to store mutator |
|---|---|---|---|---|
| `GET` | `/api/expenses` | — | `Expense[]` | Initial hydration (replaces `localStorage` read) |
| `POST` | `/api/expenses` | `ExpenseDraft` | `Expense` (with server-assigned id) | `addExpense` |
| `PUT` | `/api/expenses/{id}` | `Expense` | `Expense` | `updateExpense` (added when you need edit) |
| `DELETE` | `/api/expenses/{id}` | — | `204` | `removeExpense` |

**How this changes Lesson 2.4 later (Phase 2):**
- Replace the `localStorage` read in the constructor with an `api.list()` call.
- Replace the `localStorage` write `effect()` with a sync `effect()` that mirrors in-memory state to a cache and triggers a debounced API write.
- Mutator methods gain optimistic update + rollback (sketch shown earlier).
- Add `proxy.conf.json` to `angular.json` so `http://localhost:4200/api/expenses` works without CORS in dev.

**Frontend hooks to leave in place now:**
- Keep mutator methods (`addExpense`, `removeExpense`, `setBudget`) on the store — they are the seam where the API will plug in.
- Treat store reads (`expenses`, `budget`, `monthlyTotal`) as the only UI-facing API; templates never call the backend directly.
- Set up `environment.ts` with `apiBaseUrl: '/api'` so the swap is config-only later.

**What you don't need to do yet:**
- No `HttpClient` provider, no API service class, no proxy config.
- Don't pre-create an `ExpenseApi` skeleton — it will be more confusing than helpful during Phase 1.

---

# `docs/alternatives.md` — Section Index

Create this file as you go. Each section header below is a placeholder; the body is your write-up of the legacy approach.

1. NgModules vs. Standalone Bootstrap
2. Zone.js retained mode
3. BehaviorSubject vs. `signal()`
4. Template-Driven Forms walk-through
5. Typed Reactive Forms walk-through
6. `@Input` / `@Output` decorators
7. `*ngIf` / `*ngFor` legacy control flow
8. HttpClient + `toSignal` manual bridge

For each section, write: **when you'd reach for it** (rarely), **the diff vs. the modern path**, and a **minimal code sample**. Keep it terse — it's a reference, not an essay.
