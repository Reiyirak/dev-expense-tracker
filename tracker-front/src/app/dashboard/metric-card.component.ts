import { Component, computed, input } from '@angular/core';

import { AllowanceLevel } from '../shared/types';

// Literal strings again — Tailwind must be able to read these at build time.
const TIER_FILL: Record<AllowanceLevel, string> = {
  ok: 'bg-emerald-600',
  warn: 'bg-amber-600',
  over: 'bg-red-600',
};

@Component({
  selector: 'app-metric-card',
  template: `
    <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-sm font-medium text-slate-500">{{ title() }}</h3>
      <p class="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{{ value() }}</p>

      @if (hasBar()) {
        <div
          class="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          [attr.aria-label]="title()"
          aria-valuemin="0"
          aria-valuemax="100"
          [attr.aria-valuenow]="barWidth()"
        >
          <div class="h-full rounded-full" [class]="fill()" [style.width.%]="barWidth()"></div>
        </div>
      }
    </article>
  `,
})
export class MetricCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<number>();

  // Optional: omit `progress` and no bar renders. This is 4.2's `@if` doing
  // real work — the Budget and Remaining cards pass nothing.
  readonly progress = input<number>();
  readonly level = input<AllowanceLevel>('ok');

  protected readonly fill = computed(() => TIER_FILL[this.level()]);

  // Clamped so a bar can never exceed its track when you go over budget.
  protected readonly barWidth = computed(() => Math.min(100, Math.max(0, this.progress() ?? 0)));
  protected readonly hasBar = computed(() => this.progress() !== undefined);
}
