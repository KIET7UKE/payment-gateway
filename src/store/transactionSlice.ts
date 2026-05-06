import { createSlice } from '@reduxjs/toolkit';
import { TransactionState } from '../types';

const initialState: TransactionState = {
  history: [],
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {},
});

export default transactionSlice.reducer;
