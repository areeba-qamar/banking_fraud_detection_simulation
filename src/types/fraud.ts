export interface Transaction {
  transactionId: string;
  accountId: string;
  txnType: 'DEBIT' | 'CREDIT' | 'TRANSFER';
  amount: number;
  currency: string;
  location: string;
  merchant: string;
  timestamp: string;
}

export interface FraudAlert {
  alertId: string;
  accountId: string;
  alertType: string;
  alertScore: number;
  relatedTxnId: string;
  details: Record<string, unknown>;
  detectedAt: string;
}

export interface AccountProfile {
  accountId: string;
  avgDailySpend: number;
  avgTxAmount: number;
  homeCountry: string;
  riskTier: string;
}

export type AlertSeverity = 'high' | 'medium' | 'low';

export type TimeWindow = '5m' | '15m' | '1h';

export interface FilterState {
  accountId: string;
  minAmount: number;
  timeWindow: TimeWindow;
}

export type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
