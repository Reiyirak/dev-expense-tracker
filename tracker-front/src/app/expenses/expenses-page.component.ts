
import { Component } from "@angular/core";
import { ExpensesFormComponent } from "./expenses-form.component";

@Component({
  selector: 'app-expenses-page',
  imports: [ExpensesFormComponent],
  template: `
    <app-expenses-form></app-expenses-form>
  `,
})
export class ExpensesPageComponent { }
