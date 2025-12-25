import { useEffect, useRef, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction, SSEConnectionStatus } from '@/types/fraud';

interface TransactionFeedProps {
  transactions: Transaction[];
  status: SSEConnectionStatus;
  onInvestigate: (accountId: string) => void;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function getAmountClass(amount: number): string {
  if (amount >= 100000) return 'amount-high';
  if (amount >= 50000) return 'amount-medium';
  return 'amount-normal';
}

function getTxnIcon(type: string) {
  switch (type) {
    case 'DEBIT':
      return <ArrowUpRight className="w-3.5 h-3.5 text-severity-high" />;
    case 'CREDIT':
      return <ArrowDownLeft className="w-3.5 h-3.5 text-data-positive" />;
    case 'TRANSFER':
      return <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />;
    default:
      return null;
  }
}

export function TransactionFeed({ 
  transactions, 
  status, 
  onInvestigate 
}: TransactionFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [newTxnIds, setNewTxnIds] = useState<Set<string>>(new Set());

  // Track new transactions for animation
  useEffect(() => {
    if (transactions.length > 0) {
      const latestId = transactions[0]?.transactionId;
      if (latestId && !newTxnIds.has(latestId)) {
        setNewTxnIds(prev => new Set([...prev, latestId]));
        
        // Remove animation class after animation completes
        setTimeout(() => {
          setNewTxnIds(prev => {
            const updated = new Set(prev);
            updated.delete(latestId);
            return updated;
          });
        }, 400);
      }
    }
  }, [transactions]);

  return (
    <div className="glass-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-lg">Live Transactions</h2>
          <Badge variant={status === 'connected' ? 'live' : status === 'connecting' ? 'connecting' : 'error'}>
            {status === 'connected' ? 'LIVE' : status === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {transactions.length} transactions
        </span>
      </div>

      {/* Table Header */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border/50">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <div className="col-span-3">Transaction ID</div>
          <div className="col-span-2">Account</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-1">Time</div>
          <div className="col-span-1"></div>
        </div>
      </div>

      {/* Transaction List */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin"
      >
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="status-dot status-dot-connecting mx-auto mb-2 w-3 h-3" />
              <p className="text-sm">Waiting for transactions...</p>
            </div>
          </div>
        ) : (
          transactions.map((txn) => (
            <div
              key={txn.transactionId}
              className={`px-4 py-2.5 border-b border-border/30 data-row ${
                newTxnIds.has(txn.transactionId) ? 'data-row-new' : ''
              }`}
            >
              <div className="grid grid-cols-12 gap-2 items-center text-sm">
                <div className="col-span-3 font-mono text-xs truncate" title={txn.transactionId}>
                  {txn.transactionId}
                </div>
                <button 
                  className="col-span-2 font-mono text-xs text-primary hover:underline text-left truncate"
                  onClick={() => onInvestigate(txn.accountId)}
                  title={txn.accountId}
                >
                  {txn.accountId}
                </button>
                <div className="col-span-1 flex items-center gap-1">
                  {getTxnIcon(txn.txnType)}
                  <span className="text-xs">{txn.txnType}</span>
                </div>
                <div className={`col-span-2 text-right font-mono text-sm ${getAmountClass(txn.amount)}`}>
                  {formatAmount(txn.amount)}
                </div>
                <div className="col-span-2 flex items-center gap-1 text-xs text-muted-foreground truncate">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate" title={txn.location}>{txn.location}</span>
                </div>
                <div className="col-span-1 font-mono text-xs text-muted-foreground">
                  {formatTime(txn.timestamp)}
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    variant="investigate"
                    size="xs"
                    onClick={() => onInvestigate(txn.accountId)}
                  >
                    <Search className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
