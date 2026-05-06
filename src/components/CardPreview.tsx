'use client';

import React, { useMemo } from 'react';
import { CardType } from '@/types';
import { formatCardNumber } from '@/utils/cardUtils';

interface CardPreviewProps {
  cardholderName: string;
  cardNumber: string;     // raw digits
  expiryMonth: string;
  expiryYear: string;
  cardType: CardType;
  cvv?: string;
}

const CardPreview: React.FC<CardPreviewProps> = ({
  cardholderName,
  cardNumber,
  expiryMonth,
  expiryYear,
  cardType,
}) => {
  const displayCardNumber = useMemo(() => {
    const rawDigits = cardNumber.replace(/\D/g, '');
    const maxLen = cardType === 'amex' ? 15 : 16;
    const paddedDigits = rawDigits.padEnd(maxLen, '•');
    return formatCardNumber(paddedDigits, cardType);
  }, [cardNumber, cardType]);

  const formattedName = cardholderName.toUpperCase() || 'ROHAL BISWAL';
  const displayExpiry = `${expiryMonth.padStart(2, '0') || '00'} / ${expiryYear.padStart(2, '0') || '00'}`;

  const renderCardBranding = () => {
    const brandName = cardType === 'unknown' ? 'SECURE CARD' : cardType.toUpperCase();
    
    return (
      <div className="flex flex-col items-end">
        <span className="text-[12px] font-black tracking-[0.25em] text-white uppercase drop-shadow-sm">
          {brandName}
        </span>
        <div className="h-px w-full bg-linear-to-l from-white/40 to-transparent mt-1" />
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-[400px] h-[250px] animate-in fade-in zoom-in-95 duration-700">
      <div className="absolute inset-0 rounded-[28px] bg-[#0A0A0A] border border-white/5 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-radial-at-tl from-indigo-500/10 via-transparent to-transparent opacity-40" />
        
        {/* Top Section */}
        <div className="absolute top-10 left-10 right-10 flex items-start justify-between">
          {/* Brass Chip */}
          <div className="relative h-[34px] w-[46px] overflow-hidden rounded-[6px] bg-linear-to-br from-[#D4AF37] to-[#8A6D3B] p-[1.5px] shadow-lg">
          </div>
          
          {renderCardBranding()}
        </div>

        {/* Card Number */}
        <div className="absolute top-[115px] left-10 w-full">
          <p className="text-[20px] font-bold tracking-[0.18em] text-white font-mono">
            {displayCardNumber}
          </p>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
          <div className="space-y-2">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Cardholder</p>
            <p className="text-[15px] font-bold text-white uppercase tracking-wider truncate max-w-[180px]">
              {formattedName}
            </p>
          </div>
          
          <div className="space-y-2 text-right">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Expires</p>
            <p className="text-[15px] font-bold text-white tracking-widest font-mono">
              {displayExpiry}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CardPreview);
