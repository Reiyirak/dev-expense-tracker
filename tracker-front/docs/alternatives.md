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
