import { CardType } from '../types';

export function detectCardType(rawNumber: string): CardType {
  const digits = rawNumber.replace(/\D/g, '');
  
  if (/^4/.test(digits)) {
    return 'visa';
  }
  
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) {
    return 'mastercard';
  }
  
  if (/^3[47]/.test(digits)) {
    return 'amex';
  }
  
  return 'unknown';
}

export function formatCardNumber(rawDigits: string, cardType: CardType): string {
  // Allow digits and 'x' characters
  const digits = rawDigits.replace(/[^0-9x]/g, '');
  
  if (cardType === 'amex') {
    // Amex: 4-6-5
    const parts = [
      digits.substring(0, 4),
      digits.substring(4, 10),
      digits.substring(10, 15),
    ].filter(Boolean);
    return parts.join(' ');
  }
  
  // Default: groups of 4
  const parts = digits.match(/.{1,4}/g) || [];
  return parts.join(' ').substring(0, 19); // 16 digits + 3 spaces
}

export function getCvvLength(cardType: CardType): number {
  return cardType === 'amex' ? 4 : 3;
}

export function getMaxCardLength(cardType: CardType): number {
  return cardType === 'amex' ? 15 : 16;
}
