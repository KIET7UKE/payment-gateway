'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Info, 
  Activity, 
  X, 
  Maximize2,
  ExternalLink,
  User
} from 'lucide-react';
import { Transaction } from '@/types';

export default function TransactionHistory() {
  const history = useAppSelector((state) => state.transactions.history);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSelectedId, setModalSelectedId] = useState<string | null>(null);

  const topThree = history.slice(0, 3);

  const formatDate = (isoString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(isoString));
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'timeout': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-zinc-500 bg-white/5 border-white/10';
    }
  };

  const openDetails = (id: string) => {
    setModalSelectedId(id);
    setIsModalOpen(true);
  };

  const TransactionItem = ({ tx, onClick, showAction = false }: { tx: Transaction, onClick: () => void, showAction?: boolean }) => (
    <div
      className="flex w-full items-center justify-between px-6 py-4 transition-all hover:bg-white/2"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${getStatusBadge(tx.status)}`}>
          {tx.status === 'success' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
        </div>
        <div>
          <p className="text-[13px] font-bold text-white tracking-tight">
            {formatCurrency(tx.amount, tx.currency)}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
             <p className="text-[9px] font-medium text-zinc-500">
              {formatDate(tx.timestamp)}
            </p>
            <span className="text-white/10 text-[8px]">•</span>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider truncate max-w-[150px]">
              {tx.cardholderName || 'Unnamed'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getStatusBadge(tx.status)}`}>
          {tx.status}
        </span>
        {showAction && (
          <button 
            onClick={onClick}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-zinc-500 transition-all hover:bg-indigo-500/20 hover:text-indigo-400"
          >
            <ExternalLink size={12} />
          </button>
        )}
      </div>
    </div>
  );

  const DetailsPanel = ({ tx }: { tx: Transaction }) => (
    <div className="glass-panel relative rounded-[24px] overflow-hidden border-t border-indigo-500/30">
      <div className="border-b border-white/5 bg-white/1 p-4">
        <div className="flex items-center gap-3">
          <Info size={12} className="text-indigo-400" />
          <h2 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">Transaction Details</h2>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {[
          { label: 'User Name', value: tx.cardholderName?.toUpperCase() || 'UNNAMED', icon: <User size={10} className="text-indigo-400" /> },
          { label: 'Transaction ID', value: tx.id, mono: true },
          { label: 'Status', value: tx.status, highlight: true },
          { label: 'Amount', value: formatCurrency(tx.amount, tx.currency) },
          { label: 'Card Used', value: `${tx.cardType?.toUpperCase() || 'VISA'} ending ${tx.id.substring(tx.id.length - 4)}` },
          { label: 'Attempts', value: `${tx.attemptCount} of 3` },
          { label: 'Result', value: tx.status === 'success' ? 'Approved' : (tx.failureReason || 'Declined'), dimmed: true },
        ].map((item, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{item.label}</span>
            </div>
            <span className={`text-[10px] font-bold ${
              item.mono ? 'font-mono text-[9px] break-all select-all' : ''
            } ${
              item.highlight ? getStatusBadge(tx.status).split(' ')[0] : 'text-white'
            } ${
              item.dimmed ? 'text-zinc-500' : ''
            }`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  if (history.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center rounded-[24px] p-10 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
          <History size={20} className="text-zinc-700" />
        </div>
        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">No Transactions</p>
      </div>
    );
  }

  const activeModalTx = history.find(t => t.id === modalSelectedId);

  return (
    <>
      <div className="w-full">
        <div className="glass-panel overflow-hidden rounded-[24px]">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/1 px-6 py-5">
            <div className="flex items-center gap-3">
              <Activity size={14} className="text-indigo-400" />
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Transaction History</h2>
            </div>
          </div>
          
          <ul className="divide-y divide-white/3">
            {topThree.map((tx) => (
              <li key={tx.id}>
                <TransactionItem 
                  tx={tx} 
                  onClick={() => openDetails(tx.id)} 
                  showAction
                />
              </li>
            ))}
          </ul>

          <button
            onClick={() => {
              setModalSelectedId(history[0].id);
              setIsModalOpen(true);
            }}
            className="flex w-full items-center justify-center gap-2 border-t border-white/5 bg-white/1 p-4 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 transition-all hover:bg-indigo-500/10"
          >
            <Maximize2 size={10} />
            View Full History ({history.length})
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          <div className="glass-panel relative flex h-full max-h-[700px] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] animate-in zoom-in-95 fade-in duration-300">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/2 px-8 py-5">
              <div className="flex items-center gap-4">
                <History size={16} className="text-indigo-400" />
                <h2 className="text-sm font-black text-white uppercase tracking-tight">Transaction Logs</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-500 hover:text-white transition-all"><X size={16} /></button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-full border-r border-white/5 overflow-y-auto sm:w-1/2 lg:w-2/5">
                <ul className="divide-y divide-white/3">
                  {history.map((tx) => (
                    <li key={tx.id} onClick={() => setModalSelectedId(tx.id)} className="cursor-pointer">
                      <TransactionItem tx={tx} onClick={() => {}} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hidden flex-1 overflow-y-auto p-10 sm:block">
                {activeModalTx ? (
                  <div className="mx-auto max-w-xs">
                    <div className="mb-8 flex flex-col items-center text-center">
                      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 ${getStatusBadge(activeModalTx.status)}`}>
                        {activeModalTx.status === 'success' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tight">{formatCurrency(activeModalTx.amount, activeModalTx.currency)}</h3>
                    </div>
                    <DetailsPanel tx={activeModalTx} />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-600 text-[10px] font-black uppercase tracking-widest text-center px-12">Select an entry from the ledger to view secure details</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
