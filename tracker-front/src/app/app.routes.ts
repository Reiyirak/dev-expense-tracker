import { Routes } from '@angular/router';
import { DashboardPageComponent } from './dashboard/dashboard-page.component';
import { ExpensesPageComponent } from './expenses/expenses-page.component';
import { BudgetPageComponent } from './budget/budget-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    component: DashboardPageComponent
  },
  {
    path: 'expenses',
    component: ExpensesPageComponent
  },
  {
    path: 'budget',
    component: BudgetPageComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
