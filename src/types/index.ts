export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'timeout';

export type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown';

export type Currency = 'INR' | 'USD';

export interface CardDetails {
  cardholderName: string;
  cardNumber: string;        // raw digits only, no spaces
  expiryMonth: string;       // MM
  expiryYear: string;        // YY
  cvv: string;
}

export interface PaymentPayload {
  transactionId: string;
  cardDetails: CardDetails;
  amount: number;
  currency: Currency;
  attemptNumber: number;
  cardType?: CardType;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  timestamp: string;         // ISO string
  cardType: CardType;
  cardholderName?: string;
  failureReason?: string;
  attemptCount: number;
}

export interface PaymentState {
  status: PaymentStatus;
  currentTransactionId: string | null;
  attemptCount: number;
  failureReason: string | null;
}

export interface TransactionState {
  history: Transaction[];
}

export interface FormErrors {
  cardholderName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  amount?: string;
}

export interface GatewayResponse {
  success: boolean;
  transactionId: string;
  failureReason?: string;
}
