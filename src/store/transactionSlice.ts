import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, TransactionState } from '../types';
import { getTransactionHistory, saveTransactionHistory } from '../utils/storage';

const initialState: TransactionState = {
  history: getTransactionHistory(),
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
