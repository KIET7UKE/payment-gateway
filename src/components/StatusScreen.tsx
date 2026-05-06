'use client';

import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { resetPayment } from '@/store/paymentSlice';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  RotateCcw, 
  ArrowLeft,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';

interface StatusScreenProps {
  focusFormCallback: () => void;
  onRetry: () => void;
}

const StatusScreen: React.FC<StatusScreenProps> = ({ focusFormCallback, onRetry }) => {
  const dispatch = useAppDispatch();
  const { status, attemptCount, failureReason } = useAppSelector((state) => state.payment);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus the screen for accessibility
  useEffect(() => {
    if (status !== 'idle') {
      containerRef.current?.focus();
    }
  }, [status]);

  if (status === 'idle') return null;

  const handleReset = () => {
    dispatch(resetPayment());
    // Use a small timeout to ensure the form is rendered before focusing
    setTimeout(focusFormCallback, 0);
  };

  const handleRetry = () => {
    onRetry();
  };

  const isMaxRetries = attemptCount >= 3;

  return (
    <div 
      ref={containerRef}
      tabIndex={-1}
      className="glass-panel mx-auto flex w-full max-w-md flex-col items-center overflow-hidden rounded-[24px] focus:outline-none"
    >
      <div className="flex w-full flex-col items-center p-10 text-center">
        {/* State Icon */}
        <div className="mb-8 relative">
          {status === 'processing' && (
            <div className="relative">
              <Loader2 size={80} className="animate-spin text-indigo-500 opacity-20" strokeWidth={1} />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck size={32} className="text-indigo-400 animate-pulse" />
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
              <CheckCircle2 size={40} className="text-indigo-400" />
            </div>
          )}

          {(status === 'failed' || status === 'timeout') && (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
              {status === 'timeout' ? <Clock size={40} className="text-amber-400" /> : <AlertTriangle size={40} className="text-red-400" />}
            </div>
          )}
        </div>

        {/* Content */}
        {status === 'processing' && (
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Processing</h2>
            <p className="text-sm font-medium text-zinc-400">Verifying your request...</p>
            {attemptCount > 1 && (
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] pt-4">
                Attempt {attemptCount} of 3
              </p>
            )}
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Success</h2>
            <p className="text-sm font-medium text-zinc-400">Your payment was successful.</p>
          </div>
        )}

        {(status === 'failed' || status === 'timeout') && (
          <div role="alert" className="space-y-3">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
               {status === 'timeout' ? 'Timeout' : 'Payment Failed'}
            </h2>
            <p className="text-sm font-bold text-red-400">{failureReason || 'Transaction could not be completed'}</p>
            {isMaxRetries ? (
              <p className="text-xs text-red-400/80 font-bold mt-2">Maximum retry attempts reached. Transaction cancelled.</p>
            ) : (
              <p className="text-xs text-zinc-500">Please check your details and try again.</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-10 flex w-full flex-col gap-3">
          {status === 'success' && (
            <button
              onClick={handleReset}
              className="premium-button flex h-[52px] w-full items-center justify-center rounded-xl"
            >
              New Transaction
            </button>
          )}

          {(status === 'failed' || status === 'timeout') && !isMaxRetries && (
            <button
              onClick={handleRetry}
              aria-label={`Retry payment, attempt ${attemptCount + 1} of 3`}
              className="premium-button flex h-[52px] w-full items-center justify-center rounded-xl"
            >
              <RotateCcw size={18} className="mr-2" />
              Retry Attempt {attemptCount + 1}
            </button>
          )}

          {(status === 'failed' || status === 'timeout') && (
            <button
              onClick={handleReset}
              className="flex h-[52px] w-full items-center justify-center rounded-xl border border-white/5 bg-white/3 text-sm font-bold text-white transition-all hover:bg-white/8"
            >
              <ArrowLeft size={18} className="mr-2" />
              Return to Form
            </button>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full bg-white/2 border-t border-white/5 py-4 text-center">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          Ref: {crypto.randomUUID().substring(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  );
};

export default StatusScreen;
