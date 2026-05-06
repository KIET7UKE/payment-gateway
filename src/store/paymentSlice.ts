import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
  reducers: {
    startPayment(state, action: PayloadAction<string>) {
      state.status = 'processing';
      state.currentTransactionId = action.payload;
      state.attemptCount += 1;
      state.failureReason = null;
    },
    paymentSuccess(state) {
      state.status = 'success';
      state.failureReason = null;
    },
    paymentFailed(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.failureReason = action.payload;
    },
    paymentTimeout(state) {
      state.status = 'timeout';
      state.failureReason = 'Request timed out';
    },
    resetPayment(state) {
      state.status = 'idle';
      state.currentTransactionId = null;
      state.attemptCount = 0;
      state.failureReason = null;
    },
    retryPayment(state) {
      state.status = 'processing';
      state.attemptCount += 1;
      state.failureReason = null;
    },
  },
});

export const {
  startPayment,
  paymentSuccess,
  paymentFailed,
  paymentTimeout,
  resetPayment,
  retryPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;
