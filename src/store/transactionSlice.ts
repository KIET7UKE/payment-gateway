import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, TransactionState } from '../types';
import { getTransactionHistory, saveTransactionHistory } from '../utils/storage';

const DUMMY_DATA: Transaction[] = [
  {
    id: '0a973d586eb2482e82b08ba7f0c93a73',
    status: 'success',
    amount: 100000000000,
    currency: 'INR',
    timestamp: '2026-05-06T14:08:00.000Z',
    attemptCount: 1,
    cardholderName: 'Rohal Biswal',
    cardType: 'visa'
  },
  {
    id: '6ccf30b7e28a4c89876543210fedcba9',
    status: 'success',
    amount: 100000000000,
    currency: 'INR',
    timestamp: '2026-05-06T14:08:00.000Z',
    attemptCount: 1,
    cardholderName: 'Rohal Biswal',
    cardType: 'visa'
  },
  {
    id: '7094f82be3124d56b9c8a7b6c5d4e3f2',
    status: 'success',
    amount: 200.00,
    currency: 'INR',
    timestamp: '2026-05-06T14:08:00.000Z',
    attemptCount: 1,
    cardholderName: 'Rohal Biswal',
    cardType: 'mastercard'
  }
];

const savedHistory = getTransactionHistory();
const initialState: TransactionState = {
  history: savedHistory.length > 0 ? savedHistory : DUMMY_DATA,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction(state, action: PayloadAction<Transaction>) {
      state.history = [action.payload, ...state.history];
      saveTransactionHistory(state.history);
    },
    updateTransaction(
      state,
      action: PayloadAction<{ id: string; updates: Partial<Transaction> }>
    ) {
      const index = state.history.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.history[index] = { ...state.history[index], ...action.payload.updates };
        saveTransactionHistory(state.history);
      }
    },
  },
});

export const { addTransaction, updateTransaction } = transactionSlice.actions;

export default transactionSlice.reducer;
