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
| Bootstrap | `bootstrapApplication(AppComponent, appConfig)` in `main.ts` | `platformBrowserDynamic().bootstrapModule(AppModule)` in `main.ts` |
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
bootstrapApplication(AppComponent, appConfig);

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
2. Move each component from `declarations` to its own `@Component({ imports: [...] })` array. Add `CommonModule` (or specific directives) into `imports` if the template uses `*ngIf`, `*ngFor`, `*ngFor`, etc.
3. Move each pipe from `declarations` to its own `@Pipe({...})` decorator and import into consuming components.
4. Drop `bootstrap` — standalone has no equivalent; `bootstrapApplication(AppComponent, ...)` does the job.
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

## §4 — Template-Driven Forms walk-through

**Filled during:** Lesson 3.1 (Form Paradigm Choice)

## §5 — Typed Reactive Forms walk-through

**Filled during:** Lesson 3.2 (Signal Forms vs Typed Reactive Forms)

## §6 — `@Input` / `@Output` decorators

**Filled during:** Lesson 4.1 (Signal Inputs / Outputs / Model)

## §7 — `*ngIf` / `*ngFor` legacy control flow

**Filled during:** Lesson 4.2 (Modern Control Flow)

## §8 — HttpClient + `toSignal` manual bridge

**Filled during:** Lesson 5.2 (`httpResource()` for External Data)
