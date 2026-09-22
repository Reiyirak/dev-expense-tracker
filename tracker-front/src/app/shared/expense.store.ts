import { computed, signal, Service } from '@angular/core';

import { Expense, Budget, Category, AllowanceLevel } from './types';

@Service()
export class ExpenseStore {
  readonly expenses = signal<Expense[]>([]);
  readonly budget = signal<Budget>({
    monthlyTotal: 200,
    alertThreshold: 0.8
  });

  readonly monthlyTotal = computed(() => {
    // let total = 0;
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    // const list = this.expenses();
    // for (let i = 0; i < list.length; i++) {
    //   if (list[i].date.startsWith(ym)) {
    //     total += list[i].amount;
    //   }
    // }
    // return total;

    return this.expenses()
      .filter((e) => e.date.startsWith(ym))
      .reduce((sum, e) => sum + e.amount, 0);
  });

  readonly byCategory = computed<Record<Category, number>>(() => {
    const totals: Record<Category, number> = {
      hosting: 0,
      apis: 0,
      domains: 0,
      courses: 0,
    };
    for (const e of this.expenses()) {
      totals[e.category] += e.amount;
    }
    return totals;
  });

  readonly alertLevel = computed<AllowanceLevel>(() => {
    const spent = this.monthlyTotal();
    const b = this.budget();

    if (spent > b.monthlyTotal) return 'over';
    if (spent >= b.monthlyTotal * b.alertThreshold) return 'warn';
    return 'ok';
  });
}
