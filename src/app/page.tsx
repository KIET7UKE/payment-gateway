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
      <main className="min-h-screen selection:bg-indigo-500/30 selection:text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
          
          {/* Header */}
          <header className="mb-16 flex flex-col items-center justify-between gap-6 sm:flex-row sm:px-4">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.5)] ring-1 ring-white/20">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Payment Dashboard
                </h1>
                <div className="flex items-center gap-2">
                  <Zap size={12} className="text-indigo-400 fill-indigo-400" />
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
                    SecurePay <span className="text-white/20 mx-1">|</span> Fast & Secure
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/2 px-6 py-3 backdrop-blur-xl">
              <div className="relative flex h-2 w-2">
                <div className="absolute h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <div className="relative h-2 w-2 rounded-full bg-indigo-400" />
              </div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                Live Secure
              </span>
            </div>
          </header>

          {/* Core Interface */}
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start lg:gap-24">
            
            {/* Left Column: Form */}
            <div className="space-y-12">
              {paymentStatus === 'idle' && (
                <CardInput 
                  ref={firstFieldRef}
                  onSubmit={submitPayment}
                  onValuesChange={setPreviewValues}
                />
              )}
              
              {paymentStatus !== 'idle' && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <StatusScreen 
                    focusFormCallback={focusFormCallback} 
                    onRetry={retryPayment}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Card & History */}
            <div className="space-y-16">
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-10 duration-700">
                <CardPreview 
                  cardholderName={previewValues.cardholderName}
                  cardNumber={previewValues.cardNumber}
                  expiryMonth={previewValues.expiryMonth}
                  expiryYear={previewValues.expiryYear}
                  cardType={previewValues.cardType}
                />
              </div>

              <TransactionHistory />
            </div>

          </div>

          {/* Footer */}
          <footer className="mt-24 border-t border-white/5 pt-12 flex flex-col items-center gap-8">
            <div className="flex flex-wrap justify-center gap-12 opacity-10 transition-all hover:opacity-40 grayscale contrast-125">
              <span className="text-xs font-black tracking-[0.3em] text-white">VISA</span>
              <span className="text-xs font-black tracking-[0.3em] text-white">MASTERCARD</span>
              <span className="text-xs font-black tracking-[0.3em] text-white">SECURE</span>
              <span className="text-xs font-black tracking-[0.3em] text-white">ENCRYPTED</span>
            </div>
            <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.5em]">
              &copy; 2026 SecurePay Inc.
            </p>
          </footer>
        </div>
      </main>
    </ErrorBoundary>
  );
}
