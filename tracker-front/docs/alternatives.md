# Alternatives — Legacy Angular Paradigms

> This file documents legacy Angular approaches for **recognition**, not for new code. When you encounter a legacy codebase or library, these notes help you read it and translate it to the modern path used in `src/`.
>
> **The modern path wins.** Per AGENTS.md and the pedagogical rules, every lesson uses the current Angular v22+ idiom. Anything in this file is "what you'd see if you opened an Angular 14 or earlier project."

## §1 — NgModules vs. Standalone Bootstrap

**Filled during:** Lesson 1.3 (Standalone Components & Feature Folder Layout)

### When you'd reach for it
- Maintaining a pre-Angular 14 codebase (NgModules were the only way until standalone landed in v14, became default in v17, fully default in v20+)
- A third-party library that hasn't migrated to standalone components
- Reading a Stack Overflow answer from 2019

You will **not** write new code with NgModules in 2026. You might *read* it.

### The diff vs. the modern path

| Concern | Standalone (modern) | NgModule (legacy) |
|---|---|---|
| Bootstrap | `bootstrapApplication(App, appConfig)` in `main.ts` (Angular 22's root class is `App` from `app.ts`, not `AppComponent`) | `platformBrowserDynamic().bootstrapModule(AppModule)` in `main.ts` |
| Root config | `ApplicationConfig` exported from `app.config.ts` | `@NgModule({...})` class exported from `app.module.ts` |
| Routing | `provideRouter(routes)` in `app.config.ts` | `RouterModule.forRoot(routes)` imported in `AppModule.imports` |
| Component deps | `@Component({ imports: [RouterOutlet, RouterLink] })` | Component has no `imports` array; deps come from the module's `imports` |
| Service scope | `@Service()` (or `providedIn: 'root'`) | Listed in `providers: []` array of a module |
| Component standalone flag | Don't set it (default in v20+) | `standalone: false` (or absent in pre-14) |

### Anatomy of an `@NgModule`

```ts
@NgModule({
  declarations: [AppComponent, ExpensesPageComponent],   // components, pipes, directives in this module
  imports: [
    BrowserModule,                                        // Angular runtime
    RouterModule.forRoot(routes),                         // routing
    FormsModule,                                          // template-driven forms
  ],
  providers: [ExpenseStore],                              // services
  exports: [AppComponent],                                // visible to other modules
  bootstrap: [AppComponent],                             // root component
})
export class AppModule {}
```

Five arrays. Standalone collapses most of these down into component-level `imports: []` arrays and a single `ApplicationConfig.providers`.

### Minimal side-by-side

**Standalone — what you're building:**

```ts
// main.ts
bootstrapApplication(App, appConfig);

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    ExpenseStore,                                  // providedIn: 'root' equivalent
  ],
};

// app.component.ts
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

**NgModule — legacy equivalent:**

```ts
// main.ts
platformBrowserDynamic().bootstrapModule(AppModule);

// app.module.ts
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
  ],
  providers: [ExpenseStore],
  bootstrap: [AppComponent],
})
export class AppModule {}

// app.component.ts
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

### Translation checklist (NgModule → Standalone)

1. Move `providers` from `AppModule` into `app.config.ts` `providers`. Convert `RouterModule.forRoot(routes)` → `provideRouter(routes)`.
2. Move each component from `declarations` to its own `@Component({ imports: [...] })` array. Add `CommonModule` (or specific directives) into `imports` if the template uses `*ngIf`, `*ngFor`, `ngClass`, etc.
3. Move each pipe from `declarations` to its own `@Pipe({...})` decorator and import into consuming components.
4. Drop `bootstrap` — standalone has no equivalent; `bootstrapApplication(App, ...)` does the job.
5. Delete `AppModule`.

### Quick recognition patterns

NgModule smell (when scanning a codebase):
- File containing `@NgModule({...})`
- `declarations: [FooComponent, BarPipe, ...]`
- `bootstrap: [AppComponent]`
- `RouterModule.forRoot(...)` or `RouterModule.forChild(...)`
- Components *without* an `imports: []` array

Standalone smell:
- `bootstrapApplication(...)` in `main.ts`
- `ApplicationConfig` exports
- `provideRouter`, `provideHttpClient`, `provideAnimations` (the `provide*` family)
- Components *with* an `imports: []` array (the standalone give-away)

---

## §2 — Zone.js retained mode

**Filled during:** Lesson 1.4 (Zoneless Change Detection)

### When you'd reach for it

Almost never in Angular v22+. Angular 22 ships zoneless by default — no provider, no `polyfills`, no `zone.js` import. You'd reach for Zone-retained mode only if:

- A third-party library explicitly requires Zone.js (rare in 2026; most have migrated)
- You're maintaining a pre-Angular-18 codebase
- You're debugging a Zone-related bug in legacy code

You will **not** write new code with `provideZoneChangeDetection` in Angular 22+.

### The diff vs. the modern path

| Concern | Zoneless (default in v22+) | Zone-retained (legacy) |
|---|---|---|
| Provider in `app.config.ts` | None needed | `provideZoneChangeDetection({ eventCoalescing: true })` |
| `polyfills` in `angular.json` | None / absent | `["zone.js"]` entry |
| Change-detection trigger | Signal reads/writes + `async` pipe + `markForCheck()` | Zone monkey-patches every async op |
| Performance characteristic | Surgical — only changed signals re-render | Global — every async op re-checks the tree |
| Cost of a click | Re-renders only components reading changed signals | Re-renders the entire component tree |

### What it looks like in legacy code

```ts
// app.config.ts (legacy)
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  ],
};
```

And `angular.json`:
```json
{
  "projects": {
    "tracker-front": {
      "architect": {
        "build": {
          "options": {
            "polyfills": ["zone.js"]
          }
        }
      }
    }
  }
}
```

`eventCoalescing: true` tells Zone to coalesce multiple events into a single change-detection cycle — a small optimization, not the reason to choose Zone.

### Translation checklist (Zone → Zoneless)

1. Remove `provideZoneChangeDetection` from `app.config.ts` providers (if present).
2. Remove `"zone.js"` from `angular.json` polyfills (or delete the `polyfills` array if empty afterward).
3. Audit all templates and components for Zone-dependent patterns:
   - `subscribe(...)` not piped → wrap in `async` pipe or convert to signal via `toSignal()`
   - `setTimeout` / `setInterval` updating view state → wrap in `effect()` or convert to signal
   - Third-party event handlers → same
   - `NgZone.run(...)` / `runOutsideAngular(...)` calls → drop them; signals handle this for free
4. Anywhere the audit finds a non-signal async source that must trigger re-render, add explicit `markForCheck()` (rare; prefer signal conversion).

### Quick recognition patterns

Zone-retained smell (rare in 2026):
- `provideZoneChangeDetection` in `app.config.ts`
- `"zone.js"` in `angular.json` polyfills
- `NgZone` injections in component/service code
- `runOutsideAngular(...)` or `NgZone.run(...)` calls
- Comments mentioning "trigger change detection" outside a signal context

Zoneless smell (modern, default in v22+):
- No zone-related providers in `app.config.ts`
- No `polyfills` array (or empty)
- Signal-driven state throughout `src/app/`
- No `NgZone` references anywhere

## §3 — BehaviorSubject vs. `signal()`

**Filled during:** Lesson 2.2 (Signal Primitives)

### When you'd reach for it

`BehaviorSubject` is the pre-signals way to expose "current value" state in Angular services. You'd reach for it only if:

- You're maintaining a pre-Angular-17 codebase (signals landed in v17, became the default in v22)
- A third-party library exposes values via `BehaviorSubject` and you need to integrate at that boundary
- You genuinely need RxJS operators that don't have signal equivalents (e.g., `switchMap` over an HTTP stream, `debounceTime` on a search input) — and even then, only for the specific async pipeline, not for store state
- Reading a Stack Overflow answer from 2019

You will **not** write new store state with `BehaviorSubject` in 2026. You might *read* it.

### The diff vs. the modern path

| Concern | `signal()` (modern) | `BehaviorSubject` (legacy) |
|---|---|---|
| Setup | `signal<T>(initial)` | `new BehaviorSubject<T>(initial)` |
| Read in TS | `signal()` (call like a function) | `.getValue()` or `.subscribe(v => ...)` |
| Write | `.set(v)` or `.update(fn)` | `.next(v)` |
| Public view | `.asReadonly()` | `.asObservable()` |
| Template integration | `{{ value() }}` (parens) | `{{ value$ \| async }}` |
| Subscription | None — read *is* the subscription | Manual `.subscribe(...)` + cleanup |
| Composition | `computed(() => ...)` auto-tracks dependencies | RxJS operators (`combineLatest`, `map`, …) |
| Cleanup | None needed | `takeUntil(destroy$)` + `ngOnDestroy` |
| `async` pipe | Not needed for store state | Required to consume in template |
| Multi-subscriber safety | Any number of readers, no extra cost | Each subscriber gets its own emission |
| Change detection | Auto-notifies on `.set` / `.update` | Auto-notifies on `.next` (with async pipe) |

### What it looks like in legacy code

A typical pre-signals Angular service exposing state with `BehaviorSubject`:

```ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
class ExpenseStore {
  private _expenses$ = new BehaviorSubject<Expense[]>([]);
  private _budget$ = new BehaviorSubject<Budget>({
    monthlyTotal: 200,
    alertThreshold: 0.8,
  });

  readonly expenses$ = this._expenses$.asObservable();
  readonly budget$ = this._budget$.asObservable();

  readonly monthlyTotal$ = this._expenses$.pipe(
    map((list) => list.reduce((s, e) => s + e.amount, 0)),
  );

  addExpense(input: Omit<Expense, 'id'>) {
    this._expenses$.next([
      ...this._expenses$.getValue(),
      { ...input, id: crypto.randomUUID() },
    ]);
  }

  setBudget(budget: Budget) {
    this._budget$.next(budget);
  }
}
```

Component consumption:

```ts
@Component({...})
class ExpensesPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  expenses: Expense[] = [];

  constructor(private store: ExpenseStore) {}

  ngOnInit() {
    this.store.expenses$
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => (this.expenses = list));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

Template:

```html
<ul>
  <li *ngFor="let e of expenses; trackBy: trackById">{{ e.amount }}</li>
</ul>
<p>{{ (store.monthlyTotal$ | async) | currency }}</p>
```

A lot of ceremony: one subscription, an `async` pipe, a `takeUntil` destroy pattern, `*ngFor` instead of `@for`, and a manual `trackBy`.

### What it looks like in modern code

Same store, signal-based:

```ts
import { Service, computed, signal } from '@angular/core';

@Service()
class ExpenseStore {
  private readonly _expenses = signal<Expense[]>([]);
  private readonly _budget = signal<Budget>({
    monthlyTotal: 200,
    alertThreshold: 0.8,
  });

  readonly expenses = this._expenses.asReadonly();
  readonly budget = this._budget.asReadonly();

  readonly monthlyTotal = computed(() =>
    this._expenses().reduce((s, e) => s + e.amount, 0),
  );

  addExpense(input: Omit<Expense, 'id'>) {
    this._expenses.update((list) => [
      ...list,
      { ...input, id: crypto.randomUUID() },
    ]);
  }

  setBudget(budget: Budget) {
    this._budget.set(budget);
  }
}
```

Component consumption:

```ts
@Component({...})
class ExpensesPageComponent {
  protected store = inject(ExpenseStore);
}
```

Template:

```html
<ul>
  @for (e of store.expenses(); track e.id) {
    <li>{{ e.amount }}</li>
  }
</ul>
<p>{{ store.monthlyTotal() | currency }}</p>
```

No subscriptions, no `async` pipe, no `takeUntil`, no `*ngFor`. The `async` pipe is gone because `store.monthlyTotal()` already returns the resolved value.

### Translation checklist (BehaviorSubject → signal)

1. `new BehaviorSubject<T>(initial)` → `signal<T>(initial)`.
2. `subject$.asObservable()` → drop entirely. Signals are read directly. Use `.asReadonly()` only when you need a typed read-only view to expose to consumers.
3. `subject$.next(v)` → `signal.set(v)`. If you were transforming before storing, use `signal.update(fn)` instead.
4. `subject$.getValue()` → `signal()` (call the signal as a function).
5. `.subscribe(...)` in components → delete. Read the signal in the template directly.
6. `takeUntil(destroy$)` + `ngOnDestroy` cleanup → delete. Signals don't need teardown.
7. `combineLatest([a$, b$]).pipe(map(...))` for derived state → `computed(() => ...)` reading both signals.
8. `subject$.pipe(map(...))` for transformed state → `computed(() => ...)`.
9. `| async` in templates → drop. Read the signal with parens: `value()`.
10. `*ngFor="let x of xs$ | async"` → `@for (x of xs(); track x.id)`.
11. `trackBy: trackById` → `track x.id` (mandatory in `@for`).
12. If the only async work that remains is genuine RxJS (e.g., `http.get(...).pipe(retry(3))`), keep that pipeline and convert to a signal with `toSignal()` at the boundary — don't pull RxJS into the store.

### Quick recognition patterns

`BehaviorSubject` smell (when scanning a legacy codebase):

- `import { BehaviorSubject, Subject, ReplaySubject } from 'rxjs'`
- `private _x$ = new BehaviorSubject<T>(...)` in a service
- `.asObservable()` calls
- `.next(...)` for state writes
- `.subscribe(...)` in components
- `| async` in templates
- `takeUntil(destroy$)` + `ngOnDestroy` patterns
- `combineLatest`, `switchMap`, `mergeMap` used for derived *state* (not for genuine async work like HTTP)
- `*ngFor`, `*ngIf` instead of `@for`, `@if`
- Manual `trackBy` functions

Signal smell (modern, default in v22+):

- `signal(...)` for writable state
- `computed(...)` for derived state
- `.set(...)` / `.update(...)` for writes
- `.asReadonly()` for read-only views
- `signal()` (parens) to read in templates and TS
- No `| async` for store state
- No `.subscribe()` in components
- No `ngOnDestroy` for subscription cleanup
- Native control flow (`@if`, `@for`, `@switch`)
- `track` is the new `trackBy`

## §4 — Template-Driven Forms walk-through

**Filled during:** Lesson 3.1 (Form Paradigm Choice)

### When you'd reach for it

Template-driven forms are the *oldest* Angular form API. `ngModel` predates standalone components, signals, and even the RxJS-first Reactive Forms that later replaced it as the default recommendation. You'd reach for it only if:

- You're maintaining a pre-Angular-14 codebase
- You're touching a genuinely trivial form — one field, no validation, no programmatic access (a search box, a newsletter signup)
- A third-party library's API takes an `NgModel` input and bridging it costs more than keeping it
- Reading a tutorial from 2018

You will **not** write the expense form this way. It has four fields, four validation rules, and a store-backed submit — precisely the shape where template-driven forms stop being simpler and start being a liability.

### The diff vs. the modern path

| Concern | Signal Forms (modern) | Template-Driven (legacy) |
|---|---|---|
| Declaration | `form(modelSignal, schema)` in TypeScript | `[(ngModel)]="property"` in the template |
| Where state lives | A `FieldTree` of signals you own | The DOM, read back on submit |
| Reading a value | `expenseForm.amount().value()` (a signal) | `this.expense.amount` (untyped class field) |
| Typing | Inferred from the model signal | `any` unless you annotate every property |
| Validation | `schema(...)` + `validate(...)` on a signal | An HTML attribute in the template, or nothing |
| Reactive updates | Free — it is a signal | Needs `valueChanges` (RxJS) or a manual re-read |
| Adding a validator later | Edit the schema | `setValidators()` + `updateValueAndValidity()` |
| Async validation | A `validate()` returning a Promise | `AsyncValidatorFn` returning an Observable |
| Reset | `form().reset()` (state only) + write the model signal (values) | `form.resetForm()`, or clearing fields by hand |
| Accessibility state | `touched()` / `errors()` are signals | Hidden behind the `NgForm` directive instance |
| Unit testing | Pure functions over signals | Needs `TestBed` + DOM interaction to be meaningful |

### What it looks like in legacy code

```ts
// expenses-form.component.ts (template-driven)
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../shared/types';

@Component({
  selector: 'app-expenses-form',
  imports: [FormsModule],
  templateUrl: './expenses-form.component.html',
})
export class ExpensesFormComponent {
  amount: number | undefined;
  category: Category | undefined;
  date = '';
  note = '';

  onSubmit(): void {
    // Nothing in this class knows whether the input is valid.
    // Validation lives in the template as HTML attributes — invisible from TypeScript.
    console.log(this.amount, this.category);
  }
}
```

Template:

```html
<form #f="ngForm" (ngSubmit)="onSubmit()" novalidate>
  <input name="amount" [(ngModel)]="amount" required min="0.01" type="number" />
  <select name="category" [(ngModel)]="category" required>
    <option value="hosting">Hosting</option>
  </select>
  <button type="submit" [disabled]="f.invalid">Save expense</button>
</form>
```

Notice what the class cannot do. It cannot answer *"is the amount valid right now?"* without reaching for `@ViewChild` or an RxJS subscription. Validity lives in the `NgForm` directive instance behind the `#f` template variable; the values live in the DOM. TypeScript has no idea the form exists, so `console.log(this.amount)` compiles happily with `undefined` in it.

### What it looks like in modern code

```ts
// expenses-form.component.ts (Signal Forms)
import { Component, signal } from '@angular/core';
import { form, schema, validate } from '@angular/forms/signals';
import { Category } from '../shared/types';

@Component({
  selector: 'app-expenses-form',
  templateUrl: './expenses-form.component.html',
})
export class ExpensesFormComponent {
  private readonly model = signal({
    amount: 0,
    category: '' as Category,
    date: '',
    note: '',
  });

  protected readonly expenseForm = form(this.model, schema((path) => {
    validate(path.amount, ({ value }) => value > 0 || { positive: true });
  }));
}
```

Every question the class could not answer becomes a signal read — `expenseForm.amount().valid()`, `expenseForm().errors()`, `expenseForm.amount().touched()`. No `@ViewChild`, no subscription, no DOM round-trip, and the form model is a typed signal you can pass straight into the store in Lesson 3.4.

> This snippet is a **structural** sketch to make the contrast legible. The exact Signal Forms API — bindings, submission, and the precise validator signatures — is pinned down against the installed version in **Lesson 3.2**. The typed **Reactive Forms** middle ground, which is what you would write if Signal Forms did not fit, is **§5**.

### Translation checklist (Template-Driven → Signal Forms)

1. Delete the `FormsModule` import from the component's `imports: []`.
2. Move every `[(ngModel)]="x.y"` target into one plain writable `signal<{...}>({...})`. That signal's shape *is* the form model.
3. `new FormGroup({...})` / `new FormControl(...)` → `form(modelSignal)`. No `FormBuilder`.
4. `Validators` arrays → `schema(...)` + `validate(...)` rules. The error shape is **not** identical: Signal Forms errors are `{ kind: 'required' | 'min' | ... }` objects read via `field.getError(kind)` / `field.errors()`, so error-mapping code has to be rewritten.
5. `required` / `min` / `max` / `pattern` / `maxlength` HTML attributes → real validators. Signal Forms do not rely on browser constraint validation — keep `novalidate` and validate explicitly.
6. `this.expense.amount` in TypeScript → `expenseForm.amount().value()`.
7. `formGroup.invalid` → `form().invalid()`.
8. `#f="ngForm"` template reference variables → delete. Reach the form through the class field instead.
9. `form.resetForm()` → **two** calls: `form().reset()` clears `touched`/`dirty` only, and you must also write the model signal yourself to clear the values.
10. Anything reading `valueChanges` → read the field signal directly. Drop the RxJS import.
11. Untyped class properties → inferred types. Delete the `| undefined` annotations; the compiler now proves the shape.
12. If one field genuinely cannot move (an NgModel-only third-party input), keep that single field as `ngModel` and bridge it into the model signal with one write. Do not let one legacy field dictate the architecture of the whole form.

### Quick recognition patterns

Template-driven smell (when scanning a legacy codebase):
- `import { FormsModule } from '@angular/forms'` in a component's `imports`, or in an `NgModule.imports` array
- `[(ngModel)]` or `[ngModel]` in any template
- `#f="ngForm"` / `#f="ngModel"` template reference variables
- `ngSubmit` on the `<form>` element
- Class fields declared `| undefined` or `= null` purely to be form state
- Validation that exists *only* as HTML attributes (`required`, `minlength`) with no TypeScript counterpart
- A hand-rolled two-way binding as an `@Input() value` + `(valueChange)` pair

Signal Forms smell (modern, stable as of Angular 22):
- `form(...)` from `@angular/forms/signals` producing a `FieldTree`
- A plain `signal({...})` acting as the form's single source of truth
- `schema(...)` + `validate(...)` holding the rules
- Field reads shaped like `myForm.field().value()`, `myForm().invalid()`, `myForm.field().touched()`
- `reset()` rather than `resetForm()`
- No `FormsModule` import anywhere in the app

## §5 — Typed Reactive Forms walk-through

**Filled during:** Lesson 3.2 (Signal Forms vs Typed Reactive Forms)

### When you'd reach for it

Reactive Forms are **not deprecated** — they carry no deprecation notice in Angular 22 and remain fully supported. Reach for them when:

- You're maintaining a form that already exists and works. Migrating is optional work, not a bug fix.
- You need `ControlValueAccessor` (a third-party input component with its own `writeValue`/`registerOnChange` contract) and you'd rather not wrap it in a Signal Forms `FormValueControl`.
- A library exposes `FormGroup`/`FormControl` instances as part of *its* public API and you need them as real controls, not as a mirrored `FieldTree`.
- You're on an Angular version below 21/22 without the Signal Forms package.

Do **not** reach for them on a new form in a signals codebase: every control is a second copy of your data, and reading state means either a subscription, an `async` pipe, or a `toSignal` bridge — the exact bridge work this curriculum removes.

### The diff vs. the modern path

| Concern | Signal Forms (modern) | Typed Reactive (legacy) |
|---|---|---|
| Import | `form`, `FormField`, `FormRoot` from `@angular/forms/signals` | `ReactiveFormsModule` from `@angular/forms` |
| Construction | `form(modelSignal, schema(...))` | `new FormGroup({ amount: new FormControl(0, { nonNullable: true }) })` |
| Source of truth | your model signal, the only copy | the `FormGroup`; you sync it to a store by hand |
| Binding | `[formField]="form.amount"` + `[formRoot]` | `[formGroup]="form"` + `formControlName="amount"` |
| Nullability | the control's value type, inferred from the model | `FormControl<number \| null>` unless you pass `nonNullable: true` |
| Reading a value | `form.amount().value()` — a signal | `form.controls.amount.value` — a plain read, not reactive |
| Reactivity | free; it *is* a signal | needs `valueChanges` + `async` pipe, or `toSignal` |
| Validation | `schema((path) => { required(path.x); min(path.x, 1); })` | `Validators` arrays: `Validators.required`, `Validators.min(0.01)` |
| Custom rule | `validate(path.x, ({ value }) => … || { kind: 'positive' })` | a `ValidatorFn`: `(c: AbstractControl) => … \|\| { positive: true }` |
| Cross-field | `validate` / `validateTree` over paths | a group-level `ValidatorFn` on the `FormGroup` |
| Touched / dirty | automatic per `[formField]` binding | manual `markAsTouched()`, or `{ updateOn: 'blur' }` |
| Errors | `field.errors()` / `field.getError('min')` | `control.errors`, untyped `ValidationErrors \| null` |
| Submit | `form(model, { submission: { action } })` — no template handler | `(ngSubmit)` on the `<form>` + `markAllAsTouched()` |
| Reset | `form().reset()` **+** write the model signal | `form.reset()` clears values *and* state in one call |
| Storing | pass `form().value()` straight to the store | build the payload from `getRawValue()`, then `reset()` |

### What it looks like in legacy code

The same expense form, typed Reactive edition:

```ts
// expenses-form.component.ts (typed Reactive Forms)
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { ExpenseStore } from '../shared/expense.store';
import { CATEGORIES } from '../shared/types';

const positiveAmount = (c: AbstractControl): ValidationErrors | null =>
  (c.value as number) > 0 ? null : { positive: true };

const knownCategory = (c: AbstractControl): ValidationErrors | null =>
  (CATEGORIES as readonly string[]).includes(c.value as string)
    ? null
    : { category: true };

@Component({
  selector: 'app-expenses-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
      <label>
        Amount (USD)
        <input type="number" formControlName="amount" />
      </label>
      @if (form.controls.amount.touched && form.controls.amount.invalid) {
        <p>Amount must be greater than 0.</p>
      }

      <label>
        Category
        <select formControlName="category">
          @for (c of categories; track c) {
            <option [value]="c">{{ c }}</option>
          }
        </select>
      </label>

      <label>Date <input type="date" formControlName="date" /></label>
      <label>Note <input type="text" formControlName="note" /></label>

      <button type="submit">Save expense</button>
    </form>
  `,
})
export class ExpensesFormComponent {
  private readonly store = inject(ExpenseStore);

  protected readonly categories = CATEGORIES;

  protected readonly form = new FormGroup({
    amount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01), positiveAmount],
    }),
    category: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, knownCategory],
    }),
    date: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    note: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(200)],
    }),
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.store.addExpense(this.form.getRawValue());
    this.form.reset({ amount: 0, category: '', date: '', note: '' });
  }
}
```

Count the ceremony the Signal Forms version doesn't have: a `FormGroup` literal, four `FormControl` constructors with options objects, two custom `ValidatorFn` declarations, `ReactiveFormsModule` in `imports`, `[formGroup]` + `formControlName` on every control, a `markAllAsTouched()` call before bailing, and a `getRawValue()` copy before the reset.

### What it looks like in modern code

```ts
// expenses-form.component.ts (Signal Forms) — the real 3.2/3.3 code
import { Component, computed, signal } from '@angular/core';
import { form, maxLength, min, required, schema, validate } from '@angular/forms/signals';
import { FormField, FormRoot } from '@angular/forms/signals';

import { CATEGORIES } from '../shared/types';

@Component({
  selector: 'app-expenses-form',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="expenseForm">
      <input type="number" [formField]="expenseForm.amount" />
      <select [formField]="expenseForm.category">
        @for (c of categories; track c) {
          <option [value]="c">{{ c }}</option>
        }
      </select>
      <input type="date" [formField]="expenseForm.date" />
      <input type="text" [formField]="expenseForm.note" />
      <button type="submit">Save expense</button>
    </form>
  `,
})
export class ExpensesFormComponent {
  protected readonly categories = CATEGORIES;

  private readonly model = signal({ amount: 0, category: '', date: '', note: '' });

  protected readonly expenseForm = form(
    this.model,
    schema((path) => {
      required(path.amount);
      min(path.amount, 0.01);
      validate(path.amount, ({ value }) => value > 0 || { kind: 'positive' });
      required(path.category);
      validate(path.category, ({ value }) =>
        (CATEGORIES as readonly string[]).includes(value) || { kind: 'category' },
      );
      required(path.date);
      maxLength(path.note, 200);
    }),
  );
}
```

Same four fields, same five rules. The rules are now one readable block that walks the same paths as the template, and there is no `FormGroup` object to keep in sync with anything.

### Translation checklist (Typed Reactive → Signal Forms)

1. `ReactiveFormsModule` import → import `FormField` (and `FormRoot`) from `@angular/forms/signals`.
2. Delete the `FormGroup` literal. Move each `FormControl`'s initial value into one `signal({...})` — that object *is* the form.
3. `nonNullable: true` → delete it. Nullability now comes from the model's type, and you must widen number fields to `number | null` if the control can be empty.
4. `Validators.required` / `min` / `max` / `maxLength` / `pattern` → `required(path.x)` / `min(path.x, n)` / `max` / `maxLength` / `pattern` inside `schema(...)`. The HTML attributes `min`, `max`, `maxlength`, `pattern`, `required` are **reserved** next to `[formField]` and must be deleted from the template.
5. Custom `ValidatorFn` `(c: AbstractControl) => … || { positive: true }` → `validate(path.x, ({ value }) => … || { kind: 'positive' })`. The argument is a `FieldState`, not an `AbstractControl` — destructure what you need.
6. Group-level cross-field `ValidatorFn` on the `FormGroup` → `validate(path.a, ({ value, ... }) => …)` reading sibling paths, or `validateTree` for a subtree.
7. `[formGroup]="form"` on the `<form>` → `[formRoot]="expenseForm"`, and delete the manual `novalidate` (FormRoot sets it).
8. `formControlName="amount"` on each control → `[formField]="expenseForm.amount"`. No `name` attribute either.
9. `(ngSubmit)="onSubmit()"` → move the handler into the form's options: `form(model, { submission: { action } })`. Note `action` must be `async` and receives the tree (`draft().value()`).
10. `markAllAsTouched()` on a failed submit → `form().markAsTouched()` (same method name).
11. `control.errors` → `field.errors()`; `control.hasError('min')` → `field.getError('min')`. Errors are `{ kind: 'min', … }` objects, not `{ min: {…} }` maps — any error-mapping code has to be rewritten.
12. `control.valueChanges.pipe(debounceTime(300))` → read `field().value()` directly; the debouncing is the framework's problem.
13. `form.reset(value)` → **two** calls: `form().reset()` for `touched`/`dirty`, then `model.set(initialValue)` for the values. `reset()` in Signal Forms deliberately does not touch the data.
14. `setErrors` / `disable()` on a control from outside → `validate()` rules, `disabled(path.x, …)` logic, and `apply()` for reusable schema fragments.
15. `FormBuilder` → nothing. There is no builder; the model signal replaces it.
16. A control you cannot move (an `ngModel`-only or CVA-only third-party input) → keep it and bridge it into the model signal with one write. One legacy field shouldn't dictate the architecture of the form.

### The escape hatch: `compatForm()`

If you must keep real `FormControl` instances — a legacy library API, or a form you're migrating field by field — `compatForm()` from `@angular/forms/signals/compat` wraps a model whose properties *are* Reactive controls and hands back a normal `FieldTree`:

```ts
import { FormControl } from '@angular/forms';
import { required } from '@angular/forms/signals';
import { compatForm } from '@angular/forms/signals/compat';   // rules come from /signals, not /compat

const lastName = new FormControl('Ada');                 // a real FormControl
const model = signal({ first: '', last: lastName });
const form = compatForm(model, (path) => {
  required(path.first);                                 // schema rules still apply
});

form.last().value();  // 'Ada' — the FormControl's value, unwrapped for you
```

That gives you top-down migration without a flag day. It is a bridge, not a destination: new forms here don't use it.

### Quick recognition patterns

Typed Reactive smell (when scanning a legacy codebase):
- `import { ReactiveFormsModule } from '@angular/forms'` in a component's `imports`
- `new FormGroup(`, `FormBuilder`, `FormArray`, `AbstractControl` in a `ValidatorFn` signature
- `[formGroup]` + `formControlName` on template controls
- `.valueChanges`, `.statusChanges`, `.patchValue`, `.setValue` in component code
- `control.errors?.['required']` — index access into an untyped error bag
- `markAllAsTouched()` sprinkled around submit handlers
- A store that has to be manually synced with `form.valueChanges.subscribe(...)`
- An `async` pipe or `toSignal` bridge existing purely to make a form observable

Signal Forms smell (modern, stable as of Angular 22):
- `form(...)` from `@angular/forms/signals` producing a `FieldTree`
- A plain `signal({...})` acting as the form's single source of truth
- `schema(...)` + `validate(...)` holding the rules
- Field reads shaped like `myForm.field().value()`, `myForm().invalid()`, `myForm.field().touched()`
- `reset()` **plus** a `model.set(...)`, rather than one `reset(value)`
- No `ReactiveFormsModule` import anywhere in the app

## §6 — `@Input` / `@Output` decorators

**Filled during:** Lesson 4.1 (Signal Inputs / Outputs / Model)

## §7 — `*ngIf` / `*ngFor` legacy control flow

**Filled during:** Lesson 4.2 (Modern Control Flow)

## §8 — HttpClient + `toSignal` manual bridge

**Filled during:** Lesson 5.2 (`httpResource()` for External Data)
