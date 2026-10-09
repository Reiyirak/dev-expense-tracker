import { Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  template: `
    <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-sm font-medium text-slate-500">{{ title() }}</h3>
      <p class="mt-2 text-3xl font-semibold tracking-tight">{{ value() }}</p>
    </article>
  `,
})
export class MetricCardComponent {
  // Inputs/outputs/models are public API — the PARENT binds them, so no
  // `protected` here. `readonly` still stops this component reassigning them.
  readonly title = input.required<string>();
  readonly value = input.required<number>();
}
