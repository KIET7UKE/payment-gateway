'use client';

import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { resetPayment } from '@/store/paymentSlice';
import { usePayment } from '@/hooks/usePayment';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCcw, 
  PlusCircle 
} from 'lucide-react';

interface StatusScreenProps {
  focusFormCallback: () => void;
}

export default function StatusScreen({ focusFormCallback }: StatusScreenProps) {
  const dispatch = useAppDispatch();
  const { status, attemptCount, failureReason, currentTransactionId } = useAppSelector((state) => state.payment);
  const { retryPayment, MAX_RETRIES } = usePayment();
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus management: move focus to screen when results land
  useEffect(() => {
    if (status !== 'idle' && status !== 'processing') {
      containerRef.current?.focus();
    }
  }, [status]);

  if (status === 'idle') return null;

  const handleReset = () => {
    dispatch(resetPayment());
    // Give Redux/React a moment to update DOM before focusing
    setTimeout(focusFormCallback, 0);
  };

  const getRole = () => {
    if (status === 'failed' || status === 'timeout') return 'alert';
    return 'status';
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role={getRole()}
      className="mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl bg-white p-10 text-center shadow-2xl ring-1 ring-gray-200 transition-all focus:outline-none"
    >
      {/* PROCESSING */}
      {status === 'processing' && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Processing payment…</h2>
          <p className="text-gray-500">
            {attemptCount > 1 ? `Attempt ${attemptCount} of ${MAX_RETRIES}` : 'Please do not refresh or close this window.'}
          </p>
        </div>
      )}

      {/* SUCCESS */}
      {status === 'success' && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-50 p-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Payment successful!</h2>
            <p className="text-sm font-medium text-gray-400">
              Transaction ID: <span className="font-mono text-gray-600 uppercase">{currentTransactionId?.substring(0, 8)}…</span>
            </p>
          </div>
          <button
            onClick={handleReset}
            aria-label="Start another payment"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-green-700 active:scale-[0.98]"
          >
            <PlusCircle size={18} />
            Make another payment
          </button>
        </div>
      )}

      {/* FAILED / TIMEOUT */}
      {(status === 'failed' || status === 'timeout') && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className={`rounded-full p-4 ${status === 'failed' ? 'bg-red-50' : 'bg-amber-50'}`}>
              {status === 'failed' ? (
                <XCircle className="h-16 w-16 text-red-500" />
              ) : (
                <AlertCircle className="h-16 w-16 text-amber-500" />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              {status === 'failed' ? 'Payment failed' : 'Request timed out'}
            </h2>
            <p className="text-sm font-medium text-red-500/80">
              {status === 'timeout' ? 'The payment gateway did not respond in time.' : failureReason}
            </p>
          </div>

          <div className="space-y-3">
            {attemptCount < MAX_RETRIES ? (
              <button
                onClick={retryPayment}
                aria-label={`Retry payment. Attempt ${attemptCount} of ${MAX_RETRIES}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98]"
              >
                <RefreshCcw size={18} />
                Retry Payment (Attempt {attemptCount} of {MAX_RETRIES})
              </button>
            ) : (
              <p className="rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-500">
                Maximum retry attempts reached. Please try again later.
              </p>
            )}

            <button
              onClick={handleReset}
              aria-label="Cancel and start new payment"
              className="w-full py-2 text-sm font-semibold text-gray-400 transition-colors hover:text-gray-600"
            >
              Start new payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
