import { computed, signal, Service, effect } from '@angular/core';

import { Expense, Budget, Category, AllowanceLevel } from './types';

const STORAGE_KEY = 'tracker.expense-store';

@Service()
export class ExpenseStore {
  private readonly _initial = this.loadInitial();
  private readonly _expenses = signal<Expense[]>(this._initial.expenses);
  private readonly _budget = signal<Budget>(this._initial.budget);

  readonly expenses = this._expenses.asReadonly();
  readonly budget = this._budget.asReadonly();

  private readonly _persist = effect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      expenses: this._expenses(),
      budget: this._budget(),
    }));
  });

  readonly monthlyTotal = computed(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

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

  addExpense(input: Omit<Expense, 'id'>): void {
    let newExpense: Expense = { ...input, id: crypto.randomUUID() };
    this._expenses.update((list) => [...list, newExpense]);
  }

  removeExpense(id: string): void {
    this._expenses.update((list) => list.filter((e) => e.id !== id));
  }

  setBudget(budget: Budget): void {
    this._budget.set(budget);
  }

  setAlertThreshold(threshold: number): void {
    this._budget.update((current) => ({
      ...current,
      alertThreshold: threshold
    }));
  }

  private loadInitial(): { expenses: Expense[]; budget: Budget } {
    const defaults = {
      expenses: [] as Expense[],
      budget: { monthlyTotal: 200, alertThreshold: 0.8 } as Budget,
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : defaults.expenses,
        budget: parsed.budget ?? defaults.budget,
      };
    } catch {
      return defaults;
    }
  }
}
