export type Category = 'hosting' | 'apis' | 'domains' | 'courses';

export type AllowanceLevel = 'ok' | 'warn' | 'over';

export const CATEGORIES: readonly Category[] = ['hosting', 'apis', 'domains', 'courses'];

export interface Expense {
  readonly id: string;
  readonly category: Category;
  readonly amount: number;
  readonly date: string;
  readonly note?: string;
}

export interface Budget {
  readonly monthlyTotal: number;
  readonly alertThreshold: number;
  readonly perCategoryAllowances?: Partial<Record<Category, number>>;
}

