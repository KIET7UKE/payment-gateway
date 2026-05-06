import { Transaction } from '../types';

const STORAGE_KEY = 'pg_transactions';

export function getTransactionHistory(): Transaction[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data) as Transaction[];
  } catch (error) {
    console.error('Failed to parse transaction history from localStorage:', error);
    return [];
  }
}

export function saveTransactionHistory(history: Transaction[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save transaction history to localStorage:', error);
  }
}
