'use client';

import React, { useState, useMemo, forwardRef, useRef } from 'react';
import { 
  Lock, 
  CreditCard, 
  User, 
  Calendar, 
  Hash, 
  Loader2,
  ChevronDown
} from 'lucide-react';
import { 
  CardType, 
  Currency, 
  PaymentPayload, 
  FormErrors 
} from '@/types';
import { 
  detectCardType, 
  formatCardNumber, 
  getMaxCardLength, 
  getCvvLength 
} from '@/utils/cardUtils';
import { 
  validateCardholderName, 
  validateCardNumber, 
  validateExpiry, 
  validateCvv, 
  validateAmount 
} from '@/utils/validation';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { resetPayment } from '@/store/paymentSlice';

interface CardInputProps {
  onSubmit: (payload: PaymentPayload) => void;
  onValuesChange: (values: any) => void;
}

const CardInput = forwardRef<HTMLInputElement, CardInputProps>(({ onSubmit, onValuesChange }, ref) => {
  const dispatch = useAppDispatch();
  const paymentStatus = useAppSelector((state) => state.payment.status);
  const attemptCount = useAppSelector((state) => state.payment.attemptCount);

  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const lastSubmitTime = useRef<number>(0);
  const cardType = useMemo(() => detectCardType(cardNumber), [cardNumber]);

  const notifyChange = (updates: any) => {
    const currentName = updates.cardholderName !== undefined ? updates.cardholderName : cardholderName;
    const currentNumber = updates.cardNumber !== undefined ? updates.cardNumber : cardNumber;
    const currentExpiry = updates.expiry !== undefined ? updates.expiry : expiry;
    const currentCvv = updates.cvv !== undefined ? updates.cvv : cvv;
    
    const [m, y] = currentExpiry.split('/');
    onValuesChange({
      cardholderName: currentName,
      cardNumber: currentNumber,
      expiryMonth: m || '',
      expiryYear: y || '',
      cardType: detectCardType(currentNumber),
      cvv: currentCvv ? '•'.repeat(currentCvv.length) : '***'
    });
  };

  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (name: string, value: string) => {
    let error: string | undefined;
    switch (name) {
      case 'cardholderName': error = validateCardholderName(value); break;
      case 'cardNumber': error = validateCardNumber(value, cardType); break;
      case 'expiry': { const [m, y] = value.split('/'); error = validateExpiry(m || '', y || ''); break; }
      case 'cvv': error = validateCvv(value, cardType); break;
      case 'amount': error = validateAmount(value); break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const formatted = formatCardNumber(raw.substring(0, getMaxCardLength(cardType)), cardType);
    setCardNumber(formatted);
    notifyChange({ cardNumber: formatted });
    if (touched.cardNumber) validateField('cardNumber', raw);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    let formatted = val.length > 2 ? val.substring(0, 2) + '/' + val.substring(2) : val;
    setExpiry(formatted);
    notifyChange({ expiry: formatted });
    if (touched.expiry) validateField('expiry', formatted);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, getCvvLength(cardType));
    setCvv(val);
    notifyChange({ cvv: val });
    if (touched.cvv) validateField('cvv', val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastSubmitTime.current < 300) return;
    lastSubmitTime.current = now;
    if (paymentStatus === 'processing') return;

    if (validateField('cardholderName', cardholderName) && 
        validateField('cardNumber', cardNumber) && 
        validateField('expiry', expiry) && 
        validateField('cvv', cvv) && 
        validateField('amount', amount)) {
      const transactionId = crypto.randomUUID();
      const [m, y] = expiry.split('/');
      onSubmit({
        transactionId,
        cardDetails: { cardholderName, cardNumber: cardNumber.replace(/\s/g, ''), expiryMonth: m, expiryYear: y, cvv },
        amount: parseFloat(amount),
        currency,
        attemptNumber: attemptCount + 1,
        cardType: cardType
      });
    }
  };

  const isProcessing = paymentStatus === 'processing';
  const isFormValid = cardholderName.length >= 2 && cardNumber.replace(/\s/g, '').length >= 15 && expiry.length === 5 && cvv.length >= 3 && amount.length > 0;

  return (
    <div className="w-full">
      <div className="glass-panel overflow-hidden rounded-[24px]">
        <div className="border-b border-white/5 bg-white/1 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">New Transaction</h2>
            </div>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              Attempt {attemptCount + 1} of 3
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Cardholder Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
              <User size={10} className="text-zinc-700" />
              Cardholder Name
            </label>
            <input
              ref={ref}
              type="text"
              value={cardholderName}
              onChange={(e) => { setCardholderName(e.target.value); notifyChange({ cardholderName: e.target.value }); }}
              onBlur={() => handleBlur('cardholderName', cardholderName)}
              className="glass-input h-11 w-full rounded-xl px-4 text-sm font-medium transition-all"
              placeholder="e.g. ROHAL BISWAL"
            />
            {errors.cardholderName && <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider ml-1">{errors.cardholderName}</p>}
          </div>

          {/* Card Number */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
              <CreditCard size={10} className="text-zinc-700" />
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                onBlur={() => handleBlur('cardNumber', cardNumber)}
                className="glass-input h-11 w-full rounded-xl px-4 text-sm font-medium tracking-widest"
                placeholder="0000 0000 0000 0000"
              />
              {cardType !== 'unknown' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[8px] font-black uppercase text-zinc-400">
                  {cardType}
                </div>
              )}
            </div>
            {errors.cardNumber && <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider ml-1">{errors.cardNumber}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                <Calendar size={10} className="text-zinc-700" />
                Expiry Date
              </label>
              <input
                type="text"
                value={expiry}
                onChange={handleExpiryChange}
                onBlur={() => handleBlur('expiry', expiry)}
                className="glass-input h-11 w-full rounded-xl px-4 text-sm font-medium"
                placeholder="MM / YY"
              />
              {errors.expiry && <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider ml-1">{errors.expiry}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                <Hash size={10} className="text-zinc-700" />
                CVV
              </label>
              <input
                type="password"
                value={cvv}
                onChange={handleCvvChange}
                onBlur={() => handleBlur('cvv', cvv)}
                className="glass-input h-11 w-full rounded-xl px-4 text-sm font-medium"
                placeholder="•••"
              />
              {errors.cvv && <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider ml-1">{errors.cvv}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                <Hash size={10} className="text-zinc-700" />
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={() => handleBlur('amount', amount)}
                className="glass-input h-11 w-full rounded-xl px-4 text-sm font-bold"
                placeholder="0.00"
              />
              {errors.amount && <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider ml-1">{errors.amount}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Currency</label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="glass-input h-11 w-full rounded-xl px-4 text-sm font-bold appearance-none cursor-pointer pr-10 transition-all"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isProcessing}
            className="premium-button mt-4 h-12 w-full rounded-xl group relative overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              {isProcessing ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Lock size={14} className="transition-transform group-hover:scale-110" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Pay Now</span>
                </>
              )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
});

CardInput.displayName = 'CardInput';

export default CardInput;
