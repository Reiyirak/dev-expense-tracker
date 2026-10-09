import { Component, computed, input, model } from '@angular/core';

import { AllowanceLevel } from '../shared/types';

/**
 * Every entry is a COMPLETE, LITERAL class string. That is load-bearing, not
 * stylistic: Tailwind is a build-time scanner that reads source text and emits
 * CSS for the class names it finds. A string built at runtime
 * (`bg-${tone}-50`) is invisible to it and the rule never ships.
 *
 * `Record<AllowanceLevel, string>` means a new member on the union with no tier
 * here is a compile error, not a silent gap.
 */
const TIER: Record<AllowanceLevel, string> = {
  ok: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
  warn: 'bg-amber-50 text-amber-900 ring-amber-200',
  over: 'bg-red-50 text-red-900 ring-red-200',
};

const MESSAGE: Record<AllowanceLevel, string> = {
  ok: 'You are within budget for this month.',
  warn: 'You have reached the alert threshold for this month.',
  over: 'You are over budget for this month.',
};

@Component({
  selector: 'app-alert-banner',
  template: `
  @if (!dismissed()) {
    <div
      role="status"
      class="flex items-center justify-between gap-4 rounded-lg px-4 py-3 shadow-sm ring-1"
      [class]="tier()"
    >
      <p class="text-sm font-medium">{{ message() }}</p>

      <button
        type="button"
        (click)="dismissed.set(true)"
        class="shrink-0 rounded-md border border-slate-900/10 bg-white/60 px-3 py-1 text-xs font-medium text-slate-900
        hover:bg-white focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        Dismiss
      </button>
    </div>
  }
  `,
})
export class AlertBannerComponent {
  // Reuse the domain union from types.ts instead of re-spelling 'ok' | 'warn' | 'over'.
  readonly level = input.required<AllowanceLevel>();

  // `model()` rather than `output()`: the CHILD writes this (it hides itself) but
  // the PARENT also needs to know (so it stays dismissed across re-renders).
  // `readonly` does NOT block `dismissed.set(...)` — it only blocks reassigning
  // the field itself, which is why this still compiles.
  readonly dismissed = model(false);

  // The store owns the POLICY (when to warn, when to call it over). This component
  // owns only the PAINT — which colours those three verdicts wear.
  protected readonly tier = computed(() => TIER[this.level()]);
  protected readonly message = computed(() => MESSAGE[this.level()]);
}
