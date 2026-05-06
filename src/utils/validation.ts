import { CardType } from '../types';
import { getCvvLength, getMaxCardLength } from './cardUtils';

function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function validateCardholderName(name: string): string | undefined {
  if (!name || name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return 'Name can only contain letters and spaces';
  }
  return undefined;
}

export function validateCardNumber(rawDigits: string, cardType: CardType): string | undefined {
  const digits = rawDigits.replace(/\D/g, '');
  const maxLength = getMaxCardLength(cardType);

  if (digits.length !== maxLength) {
    return `Card number must be ${maxLength} digits`;
  }

  if (!luhnCheck(digits)) {
    return 'Invalid card number (failed Luhn check)';
  }

  return undefined;
}

export function validateExpiry(month: string, year: string): string | undefined {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (isNaN(m) || m < 1 || m > 12) {
    return 'Invalid month (01-12)';
  }

  if (isNaN(y)) {
    return 'Invalid year';
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (y < currentYear || (y === currentYear && m < currentMonth)) {
    return 'Card has expired';
  }

  return undefined;
}

export function validateCvv(cvv: string, cardType: CardType): string | undefined {
  const length = getCvvLength(cardType);
  if (!/^\d+$/.test(cvv) || cvv.length !== length) {
    return `CVV must be ${length} digits`;
  }
  return undefined;
}

export function validateAmount(amount: string): string | undefined {
  const val = parseFloat(amount);
  if (isNaN(val) || val < 1) {
    return 'Minimum amount is 1';
  }
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    return 'Max 2 decimal places allowed';
  }
  return undefined;
}
