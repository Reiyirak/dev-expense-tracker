import { Component, signal } from "@angular/core";
import { form, FormField, FormRoot } from "@angular/forms/signals";

@Component({
  selector: 'app-expenses-form',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="expenseForm" class="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-slate-700">Amount (USD)</span>
        <input
          type="number"
          step="0.01"
          [formField]="expenseForm.amount"
          class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        />
      </label>

      <label class="block text-sm">
        <span class="mb-1 block font-medium text-slate-700">Category</span>
        <input
          type="text"
          placeholder="hosting"
          [formField]="expenseForm.category"
          class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        />
      </label>

      <label class="block text-sm">
        <span class="mb-1 block font-medium text-slate-700">Date</span>
        <input
          type="date"
          [formField]="expenseForm.date"
          class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        />
      </label>

      <label class="block text-sm">
        <span class="mb-1 block font-medium text-slate-700">Note (optional)</span>
        <input
          type="text"
          placeholder="e.g. Annual Vercel renewal"
          [formField]="expenseForm.note"
          class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        />
      </label>

      <button
        type="submit"
        [disabled]="expenseForm().submitting()"
        class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white
               hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2
               focus-visible:ring-slate-900 focus-visible:ring-offset-2
               disabled:cursor-not-allowed disabled:opacity-50"
      >
        Save expense
      </button>
    </form>
  `,
})
export class ExpensesFormComponent {
  private readonly model = signal({
    amount: 0,
    category: '',
    date: '',
    note: ''
  });
  protected readonly expenseForm = form(this.model, {
    submission: {
      action: async (draft) => {
        console.info('submitted', draft().value());
      },
    },
  });
}
