interface Budget {
  monthly_total: number;
  alert_threshold: allowence_threshold;
}

interface Expense {
  readonly id: unknown;
  readonly category: Category;
  readonly ammount: number;
  readonly date: string;
  readonly note: string;
}

type allowence_threshold = 'ok' | 'warn' | 'over'

type Category = 'hosting' | 'apis' | 'domains' | 'courses';

const CATEGORIES: readonly Category[] = ['hosting', 'apis', 'domains', 'courses'];
