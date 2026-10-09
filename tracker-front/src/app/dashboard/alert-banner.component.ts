import { Component, input, model } from '@angular/core';

import { AllowanceLevel } from '../shared/types';

@Component({
  selector: 'app-alert-banner',
  template: `
  @if (!dismissed()) {
    <div
      role="status"
      class="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      @if (level() === 'over') {
        <p class="text-sm font-medium text-slate-900">
          You are over budget for this month.
        </p>
      } @else if (level() === 'warn') {
        <p class="text-sm font-medium text-slate-900">
          You have reached the alert threshold for this month.
        </p>
      } @else {
        <p class="text-sm font-medium text-slate-900">
          You are within budget for this month.
        </p>
      }

      <button
        type="button"
        (click)="dismissed.set(true)"
        class="shrink-0 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2
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
}
