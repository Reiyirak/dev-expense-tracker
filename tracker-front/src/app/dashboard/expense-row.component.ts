import { Component, input, output } from '@angular/core';

import { Expense } from '../shared/types';

@Component({
  selector: 'app-expense-row',
  template: `
    <div class="flex w-full items-center justify-between gap-4 py-3">
      <div class="min-w-0">
        <p class="truncate text-sm font-medium text-slate-900">
          {{ expense().note || expense().category }}
        </p>
        <p class="text-xs text-slate-500">
          {{ expense().category }} · {{ expense().date }}
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-4">
        <span class="text-sm font-semibold tabular-nums">{{ expense().amount }}</span>
        <button
          type="button"
          (click)="removed.emit(expense().id)"
          [attr.aria-label]="'Remove ' + (expense().note || expense().category)"
          class="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700
                 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          Remove
        </button>
      </div>
    </div>
  `,
})
export class ExpenseRowComponent {
  readonly expense = input.required<Expense>();

  // Payload is the id, not the Expense. The parent already has the object.
  readonly removed = output<string>();
}
