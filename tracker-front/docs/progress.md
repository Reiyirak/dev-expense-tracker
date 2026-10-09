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
- **Status:** in progress (4.1 complete)
- **Lessons completed:** 4.1
- **Next:** 4.2 — Modern Control Flow
- **Files touched in 4.1:** `src/app/dashboard/metric-card.component.ts` (new), `alert-banner.component.ts` (new), `expense-row.component.ts` (new), `dashboard-page.component.ts` (rewritten from a one-line stub into the parent that composes the three children), `src/app/shared/expense.store.ts` (see banner-dismissal note).
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
- **Deferred by explicit user decision (4.1):** `docs/alternatives.md §6` (`@Input`/`@Output`) and `§7` (`*ngIf`/`*ngFor`) are still empty placeholders. User chose "code first" — they get written at the Module 4 self-check, alongside §7 due in 4.2.
- **Cosmetic, declined:** `ExpenseStore.addExpense` still declares `let newExpense` where `const` would do. Left as-is; not worth a commit on its own.

## Module 5 — Filtering, CSV Export & Advanced Features
- **Status:** pending
- **Lessons completed:** —
- **Next:** —
- **Notes:** **Carry in from 4.1:** the dashboard's expense list is all-time while its "Spent this month" card is month-scoped, which is the page's main product inconsistency. A month filter is the obvious 5.1 candidate. The banner-dismissal gap (dismissed banner stays hidden across a `warn`/`over` threshold crossing) is also parked here.

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
