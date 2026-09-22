import { Component, inject } from '@angular/core';

import { ExpenseStore } from '../shared/expense.store';

@Component({
  selector: 'app-dashboard-page',
  template: `<p class="text-slate-600">{{ store.monthlyTotal() }}</p>`,
})
export class DashboardPageComponent {
  protected store = inject(ExpenseStore);
}
