'use client';

import React, { useState, useMemo, forwardRef, useRef } from 'react';
import { 
  PaymentPayload, 
  CardDetails, 
  Currency, 
  CardType, 
  FormErrors 
} from '@/types';
import { 
  detectCardType, 
  formatCardNumber, 
  getCvvLength, 
  getMaxCardLength 
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
import { startPayment, resetPayment } from '@/store/paymentSlice';
import { Loader2, Plus, Lock } from 'lucide-react';

interface CardInputProps {
  onSubmit: (payload: PaymentPayload) => void;
    onValuesChange: (values: {
    cardholderName: string;
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cardType: CardType;
    cvv: string;
  }) => void;
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
      cardNumber: currentNumber.replace(/\s/g, ''),
      expiryMonth: m || '',
      expiryYear: y || '',
      cardType: updates.cardNumber !== undefined ? detectCardType(updates.cardNumber) : cardType,
      cvv: currentCvv
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

  const handleResetForm = () => {
    setCardholderName('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setAmount('');
    setErrors({});
    setTouched({});
    dispatch(resetPayment());
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
      });
    }
  };

  const isFormValid = cardholderName.length >= 2 && 
                      cardNumber.replace(/\D/g, '').length === getMaxCardLength(cardType) && 
                      expiry.length === 5 && 
                      cvv.length === getCvvLength(cardType) && 
                      parseFloat(amount) >= 1 && 
                      Object.values(errors).every(v => v === undefined);

  const isProcessing = paymentStatus === 'processing';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-700">
      <div className="glass-panel overflow-hidden rounded-[24px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/1 p-6">
          <h2 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em]">Payment Details</h2>
          <button 
            type="button"
            onClick={handleResetForm}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
          >
            <Plus size={14} />
            New Payment
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Cardholder Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Cardholder Name</label>
            <input
              ref={ref}
              type="text"
              value={cardholderName}
              onChange={(e) => { setCardholderName(e.target.value); notifyChange({ cardholderName: e.target.value }); }}
              onBlur={() => handleBlur('cardholderName', cardholderName)}
              className="glass-input h-12 w-full rounded-xl px-4 text-sm font-medium"
              placeholder="e.g. Rohal Biswal"
            />
            {errors.cardholderName && <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider ml-1">{errors.cardholderName}</p>}
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Card Number</label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                onBlur={() => handleBlur('cardNumber', cardNumber)}
                className="glass-input h-12 w-full rounded-xl px-4 text-sm font-medium tracking-wider"
                placeholder="0000 0000 0000 0000"
              />
              {cardType !== 'unknown' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[9px] font-black uppercase text-indigo-400">
                  {cardType}
                </div>
              )}
            </div>
            {errors.cardNumber && <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider ml-1">{errors.cardNumber}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Expiry Date</label>
              <input
                type="text"
                value={expiry}
                onChange={handleExpiryChange}
                onBlur={() => handleBlur('expiry', expiry)}
                className="glass-input h-12 w-full rounded-xl px-4 text-sm font-medium"
                placeholder="MM / YY"
              />
              {errors.expiry && <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider ml-1">{errors.expiry}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">CVV</label>
              <input
                type="password"
                value={cvv}
                onChange={handleCvvChange}
                onBlur={() => handleBlur('cvv', cvv)}
                className="glass-input h-12 w-full rounded-xl px-4 text-sm font-medium"
                placeholder="•••"
              />
              {errors.cvv && <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider ml-1">{errors.cvv}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={() => handleBlur('amount', amount)}
                className="glass-input h-12 w-full rounded-xl px-4 text-sm font-bold"
                placeholder="0.00"
              />
              {errors.amount && <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider ml-1">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="glass-input h-12 w-full rounded-xl px-4 text-sm font-bold appearance-none cursor-pointer"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isProcessing}
            className="premium-button mt-4 h-14 w-full rounded-xl group"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Lock size={16} />
                <span>Pay Now</span>
              </div>
            )}
          </button>
        </form>
      </div>

      <div className="glass-panel p-8 rounded-[24px]">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Attempt {attemptCount + 1} of 3</p>
        <h3 className="text-lg font-bold text-white tracking-tight">Ready to Pay</h3>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed max-w-[320px]">
          Please enter your card details to complete the transaction.
        </p>
      </div>
    </div>
  );
});

CardInput.displayName = 'CardInput';

export default CardInput;
