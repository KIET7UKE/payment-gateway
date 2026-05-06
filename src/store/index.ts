import { configureStore } from '@reduxjs/toolkit';
import paymentReducer from './paymentSlice';
import transactionReducer from './transactionSlice';

export const store = configureStore({
  reducer: {
    payment: paymentReducer,
    transactions: transactionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
