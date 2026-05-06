'use client';

import { useRef, useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { 
  startPayment, 
  paymentSuccess, 
  paymentFailed, 
  paymentTimeout, 
  retryPayment as retryPaymentAction 
} from '@/store/paymentSlice';
import { addTransaction, updateTransaction } from '@/store/transactionSlice';
import { PaymentPayload, Transaction, GatewayResponse } from '@/types';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 15000; // 15s grace period

export function usePayment() {
  const dispatch = useAppDispatch();
  const { status, currentTransactionId, attemptCount } = useAppSelector((state) => state.payment);
  const lastPayload = useRef<PaymentPayload | null>(null);

  const canRetry = (status === 'failed' || status === 'timeout') && attemptCount < MAX_RETRIES;

  const executePayment = useCallback(async (payload: PaymentPayload, isRetry: boolean) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      console.log(`[usePayment] Initiating request to /api/pay for TX: ${payload.transactionId}`);
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data: GatewayResponse = await response.json();

      if (response.ok && data.success) {
        console.log(`[usePayment] Payment SUCCESS for TX: ${payload.transactionId}`);
        dispatch(paymentSuccess());
        dispatch(updateTransaction({ 
          id: payload.transactionId, 
          updates: { status: 'success' } 
        }));
      } else {
        const reason = data.failureReason || 'Payment failed';
        console.warn(`[usePayment] Payment FAILED for TX: ${payload.transactionId} | Reason: ${reason}`);
        dispatch(paymentFailed(reason));
        dispatch(updateTransaction({ 
          id: payload.transactionId, 
          updates: { status: 'failed', failureReason: reason, attemptCount: payload.attemptNumber } 
        }));
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`[usePayment] Request TIMED OUT for TX: ${payload.transactionId}`);
        dispatch(paymentTimeout());
        dispatch(updateTransaction({ 
          id: payload.transactionId, 
          updates: { status: 'timeout', failureReason: 'Request timed out', attemptCount: payload.attemptNumber } 
        }));
      } else {
        console.error(`[usePayment] Network Error for TX: ${payload.transactionId}`, error);
        const errorMessage = 'Network error. Please try again.';
        dispatch(paymentFailed(errorMessage));
        dispatch(updateTransaction({ 
          id: payload.transactionId, 
          updates: { status: 'failed', failureReason: errorMessage, attemptCount: payload.attemptNumber } 
        }));
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }, [dispatch]);

  const submitPayment = useCallback(async (payload: PaymentPayload) => {
    lastPayload.current = payload;
    
    // 1. Dispatch start to Redux
    dispatch(startPayment(payload.transactionId));

    // 2. Add initial transaction record
    const newTransaction: Transaction = {
      id: payload.transactionId,
      amount: payload.amount,
      currency: payload.currency,
      status: 'processing',
      timestamp: new Date().toISOString(),
      attemptCount: 1,
      cardType: payload.cardType || 'unknown',
      cardholderName: payload.cardDetails.cardholderName
    };
    dispatch(addTransaction(newTransaction));

    // 3. Execute
    await executePayment(payload, false);
  }, [dispatch, executePayment]);

  const retryPayment = useCallback(async () => {
    if (!lastPayload.current || attemptCount >= MAX_RETRIES) return;

    // 1. Prepare retry payload
    const updatedPayload: PaymentPayload = {
      ...lastPayload.current,
      attemptNumber: attemptCount + 1,
    };
    lastPayload.current = updatedPayload;

    // 2. Dispatch retry to Redux (increments attempt count in state)
    dispatch(retryPaymentAction());

    // 3. Execute (updates existing transaction)
    await executePayment(updatedPayload, true);
  }, [dispatch, executePayment, attemptCount]);

  return {
    submitPayment,
    retryPayment,
    status,
    currentTransactionId,
    attemptCount,
    canRetry,
    MAX_RETRIES,
  };
}
