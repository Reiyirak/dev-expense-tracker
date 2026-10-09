import { Component, computed, inject } from '@angular/core';

import { AlertBannerComponent } from './alert-banner.component';
import { ExpenseRowComponent } from './expense-row.component';
import { MetricCardComponent } from './metric-card.component';
import { ExpenseStore } from '../shared/expense.store';

@Component({
  selector: 'app-dashboard-page',
  imports: [AlertBannerComponent, ExpenseRowComponent, MetricCardComponent],
  template: `
  <section class="space-y-6">
    <header class="flex items-end justify-between">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">Monthly overview</h2>
        <p class="text-sm text-slate-500">Budget vs. spend for the current month.</p>
      </div>
      <p class="text-sm text-slate-500">
        Threshold alert at
        <span class="font-medium text-slate-900">{{ thresholdPct() }}%</span>
      </p>
    </header>

    <!--
    The two halves of the bind, written out by hand:
    [dismissed]  == the input half of the child's model()
    (dismissedChange) == the output half of the same model()
    This is exactly what [(dismissed)]="..." would have expanded to. We write
    it longhand because the target is store.alertDismissed() — a read-only
    signal we cannot assign to — plus a method that owns the write.
    The store owns the state, so it survives navigation.
    -->
    <app-alert-banner
      [level]="store.alertLevel()"
      [dismissed]="store.alertDismissed()"
      (dismissedChange)="store.dismissAlert()"
    />

    <div class="grid gap-4 sm:grid-cols-3">
      <app-metric-card
        title="Spent this month"
        [value]="store.monthlyTotal()"
        [progress]="spentPct()"
        [level]="store.alertLevel()"
      />
      <app-metric-card title="Budget" [value]="store.budget().monthlyTotal" />
      <app-metric-card title="Remaining" [value]="remaining()" />
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header class="mb-4 flex items-center justify-between">
        <h3 class="text-base font-semibold">Expense log</h3>
        <span class="text-xs text-slate-500">{{ store.expenses().length }} entries</span>
      </header>

      <ul class="divide-y divide-slate-100">
        @for (e of store.expenses(); track e.id) {
          <li>
            <app-expense-row [expense]="e" (removed)="store.removeExpense($event)" />
          </li>
        } @empty {
          <li class="py-6 text-center text-sm text-slate-500">
            No expenses logged yet. Add one on the Expenses page.
          </li>
        }
      </ul>
    </div>
  </section>
  `,
})
export class DashboardPageComponent {
  protected readonly store = inject(ExpenseStore);

    // Budget.monthlyTotal is the LIMIT. Can go negative once you overspend.
    protected readonly remaining = computed(
      () => this.store.budget().monthlyTotal - this.store.monthlyTotal(),
    );

    // alertThreshold is a 0–1 ratio (0.8), not a percentage. Math.round guards
    // float noise: e.g. 0.29 * 100 lands on 28.999999999999996.
    protected readonly thresholdPct = computed(() =>
      Math.round(this.store.budget().alertThreshold * 100),
    );

    // Division needs a guard — a 0 budget would otherwise yield Infinity or NaN.
    protected readonly spentPct = computed(() => {
      const budget = this.store.budget().monthlyTotal;
      return budget === 0 ? 0 : Math.round((this.store.monthlyTotal() / budget) * 100);
    });
}
