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
- **Status:** pending
- **Lessons completed:** —
- **Next:** 4.1 — Signal Inputs / Outputs / Model
- **Notes:** Lesson 4.3's provided dashboard template was corrected during the 3.4 audit: it called `store.budget().monthlyLimit`, `store.remainingBudget()` and `store.alertThresholdPct()`, none of which exist. `Budget` has `monthlyTotal` + `alertThreshold` (a 0–1 ratio), and the "Remaining" / "Threshold %" figures are `computed()`s that belong in `DashboardPageComponent`. Also: banner tiers come from `store.alertLevel()` (warn at `alertThreshold`, over past `monthlyTotal`) — do not hard-code 60/90.
- **Also due in Module 4:** `docs/alternatives.md §6` (`@Input`/`@Output`) and `§7` (`*ngIf`/`*ngFor`) are still empty placeholders.

## Module 5 — Filtering, CSV Export & Advanced Features
- **Status:** pending
- **Lessons completed:** —
- **Next:** —
- **Notes:** —

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
