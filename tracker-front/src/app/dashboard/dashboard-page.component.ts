import { Component, inject } from '@angular/core';

import { AlertBannerComponent } from './alert-banner.component';
import { ExpenseRowComponent } from './expense-row.component';
import { MetricCardComponent } from './metric-card.component';
import { ExpenseStore } from '../shared/expense.store';

@Component({
  selector: 'app-dashboard-page',
  imports: [AlertBannerComponent, ExpenseRowComponent, MetricCardComponent],
  template: `
  <section class="space-y-6">
    <header>
      <h2 class="text-2xl font-semibold tracking-tight">Monthly overview</h2>
      <p class="text-sm text-slate-500">Budget vs. spend for the current month.</p>
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

    <div class="grid gap-4 sm:grid-cols-2">
      <app-metric-card title="Spent this month" [value]="store.monthlyTotal()" />
      <app-metric-card title="Budget" [value]="store.budget().monthlyTotal" />
    </div>

    <ul
      class="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-6 shadow-sm"
    >
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
  </section>
  `,
})
export class DashboardPageComponent {
  protected readonly store = inject(ExpenseStore);
}
