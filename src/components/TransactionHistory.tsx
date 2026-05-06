'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { Transaction } from '@/types';
import { ChevronDown, ChevronUp, History, Info } from 'lucide-react';

export default function TransactionHistory() {
  const history = useAppSelector((state) => state.transactions.history);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (isoString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(isoString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'timeout': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'processing': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol} ${amount.toFixed(2)}`;
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
        <History size={48} strokeWidth={1.5} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">No transactions yet</p>
        <p className="text-xs">Your payment history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1 text-sm font-bold text-gray-700 uppercase tracking-widest">
        <History size={16} />
        Recent Transactions
      </div>
      
      <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
        {history.map((tx) => (
          <li key={tx.id} className="transition-colors hover:bg-gray-50">
            <button
              onClick={() => toggleExpand(tx.id)}
              aria-expanded={expandedId === tx.id}
              className={`flex w-full items-center justify-between p-4 text-left transition-all ${
                expandedId === tx.id ? 'bg-indigo-50/30' : ''
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs font-bold text-gray-400 uppercase tracking-tighter">
                  ID: {tx.id.substring(0, 8)}…
                </span>
                <span className="text-xs font-medium text-gray-400">
                  {formatDate(tx.timestamp)}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">
                    {formatCurrency(tx.amount, tx.currency)}
                  </p>
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
                {expandedId === tx.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </button>

            {/* Expanded Section */}
            <div 
              aria-live="polite"
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedId === tx.id ? 'max-h-40 border-t border-indigo-100 bg-indigo-50/20 p-4' : 'max-h-0'
              }`}
            >
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <Info size={14} className="mt-0.5 text-indigo-400" />
                  <div className="flex-1 space-y-1">
                    <p className="text-gray-500">Full Transaction ID</p>
                    <p className="font-mono font-medium text-gray-700 select-all">{tx.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <p className="text-gray-500">Attempt Count</p>
                    <p className="font-bold text-gray-700">{tx.attemptCount}</p>
                  </div>
                  {tx.failureReason && (
                    <div>
                      <p className="text-gray-500">Failure Reason</p>
                      <p className="font-bold text-red-500">{tx.failureReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
