import { computed, signal, Service, effect } from '@angular/core';

import { Expense, Budget, Category, AllowanceLevel } from './types';

const STORAGE_KEY = 'tracker.expense-store';

@Service()
export class ExpenseStore {
  private readonly _initial = this.loadInitial();
  private readonly _expenses = signal<Expense[]>(this._initial.expenses);
  private readonly _budget = signal<Budget>(this._initial.budget);

  // Declared BEFORE the persist effect on purpose. It is a plain signal, not  // part of the payload written to localStorage below: dismissal should survive
  // route navigation (the store is a singleton, the dashboard component is not)
  // but NOT survive a reload. "Stop showing me this banner" is session-scoped;
  // persisting it would mean the alert could never be seen again.
  //
  // Because the persist effect below never reads this signal, the effect
  // never tracks it either — an effect only depends on signals it reads.
  private readonly _alertDismissed = signal(false);

  readonly expenses = this._expenses.asReadonly();
  readonly budget = this._budget.asReadonly();
  readonly alertDismissed = this._alertDismissed.asReadonly();

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

  dismissAlert(): void {
    this._alertDismissed.set(true);
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
