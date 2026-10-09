# Progress

> Running log so any forked session can orient without re-reading the full curriculum. Update as lessons complete.

## Teaching mode — guided code (current)
- **Status:** active on this branch
- **What changed:** the "no spoilers / structure only" pedagogy is retired. Lessons are delivered in chat as a from-zero explanation plus complete, paste-ready code blocks.
- **Hard rule:** the agent must NOT write/create/edit any file (no `src/` writes, no patching files for the user). The user does all copy-pasting, file creation, and typing. Reading the repo to tailor the code is fine; editing `docs/` is fine when explicitly asked.
- **Where the rules live:** `docs/curriculum.md` → *Pedagogical rules (current)* + *Lesson delivery format*, and the "Lesson Mode" block at the top of `docs/AGENTS.md`.
- **Lessons 1.1 – 3.1** were authored under the old rule; their "structure only" wording describes lesson *scope*, not delivery. Don't restore it.

## Module 1 — Project Setup & Modern Architecture
- **Status:** Module 1 complete
- **Lessons completed:** 1.1, 1.2, 1.3, 1.4
- **Next:** Start Module 2
- **Notes:** din't change a thing, Angular 22 is already Zoneless and onPush by default.

## Module 2 — State Management with Signal Stores
- **Status:** Module 2 complete
- **Lessons completed:** 2.1, 2.2, 2.3, 2.4
- **Next:** Start Module 3
- **Notes:** use side effects to load and save the state of the storage

## Module 3 — Form Handling & Data Logging
- **Status:** Module 3 complete (3.1–3.4). All curriculum self-checks pass; `ng build` is clean.
- **Lessons completed:** 3.1, 3.2, 3.3, 3.4
- **Next:** Module 4 → Lesson 4.1 (Signal Inputs / Outputs / Model)
- **Files touched in Module 3:** `src/app/expenses/expenses-form.component.ts` (new logic, external template), `src/app/expenses/expenses-form.component.html` (new), `src/app/expenses/expenses-page.component.ts` (composes the form), `tsconfig.json` (`"strict": true` added).
- **Shape of the finished form (so Module 4 doesn't re-derive it):**
  - `EMPTY_DRAFT = { amount: 0, category: '', date: '', note: '' }` module-level const; the model is `signal({ ...EMPTY_DRAFT })`. Reset = `expenseForm().reset()` **then** `model.set({ ...EMPTY_DRAFT })`.
  - One `form(model, schema, options)` call, six rules in the schema, submission configured with `action` (store write + reset) and `onInvalid` (`markAsTouched()`). **No `(submit)` handler and no manual `novalidate` in the template** — `[formRoot]` owns both.
  - The template's Category `<select>` has an explicit `<option value="">Choose a category…</option>` so the DOM and the model's `''` agree.
  - Five `show*Error` computeds (`touched() && invalid()`) + a `noteLength()` counter. Every rule has a message and a visible voice — keep that invariant when adding fields.
  - The form model types `category` as `string`; 3.4's `action` narrows it with `value.category as Category` immediately after 3.3's `validate(path.category, …)` membership rule proved it. **Don't delete either half.**
  - The store owns ids (`crypto.randomUUID()` inside `addExpense`). Components must never mint ids.
- **Verification trick for Module 4:** `DashboardPageComponent` already renders `{{ store.monthlyTotal() }}`, and `monthlyTotal` filters on `date.startsWith('YYYY-MM')` for the *current* month. Add an expense dated today → the dashboard number moves. Date it in another month and the total won't change (that's the filter, not a bug).
- **Angular 22 accuracy audit (done against installed @angular/core|common|forms 22.1.6, CLI 22.1.8):**
  facts below were verified in `node_modules` type definitions, not from memory — re-verify
  against the installed version before writing any lesson code.
  - `form()` takes a **`WritableSignal` model**, never a bare object literal. Overloads: `form(model)`, `form(model, schemaOrOptions)`, `form(model, schema, options)`.
  - Binding is by directive: `[formField]="form.field"` (`FormField`) on each control, `[formRoot]="form"` on the `<form>` (sets `novalidate`, prevents default submit). No `name=` + `(input)` pairs.
  - `FieldState.reset(value?)` clears `touched`/`dirty` only — it does **not** clear values. Reset = `form().reset()` + write the model signal.
  - Errors are `{ kind: 'required' | 'min' | ... }`; read with `field.getError(kind)` / `field.errors()`. Not the Reactive-Forms `null` / `{ key: value }` contract.
  - Rules: `schema((path) => { required(path.x); min(path.x, n); maxLength(path.x, n); validate(path.x, fn); })`, plus `apply`, `validateTree`, `validateAsync`, `validateHttp`. Root state also has `pending()` / `submitting()`.
  - `rxResource()` **does not exist** in Angular 22. Only `resource()` (core) and `httpResource()` (common/http). `toSignal`/`toObservable` from `@angular/core/rxjs-interop`.
  - `form`, `FieldTree`, `FieldState`, `FormField`, `FormRoot`, `schema`, `apply`, `validate` are all `@publicApi 22.0` → "stable in 22", not "graduated in v21".
  - Confirmed still true: zoneless by default (no zone provider, no `polyfills` in angular.json); **OnPush is the v22 default** (compiler emits nothing when unspecified, runtime does `onPush: changeDetection !== Eager`, enum is `OnPush = 0` / `Eager = 1`); `@Service` exists (22.1.0 shipped an `@Injectable` → `@Service` migration) and the store already uses it; `httpResource(() => url)` signature in 5.2 is valid.
  - Naming: the form component is **`ExpensesFormComponent`** in `src/app/expenses/expenses-form.component.ts` (plural, matching the `expenses/` folder). The old `ExpenseFormComponent` spelling is retired.
  - Two hard Signal Forms constraints found while delivering 3.2 (both are template diagnostics, so they only show up with template type-checking on):
    - `[formField]` is typed against the host element: text/select/date → `string`, number → `number | null`. A union like `Category` in the model fails with *"Type 'WritableSignal<Category>' is not assignable to …"*. Domain unions belong in a rule (3.3) and a narrowing at the store boundary (3.4), not in the form model.
    - `min` / `max` / `required` / `pattern` / `minlength` / `maxlength` are **reserved** next to `[formField]` — they're `MinValidator`-style validator inputs in Reactive Forms — so `min="0"` errors with *"min attribute is not allowed to be used on nodes using formField"*. Use `min(path.amount, 0.01)` in the schema instead. `step`, `inputmode`, `type`, `placeholder` are plain HTML and stay.
  - `tsconfig.json` was missing `"strict": true` (Lesson 1.1 required it and its self-check was ticked anyway). **Fixed during 3.3** — verified the whole app *and* the specs compile clean with it, then `ng build` clean. `strictTemplates` is still absent from `angularCompilerOptions` but Angular 22 enables it by default (it's why the `Category` template error surfaced at all); add it explicitly when convenient.
  - Custom `validate()` rules have two traps, both verified in the installed runtime (`ArrayMergeIgnoreLogic.compute`): the callback gets a `FieldContext` whose `value` is a **`Signal`**, so write `value()`; and the return contract is `undefined`/`null` = valid vs an error object = invalid. A bare `false` is *kept* as the error itself, so `errors()` fills with booleans and `getError(kind)` finds nothing. Use a ternary.
  - `FormSubmitOptions.action` is **required**; `onInvalid` is optional. `form(model, schema, { submission: { onInvalid } })` does not compile — a submission config needs its `action`. Built-in rules take `{ message }` **or** `{ error }`, never both (it's a union type).

## Module 4 — Dashboard & Signal-Driven Communication
- **Status:** complete (4.1, 4.2, 4.3). Module self-check passed; `ng build` clean.
- **Lessons completed:** 4.1, 4.2, 4.3
- **Next:** Module 5 → 5.1 (RxJS ↔ Signal Interop)
- **Files touched in Module 4:** `src/app/dashboard/metric-card.component.ts` (new), `alert-banner.component.ts` (new), `expense-row.component.ts` (new), `dashboard-page.component.ts` (rewritten from a one-line stub into the parent that composes the children), `src/app/shared/expense.store.ts` (+ alert-dismissal state).
- **Module 4 self-check result (all pass):** no `@Input()`/`@Output()` decorators in `src/`; no `*ngIf`/`*ngFor`/`ngSwitch`; every `@for` carries a `track`; 4 required inputs are `input.required`; `(removed)` payload is the expense id; `remaining`/`thresholdPct`/`spentPct` are `computed()`; all 9 tier colour classes confirmed present in the built CSS.
- **Lessons 4.2 and 4.3 — what changed on top of 4.1:**
  - **4.2** rewrote `alert-banner.component.ts`'s three `@if`/`@else if` branches into a `MESSAGE` map lookup (4.3 collapsed those branches further into one element), and added `@let e = expense()` plus a `@switch`/`@default` category chip to `expense-row.component.ts`. `dashboard-page.component.ts` gained the `@empty` branch.
  - **The row's `@default` is a real runtime fallback, not decoration.** `ExpenseStore.loadInitial()` casts unvalidated `localStorage` JSON straight to `Expense[]`, so a stale or hand-edited `category` can genuinely arrive; the chip renders the raw value instead of going blank. **Do not "improve" this to `@default never`** — that removes the runtime fallback.
  - **4.3** made colour data-driven: `TIER` / `TIER_FILL` / `MESSAGE` are module-level `Record<AllowanceLevel, string>` literals, bound with `[class]="tier()"`. `metric-card.component.ts` gained **optional** `progress` and `level` inputs driving a `role="progressbar"` bar.
  - **Curriculum correction (4.3):** the provided syntax shape says `[className]`. That is React's spelling; it compiles in Angular only because HTML's `className` is a DOM alias for `class`, and it **bypasses Angular's static-class merging**. Use `[class]`. The provided template's `(dismissed)="onAlertDismissed()"` is also superseded by the longhand bind already used.
- **HARD-WON GOTCHA — Tailwind is a build-time scanner, not a runtime engine (verified on tailwindcss 4.3.3):**
  - Tailwind reads source files **as text** at build time and emits CSS only for class names it can see. **Every dynamic class must appear as a complete literal string somewhere in source**, or it silently ships nothing — with a *successful* build and no error.
  - Empirically confirmed in a scratch build: `ok: 'bg-emerald-50'` in a `.ts` file → **present** in CSS; `` `bg-${tone}-600` `` → **missing**. That is why `TIER`/`TIER_FILL` are literal `Record`s and never string interpolation. Comment above `TIER` in `alert-banner.component.ts` warns future editors.
  - Escape hatch, verified working: `@source inline("bg-emerald-600 bg-amber-600 bg-red-600");` in `src/styles.css` forces specific classes into the build. This is v4's replacement for the old `safelist` array — this project is CSS-first (`@import "tailwindcss"` + `@tailwindcss/postcss` in `.postcssrc.json`), so there is no `tailwind.config.js` to edit.
  - Type the map `Record<AllowanceLevel, string>`, never `Record<string, string>`: adding a member to the union must be a compile error, not a runtime `undefined`.
  - Grep gotcha when auditing built CSS: Tailwind escapes `.` and `/` in selectors, so `grep '\.h-1\.5'` misses `h-1.5` (real selector is `.h-1\.5`). Escape before grepping or the check falsely reports MISSING.
- **HARD-WON GOTCHA — `[class]` binding semantics (verified in the 22.1.6 runtime):**
  - `[class]="expr"` **merges** with the static `class` attribute — `checkStylingMap` does `concatStringsWithSpace(tNode.classesWithoutHost, value)`. Put layout in the literal `class` and colour in the bound string; neither clobbers the other.
  - Switching tiers **does** remove the old colour: `updateStylingMap` diffs old vs new keys and emits `undefined` for vanished ones, then `applyStyling` calls `renderer.removeClass` on falsy values. Verified end to end — no stale backgrounds.
  - `[className]` is React syntax. Works by accident on HTML (DOM alias) but skips the merge above and would drop layout classes. Use `[class]`.
- **HARD-WON GOTCHA — two `0`/`NaN` traps in the derived dashboard values:**
  - `@if (barWidth())` would **hide** the progress bar at exactly 0% because `0` is falsy. Hence the separate `hasBar()` computed (`this.progress() !== undefined`) — "no bar" and "zero percent" are different states.
  - `spentPct` needs `budget === 0 ? 0 : …` or a zero budget renders literal `NaN%`.
  - `barWidth()` clamps with `Math.min(100, Math.max(0, …))` so overspending can't overflow the track.
- **Float note, corrected:** `0.8 * 100` is exactly `80`, **not** `80.00000000000001` (an earlier draft claimed otherwise — verified with node). Float noise is real but subtler: `0.29 * 100 === 28.999999999999996` and `(29/200)*100 === 14.499999999999998`. Keep the `Math.round()` on that basis only.
- **Design decisions taken in 4.1 (don't re-derive them):**
  - The three child components live in `src/app/dashboard/` with selectors `app-metric-card` / `app-alert-banner` / `app-expense-row`. Small → **inline** templates (matches `budget-page.component.ts`; only the big form uses an external one).
  - `level` is typed `input.required<AllowanceLevel>()`, **not** the curriculum's optional `input<'ok'|'warn'|'over'>()` — the union already exists in `shared/types.ts` and required is the honest contract.
  - `dismissed` is a **`model(false)`**, not the curriculum's `output<void>()`, so the lesson has a real two-way example. Cost: 4.3's provided template line `(dismissed)="onAlertDismissed()"` must become `[dismissed]="store.alertDismissed()"` + `(dismissedChange)="store.dismissAlert()"`.
  - `removed` is `output<string>()` carrying **the expense id only**, never the `Expense` — the parent already holds the object. Children never inject `ExpenseStore`; the parent calls `store.removeExpense($event)` directly.
  - The dashboard got **one plain `@for`** with `track e.id` purely so a child input has something to render. `@empty` / `@switch` are still 4.2's job. Only **two** metric cards exist (Spent, Budget) — the "Remaining" card + `remaining()` computed arrive in 4.3.
- **HARD-WON GOTCHA — `input()` / `output()` / `model()` must NOT be `protected`:**
  - Declaring them `protected readonly` produces **`TS2445`**, one error **per parent binding site**: `Property 'title' is protected and only accessible within class 'MetricCardComponent' and its subclasses.` A build with 3 children yielded 7 errors, all of them in the *parent* file.
  - **The diagnostic signal: zero errors inside the child's own template; every error reported in the parent.** That's what identifies it.
  - Why: each template's type-check block is emitted as a synthetic method named `_tcbN` (`TCB_FUNCTION_PREFIX = "_tcb"`, `@angular/compiler-cli/bundles/chunk-VBASOQS5.js` ~L9632, emitted by `generateTypeCheckBlock2(env, component, fnName, …)` ~L10028) that type-checks *as if* inside the component's own class — so a component's own template can read its own `protected` members fine. A **parent's** binding of a child's input becomes an ordinary property write against a value typed as the child class, sitting in the *parent's* class body, so plain TypeScript's `protected` rule fires. It is a raw `TS` error surfaced via the `angular-compiler` plugin, not an Angular-specific rule.
  - **Rule:** inputs/outputs/models are the component's **public API** → declare them **public**. Keep `protected` for members only your *own* template touches (an `inject()`ed store, a local `computed()`, a local UI signal) — `DashboardPageComponent` does exactly that.
  - Fix: drop `protected`, write `readonly` (`public readonly` is identical). `readonly` is desirable on all three: it blocks the meaningless `this.title = 'x'` while permitting `expense()` reads, `dismissed.set(...)` and `removed.emit(...)`. Note `readonly` on a **`model()` does not block `.set()`** — it only forbids reassigning the field.
- **HARD-WON GOTCHA — component-local signal state dies with the component:**
  - Symptom hit in 4.1: a dismissed alert banner reappeared after navigating `/dashboard` → `/expenses` → `/dashboard`.
  - Cause: `signal(false)` as a class field is a **field initialiser**, so it runs per *instance*. `app.html` uses `[routerLink]` into a plain `<router-outlet />` with no reuse strategy, so `DashboardPageComponent` is **destroyed and recreated** — the local signal resets. This is **not** a `model()` vs `output()` issue; `output<void>()` + a local flag has the identical lifetime. **Lifetime comes from where the state lives, not from which API wrote it.**
  - **Rule:** state that must outlive the component belongs in the singleton store (`@Service()` = root scope = one instance for the whole app).
  - Fix applied: `ExpenseStore` gained `_alertDismissed = signal(false)`, `readonly alertDismissed = this._alertDismissed.asReadonly()`, and `dismissAlert()`. The dashboard binds the model **longhand** — `[dismissed]="store.alertDismissed()"` + `(dismissedChange)="store.dismissAlert()"` — which is exactly what `[(dismissed)]="x"` expands to, written out because the target is a read-only signal we can't assign to. `AlertBannerComponent` itself did not change.
  - **Deliberately not persisted.** It is a plain signal that `_persist` never *reads*, and an effect only tracks signals it reads — so it never reaches `localStorage`. Dismissal therefore survives navigation but **not** a reload. Persisting it would mean the alert could never be seen again.
  - **Known open gap, not built:** the banner stays dismissed even if `alertLevel()` later crosses `warn`. Re-showing on a level change would need an `effect()` that resets the flag, with `untracked()` because it writes state it reads. Kept out of 4.1 on purpose.
- **Month filtering is Module 5 work, not a bug.** The row list reads `store.expenses()` (all time, unfiltered) while the card reads `store.monthlyTotal()` (`date.startsWith('YYYY-MM')`, current month only) — so a past- **or future**-dated expense gets a row but doesn't move the card. Already signed off as the Module 4 verification trick. The real product gap is that the page is headed "Monthly overview" while the list below it is all-time; the fix is a month filter → **Module 5**.
- **Lesson 4.3's provided dashboard template was corrected during the 3.4 audit:** it called `store.budget().monthlyLimit`, `store.remainingBudget()` and `store.alertThresholdPct()`, none of which exist. `Budget` has `monthlyTotal` + `alertThreshold` (a 0–1 ratio), and the "Remaining" / "Threshold %" figures are `computed()`s that belong in `DashboardPageComponent`. Also: banner tiers come from `store.alertLevel()` (warn at `alertThreshold`, over past `monthlyTotal`) — do not hard-code 60/90.
- **Policy vs. paint split (4.3):** the **store** owns when you are `warn`/`over`; the **components** own which colours those verdicts wear. Neither may re-derive the other's numbers. Change `budget().alertThreshold` to 0.5 and the header, banner and bar all update from that one number.
- **`alternatives.md §6` and `§7` are now filled in** (written at the Module 4 self-check, as the user chose in 4.1). Both cover: when you'd still meet the legacy form, a diff table, a worked code example, why the modern path is better, a numbered translation checklist, and quick-recognition patterns for scanning legacy code. **§8** (`HttpClient` + `toSignal`) is still a placeholder — due in 5.2.
- **Contrast issue, fixed:** `expenses-form.component.html` line 78 used `text-slate-400` for the `{{ noteLength() }}/200` counter (**2.56:1** on white, below WCAG AA). Now `text-slate-500` (**4.76:1**, passes). Rule of thumb for this repo: `slate-500` is the lightest slate that passes AA for normal text on white — don't reach for `400`.
- **Cosmetic, declined:** `ExpenseStore.addExpense` still declares `let newExpense` where `const` would do. Left as-is; not worth a commit on its own.

## Module 5 — Filtering, CSV Export & Advanced Features
- **Status:** pending
- **Lessons completed:** —
- **Next:** 5.1 — RxJS ↔ Signal Interop
- **Notes:**
  - **Carry in from 4.1:** the dashboard's expense list is all-time while its "Spent this month" card is month-scoped, which is the page's main product inconsistency. A month filter is the obvious 5.1 candidate.
  - **Carry in from 4.1:** the banner-dismissal gap — a dismissed banner stays hidden even if `alertLevel()` later crosses `warn`/`over`. An `effect()` in `DashboardPageComponent` resetting the flag on level change would fix it, but needs `untracked()` because it writes state it reads. Deliberately kept out of Module 4.
  - `store.byCategory()` exists (Module 2) and is currently unused by any template — a natural 5.1 grouping/chart input.
  - `docs/alternatives.md §8` (`HttpClient` + `toSignal` manual bridge) is the last empty placeholder; fill it during 5.2.

## Phase 2 — .NET Backend Integration
- **Status:** reserved (waits on Phase 1 completion)
- **Folder:** `tracker-back/`
- **Stack:** ASP.NET Core Web API + EF Core + SQLite (planned)
- **REST contract:** documented in `docs/curriculum.md` → "Future: .NET Backend Integration (Phase 2 Preview)"

---

## Conventions for updating this file

- Update module status after the last lesson in a module is signed off (`in progress` → `done`).
- Append to **Notes** anything that would help a future session: design decisions, snags hit, files touched.
- When forking a new session at a module boundary, point it at this file + `docs/curriculum.md` to ground.
