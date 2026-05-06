'use client';

import React, { useState, useRef } from 'react';
import CardInput from '@/components/CardInput';
import CardPreview from '@/components/CardPreview';
import StatusScreen from '@/components/StatusScreen';
import TransactionHistory from '@/components/TransactionHistory';
import ErrorBoundary from '@/components/ErrorBoundary';
import { usePayment } from '@/hooks/usePayment';
import { useAppSelector } from '@/hooks/useAppSelector';
import { CardType } from '@/types';
import { ShieldCheck, Zap } from 'lucide-react';

export default function PaymentPage() {
  const { submitPayment, retryPayment } = usePayment();
  const paymentStatus = useAppSelector((state) => state.payment.status);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [previewValues, setPreviewValues] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cardType: 'unknown' as CardType,
    cvv: '***'
  });

  const focusFormCallback = () => {
    firstFieldRef.current?.focus();
  };

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background selection:bg-indigo-500/30 selection:text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">

          {/* Header - More Compact & Professional */}
          <header className="mb-12 flex items-center justify-between border-b border-white/5 pb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white uppercase">
                  Mock Payment Gateway
                </h1>
                <div className="flex items-center gap-2">
                  <Zap size={10} className="text-indigo-400 fill-indigo-400" />
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                    Sandbox Gateway
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-3 rounded-full border border-white/5 bg-white/2 px-4 py-2 sm:flex">
              <div className="relative flex h-1.5 w-1.5">
                <div className="absolute h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <div className="relative h-1.5 w-1.5 rounded-full bg-indigo-400" />
              </div>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                Demo Mode
              </span>
            </div>
          </header>

          {/* Main Grid - Balanced 2-Column Layout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">

            {/* Left Section: Payment Logic (Cols 1-7) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <CardInput
                  ref={firstFieldRef}
                  onSubmit={submitPayment}
                  onValuesChange={setPreviewValues}
                />
              </div>

              {paymentStatus !== 'idle' && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                  <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
                    <StatusScreen
                      focusFormCallback={focusFormCallback}
                      onRetry={retryPayment}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Section: Visualization (Cols 8-12) */}
            <div className="lg:col-span-5 space-y-8">
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-700">
                <CardPreview
                  cardholderName={previewValues.cardholderName}
                  cardNumber={previewValues.cardNumber}
                  expiryMonth={previewValues.expiryMonth}
                  expiryYear={previewValues.expiryYear}
                  cardType={previewValues.cardType}
                />
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <TransactionHistory />
              </div>
            </div>

          </div>

          {/* Footer - Minimalist */}
          <footer className="mt-20 border-t border-white/5 pt-8 flex flex-col items-center sm:flex-row sm:justify-between opacity-30 transition-opacity hover:opacity-100">
            <div className="flex gap-8 mb-4 sm:mb-0 grayscale">
              <span className="text-[8px] font-black tracking-[0.2em] text-white uppercase">PCI-DSS Compliant</span>
              <span className="text-[8px] font-black tracking-[0.2em] text-white uppercase">256-bit AES</span>
            </div>
            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">
              &copy; 2026 Obsidian Prime Terminal. All Rights Reserved.
            </p>
          </footer>
        </div>
      </main>
    </ErrorBoundary>
  );
}
