import { createSlice } from '@reduxjs/toolkit';
import { PaymentState } from '../types';

const initialState: PaymentState = {
  status: 'idle',
  currentTransactionId: null,
  attemptCount: 0,
  failureReason: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {},
});

export default paymentSlice.reducer;
