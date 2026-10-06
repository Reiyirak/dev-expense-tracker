import { Component, computed, signal } from "@angular/core";
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

import { CATEGORIES } from '../shared/types';

@Component({
  selector: 'app-expenses-form',
  imports: [FormField, FormRoot],
  templateUrl: './expenses-form.component.html',
})
export class ExpensesFormComponent {
  protected readonly categories = CATEGORIES;

  private readonly model = signal({
    amount: 0,
    category: '',
    date: '',
    note: '',
  });

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
          console.info('submitted', draft().value());
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
}
