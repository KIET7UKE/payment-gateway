'use client';

import React, { useState, useRef } from 'react';
import CardInput from '@/components/CardInput';
import CardPreview from '@/components/CardPreview';
import StatusScreen from '@/components/StatusScreen';
import TransactionHistory from '@/components/TransactionHistory';
import { usePayment } from '@/hooks/usePayment';
import { useAppSelector } from '@/hooks/useAppSelector';
import { CardType } from '@/types';
import { ShieldCheck } from 'lucide-react';

export default function PaymentPage() {
  const { submitPayment } = usePayment();
  const paymentStatus = useAppSelector((state) => state.payment.status);
  
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // State for live card preview
  const [previewValues, setPreviewValues] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cardType: 'unknown' as CardType,
  });

  const focusFormCallback = () => {
    firstFieldRef.current?.focus();
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gray-900 uppercase">
                SecurePay<span className="text-indigo-600">Gateway</span>
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Trusted by 2M+ businesses
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-gray-500 shadow-sm ring-1 ring-gray-100">
              Production Environment
            </span>
          </div>
        </header>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* Left Column: Preview & Input */}
          <div className="space-y-8">
            <section className="flex flex-col items-center">
              <CardPreview 
                cardholderName={previewValues.cardholderName}
                cardNumber={previewValues.cardNumber}
                expiryMonth={previewValues.expiryMonth}
                expiryYear={previewValues.expiryYear}
                cardType={previewValues.cardType}
              />
            </section>

            {paymentStatus === 'idle' && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardInput 
                  ref={firstFieldRef}
                  onSubmit={submitPayment}
                  onValuesChange={setPreviewValues}
                />
              </section>
            )}
          </div>

          {/* Right Column: Status & History */}
          <div className="space-y-8">
            {paymentStatus !== 'idle' && (
              <section className="animate-in fade-in zoom-in-95 duration-500">
                <StatusScreen focusFormCallback={focusFormCallback} />
              </section>
            )}

            <section className="animate-in fade-in slide-in-from-bottom-4 delay-150 duration-500">
              <TransactionHistory />
            </section>
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-200 pt-8 text-center">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            &copy; 2026 SecurePay Gateway Inc. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-6 opacity-30 grayscale transition-all hover:opacity-100 hover:grayscale-0">
            {/* Mock logos or text */}
            <span className="text-sm font-black italic">VISA</span>
            <span className="text-sm font-black italic">MasterCard</span>
            <span className="text-sm font-black italic">AMEX</span>
            <span className="text-sm font-black italic">PCI DSS</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
