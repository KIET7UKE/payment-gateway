'use client';

import React, { useMemo } from 'react';
import { CardType } from '@/types';
import { formatCardNumber, getMaxCardLength } from '@/utils/cardUtils';

interface CardPreviewProps {
  cardholderName: string;
  cardNumber: string; // raw digits, no spaces
  expiryMonth: string;
  expiryYear: string;
  cardType: CardType;
}

export default function CardPreview({
  cardholderName,
  cardNumber,
  expiryMonth,
  expiryYear,
  cardType,
}: CardPreviewProps) {
  const maxLength = useMemo(() => getMaxCardLength(cardType), [cardType]);

  const displayCardNumber = useMemo(() => {
    const raw = cardNumber.replace(/\D/g, '');
    const padded = raw.padEnd(maxLength, '•');
    return formatCardNumber(padded, cardType);
  }, [cardNumber, cardType, maxLength]);

  const displayName = cardholderName.trim() || 'YOUR NAME';
  const displayExpiry = (expiryMonth || 'MM') + '/' + (expiryYear || 'YY');

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Card UI */}
      <div
        role="presentation"
        className="relative h-[220px] w-full max-w-[380px] overflow-hidden rounded-2xl bg-zinc-900 p-8 text-white shadow-2xl transition-all duration-500 hover:scale-[1.02]"
      >
        {/* Card Type Badge */}
        <div className="absolute top-8 right-8">
          {cardType !== 'unknown' && (
            <div className="rounded bg-white/10 px-3 py-1 text-xs font-black tracking-widest uppercase ring-1 ring-white/20 transition-all duration-300">
              {cardType}
            </div>
          )}
        </div>

        {/* Chip Icon Simulation */}
        <div className="mb-10 h-10 w-14 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 opacity-80" />

        {/* Card Number */}
        <div className="mb-6 overflow-hidden">
          <div 
            key={displayCardNumber}
            className="animate-in slide-in-from-bottom-1 fade-in font-mono text-2xl tracking-[0.15em] transition-all duration-300"
          >
            {displayCardNumber}
          </div>
        </div>

        <div className="flex items-end justify-between">
          {/* Cardholder Name */}
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className="text-[10px] font-medium tracking-widest text-zinc-400 uppercase">
              Card Holder
            </span>
            <div 
              key={displayName}
              className="animate-in slide-in-from-bottom-1 fade-in truncate text-sm font-bold tracking-widest uppercase transition-all duration-300"
            >
              {displayName}
            </div>
          </div>

          {/* Expiry Date */}
          <div className="flex flex-col items-end gap-1 overflow-hidden">
            <span className="text-[10px] font-medium tracking-widest text-zinc-400 uppercase">
              Expires
            </span>
            <div 
              key={displayExpiry}
              className="animate-in slide-in-from-bottom-1 fade-in font-mono text-sm font-bold transition-all duration-300"
            >
              {displayExpiry}
            </div>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Accessibility Announcement */}
      <div aria-live="polite" className="sr-only">
        Card details updated. 
        Card number starts with {cardNumber.substring(0, 4) || 'empty'}. 
        Card type is {cardType}. 
        Name is {displayName}. 
        Expiry is {displayExpiry}.
      </div>
    </div>
  );
}
