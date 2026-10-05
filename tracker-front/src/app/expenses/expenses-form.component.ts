import { Component, signal } from "@angular/core";
import { Category } from "../shared/types";
import { form, FormField, FormRoot } from "@angular/forms/signals";

@Component({
  selector: 'app-expenses-form',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="expenseForm">
      <label>
        Amount:
        <input type="number" [formField]="expenseForm.amount" >
      </label>

      <label>
        Category:
        <input type="string" [formField]="expenseForm.category" >
      </label>

      <label>
        Date:
        <input type="date" [formField]="expenseForm.date" >
      </label>

      <label>
        Amount:
        <input type="string" [formField]="expenseForm.note" >
      </label>

      <button type="submit">Send</button>
    </form>
  `,
})
export class ExpensesFormComponent {
  private readonly model = signal({ amount: 0, category: '' as Category, date: '', note: '' });
  expenseForm = form(this.model);
}
