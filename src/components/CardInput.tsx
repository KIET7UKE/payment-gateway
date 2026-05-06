'use client';

import React, { useState, useMemo, forwardRef } from 'react';
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
import { startPayment } from '@/store/paymentSlice';
import { Loader2, CreditCard, Lock, User, Calendar } from 'lucide-react';

interface CardInputProps {
  onSubmit: (payload: PaymentPayload) => void;
  // Live update props for preview
  onValuesChange: (values: {
    cardholderName: string;
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cardType: CardType;
  }) => void;
}

const CardInput = forwardRef<HTMLInputElement, CardInputProps>(({ onSubmit, onValuesChange }, ref) => {
  const dispatch = useAppDispatch();
  const paymentStatus = useAppSelector((state) => state.payment.status);
  const attemptCount = useAppSelector((state) => state.payment.attemptCount);

  // Form State
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState(''); // MM/YY
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('INR');

  // Touched State
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const cardType = useMemo(() => detectCardType(cardNumber), [cardNumber]);

  // Notify parent of changes for real-time preview
  const notifyChange = (updates: any) => {
    const [m, y] = (updates.expiry !== undefined ? updates.expiry : expiry).split('/');
    onValuesChange({
      cardholderName: updates.cardholderName !== undefined ? updates.cardholderName : cardholderName,
      cardNumber: (updates.cardNumber !== undefined ? updates.cardNumber : cardNumber).replace(/\s/g, ''),
      expiryMonth: m || '',
      expiryYear: y || '',
      cardType: updates.cardNumber !== undefined ? detectCardType(updates.cardNumber) : cardType,
    });
  };

  // Errors State
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (name: string, value: string) => {
    let error: string | undefined;

    switch (name) {
      case 'cardholderName':
        error = validateCardholderName(value);
        break;
      case 'cardNumber':
        error = validateCardNumber(value, cardType);
        break;
      case 'expiry': {
        const [m, y] = value.split('/');
        error = validateExpiry(m || '', y || '');
        break;
      }
      case 'cvv':
        error = validateCvv(value, cardType);
        break;
      case 'amount':
        error = validateAmount(value);
        break;
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
    const maxDigits = getMaxCardLength(cardType);
    const trimmed = raw.substring(0, maxDigits);
    const formatted = formatCardNumber(trimmed, cardType);
    setCardNumber(formatted);
    notifyChange({ cardNumber: formatted });
    if (touched.cardNumber) validateField('cardNumber', trimmed);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    
    let formatted = val;
    if (val.length > 2) {
      formatted = val.substring(0, 2) + '/' + val.substring(2);
    }
    setExpiry(formatted);
    notifyChange({ expiry: formatted });
    if (touched.expiry) validateField('expiry', formatted);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, getCvvLength(cardType));
    setCvv(val);
    if (touched.cvv) validateField('cvv', val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isNameValid = validateField('cardholderName', cardholderName);
    const isNumberValid = validateField('cardNumber', cardNumber);
    const isExpiryValid = validateField('expiry', expiry);
    const isCvvValid = validateField('cvv', cvv);
    const isAmountValid = validateField('amount', amount);

    if (isNameValid && isNumberValid && isExpiryValid && isCvvValid && isAmountValid) {
      const transactionId = crypto.randomUUID();
      const [m, y] = expiry.split('/');
      
      const cardDetails: CardDetails = {
        cardholderName,
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryMonth: m,
        expiryYear: y,
        cvv,
      };

      const payload: PaymentPayload = {
        transactionId,
        cardDetails,
        amount: parseFloat(amount),
        currency,
        attemptNumber: attemptCount + 1,
      };

      dispatch(startPayment(transactionId));
      onSubmit(payload);
    }
  };

  const isFormValid = 
    cardholderName.length >= 2 &&
    cardNumber.replace(/\D/g, '').length === getMaxCardLength(cardType) &&
    expiry.length === 5 &&
    cvv.length === getCvvLength(cardType) &&
    parseFloat(amount) >= 1 &&
    Object.values(errors).every(v => v === undefined);

  const isProcessing = paymentStatus === 'processing';
  const allTouched = Object.keys(touched).length >= 5;

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <h2 className="text-xl font-bold">Secure Checkout</h2>
        <p className="text-sm opacity-90">Enter your payment details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {/* Cardholder Name */}
        <div className="space-y-1.5">
          <label htmlFor="cardholderName" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <User size={16} className="text-gray-400" />
            Cardholder Name
          </label>
          <input
            id="cardholderName"
            ref={ref}
            type="text"
            value={cardholderName}
            onChange={(e) => {
              setCardholderName(e.target.value);
              notifyChange({ cardholderName: e.target.value });
              if (touched.cardholderName) validateField('cardholderName', e.target.value);
            }}
            onBlur={() => handleBlur('cardholderName', cardholderName)}
            aria-describedby={errors.cardholderName ? 'name-error' : undefined}
            className={`w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
              errors.cardholderName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
            }`}
            placeholder="John Doe"
          />
          {errors.cardholderName && (
            <p id="name-error" className="text-xs font-medium text-red-500">{errors.cardholderName}</p>
          )}
        </div>

        {/* Card Number */}
        <div className="space-y-1.5">
          <label htmlFor="cardNumber" className="flex items-center justify-between text-sm font-semibold text-gray-700">
            <span className="flex items-center gap-2">
              <CreditCard size={16} className="text-gray-400" />
              Card Number
            </span>
            {cardType !== 'unknown' && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 ring-1 ring-gray-200">
                {cardType}
              </span>
            )}
          </label>
          <input
            id="cardNumber"
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            onBlur={() => handleBlur('cardNumber', cardNumber)}
            aria-describedby={errors.cardNumber ? 'number-error' : undefined}
            className={`w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
              errors.cardNumber ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
            }`}
            placeholder="0000 0000 0000 0000"
          />
          {errors.cardNumber && (
            <p id="number-error" className="text-xs font-medium text-red-500">{errors.cardNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Expiry */}
          <div className="space-y-1.5">
            <label htmlFor="expiry" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Calendar size={16} className="text-gray-400" />
              Expiry Date
            </label>
            <input
              id="expiry"
              type="text"
              value={expiry}
              onChange={handleExpiryChange}
              onBlur={() => handleBlur('expiry', expiry)}
              aria-describedby={errors.expiry ? 'expiry-error' : undefined}
              className={`w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
                errors.expiry ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
              }`}
              placeholder="MM/YY"
            />
            {errors.expiry && (
              <p id="expiry-error" className="text-xs font-medium text-red-500">{errors.expiry}</p>
            )}
          </div>

          {/* CVV */}
          <div className="space-y-1.5">
            <label htmlFor="cvv" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Lock size={16} className="text-gray-400" />
              CVV
            </label>
            <input
              id="cvv"
              type="password"
              value={cvv}
              onChange={handleCvvChange}
              onBlur={() => handleBlur('cvv', cvv)}
              aria-describedby={errors.cvv ? 'cvv-error' : undefined}
              className={`w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
                errors.cvv ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
              }`}
              placeholder="***"
            />
            {errors.cvv && (
              <p id="cvv-error" className="text-xs font-medium text-red-500">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label htmlFor="amount" className="text-sm font-semibold text-gray-700">Payment Amount</label>
          <div className="flex gap-2">
            <select
              value={currency}
              onChange={(e) => {
                const newCurrency = e.target.value as Currency;
                setCurrency(newCurrency);
              }}
              className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
            <div className="relative flex-1">
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (touched.amount) validateField('amount', e.target.value);
                }}
                onBlur={() => handleBlur('amount', amount)}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                className={`w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
                  errors.amount ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                }`}
                placeholder="100.00"
              />
            </div>
          </div>
          {errors.amount && (
            <p id="amount-error" className="text-xs font-medium text-red-500">{errors.amount}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || !allTouched || isProcessing}
          className={`relative mt-2 w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold tracking-wide text-white transition-all active:scale-[0.98] disabled:opacity-50 ${
            isProcessing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Processing...
            </span>
          ) : (
            `Pay ${currency} ${amount || '0.00'}`
          )}
        </button>

        <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-medium text-gray-400 uppercase tracking-widest">
          <Lock size={10} />
          256-bit Secure Encryption
        </div>
      </form>
    </div>
  );
});

CardInput.displayName = 'CardInput';

export default CardInput;
