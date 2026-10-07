import { Component, computed, inject, signal } from "@angular/core";
import {
  form,
  FormField,
  FormRoot,
  maxLength,
  min,
  required,
  schema,
  validate,
} from "@angular/forms/signals";

import { ExpenseStore } from "../shared/expense.store";
import { CATEGORIES, Category } from '../shared/types';

// One definition of "empty", used both for the initial state and for the reset.
// Spreading it into `signal()`/`set()` gives each one its own object — sharing a
// single mutable object here would be a bug waiting to happen.
const EMPTY_DRAFT = { amount: 0, category: '', date: '', note: '' };

@Component({
  selector: 'app-expenses-form',
  imports: [FormField, FormRoot],
  templateUrl: './expenses-form.component.html',
})
export class ExpensesFormComponent {
  protected readonly categories = CATEGORIES;

  private readonly store = inject(ExpenseStore);
  private readonly model = signal({ ...EMPTY_DRAFT });

  protected readonly expenseForm = form(
    this.model,
    schema((path) => {
      required(path.amount, { message: 'Amount is required.' });
      min(path.amount, 0.01, { message: 'Amount must be greater than 0.' });

      required(path.category, { message: 'Category is required.' });
      validate(path.category, ({ value }) =>
        (CATEGORIES as readonly string[]).includes(value())
          ? undefined
          : { kind: 'category', message: 'Pick one of the four categories.' },
      );

      required(path.date, { message: 'Date is required.' });

      maxLength(path.note, 200, { message: 'Keep the note under 200 characters.' });
    }),
    {
      submission: {
        action: async (draft) => {
          const value = draft().value();

          // Only runs when every rule passed, so `value.category` is provably in
          // CATEGORIES — see 3.3's membership rule. The store mints the id.
          this.store.addExpense({ ...value, category: value.category as Category });

          // Two resets: state first, then the data itself.
          this.expenseForm().reset();
          this.model.set({ ...EMPTY_DRAFT });
        },

        onInvalid: () => {
          // Reveal every message at once. Nothing the user typed is discarded.
          this.expenseForm().markAsTouched();
        },
      },
    },
  );

  protected readonly showAmountError = computed(
    () => this.expenseForm.amount().touched() && this.expenseForm.amount().invalid(),
  );

  protected readonly showCategoryError = computed(
    () => this.expenseForm.category().touched() && this.expenseForm.category().invalid(),
  );

  protected readonly showDateError = computed(
    () => this.expenseForm.date().touched() && this.expenseForm.date().invalid(),
  );

  protected readonly showNoteError = computed(
    () => this.expenseForm.note().touched() && this.expenseForm.note().invalid(),
  );

  protected readonly noteLength = computed(() => this.expenseForm.note().value().length);
}
