import { Component, input, output } from '@angular/core';

import { Expense } from '../shared/types';

@Component({
  selector: 'app-expense-row',
  template: `
  @let e = expense();

  <div class="flex w-full items-center justify-between gap-4 py-3">
    <div class="min-w-0">
      @if (e.note) {
        <p class="truncate text-sm font-medium text-slate-900">{{ e.note }}</p>
      } @else {
        <p class="text-sm text-slate-500">No note</p>
      }

      <div class="mt-1 flex items-center gap-2 text-xs text-slate-500">
        <span class="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
          @switch (e.category) {
            @case ('hosting') {
              Hosting
            }
            @case ('apis') {
              APIs
            }
            @case ('domains') {
              Domains
            }
            @case ('courses') {
              Courses
            }
            @default {
              {{ e.category }}
            }
          }
        </span>
        <time [attr.datetime]="e.date">{{ e.date }}</time>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-4">
      <span class="text-sm font-semibold tabular-nums">{{ e.amount }}</span>
      <button
        type="button"
        (click)="removed.emit(e.id)"
        [attr.aria-label]="'Remove ' + (e.note || e.category)"
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
