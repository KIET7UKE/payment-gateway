import { NextRequest, NextResponse } from 'next/server';
import { PaymentPayload, GatewayResponse } from '@/types';

interface ApiResponse extends GatewayResponse {}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pickOutcome(): 'success' | 'failed' | 'timeout' {
  const random = Math.random();
  if (random < 0.6) return 'success';
  if (random < 0.85) return 'failed';
  return 'timeout';
}

function pickFailureReason(): string {
  const reasons = ['Insufficient funds', 'Card declined', 'Invalid card number'];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentPayload = await request.json();
    const { transactionId, amount, currency, attemptNumber } = body;

    // 1. Basic Validation
    if (!transactionId || amount === undefined || !currency) {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 }
      );
    }

    // 2. Simulate Outcome
    const outcome = pickOutcome();
    let response: ApiResponse;
    let status = 200;

    if (outcome === 'success') {
      await delay(1500); // 1.5s is enough to feel real but not hang
      response = { success: true, transactionId };
    } else if (outcome === 'failed') {
      await delay(1500);
      response = { 
        success: false, 
        transactionId, 
        failureReason: pickFailureReason() 
      };
      status = 402;
    } else {
      // Simulate timeout
      await delay(5000); // 5s simulation
      response = { 
        success: false, 
        transactionId, 
        failureReason: 'Gateway timeout' 
      };
      status = 402;
    }

    // 3. Log Outcome
    console.log(`[Payment Gateway] ID: ${transactionId} | Attempt: ${attemptNumber} | Outcome: ${outcome.toUpperCase()}`);

    return NextResponse.json(response, { status });
  } catch (error) {
    console.error('[Payment Gateway Error]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
