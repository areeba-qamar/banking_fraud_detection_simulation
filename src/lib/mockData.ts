import { Transaction, FraudAlert, AccountProfile } from '@/types/fraud';

const merchants = [
  'Amazon.pk', 'Daraz.pk', 'FoodPanda', 'Careem', 'HBL ATM', 
  'Shell Station', 'Total Parco', 'Hyperstar', 'Metro Cash', 
  'Gourmet Foods', 'Naheed Pharmacy', 'Khaadi Store'
];

const locations = [
  'Karachi,PK', 'Lahore,PK', 'Islamabad,PK', 'Rawalpindi,PK',
  'Faisalabad,PK', 'Multan,PK', 'Peshawar,PK', 'Quetta,PK'
];

const alertTypes = [
  'UNUSUAL_AMOUNT', 'VELOCITY_SPIKE', 'GEOGRAPHIC_ANOMALY',
  'MERCHANT_MISMATCH', 'TIME_ANOMALY', 'PATTERN_DEVIATION'
];

const txnTypes: ('DEBIT' | 'CREDIT' | 'TRANSFER')[] = ['DEBIT', 'CREDIT', 'TRANSFER'];

let transactionCounter = 1000;
let alertCounter = 9000;

export function generateTransactionId(): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `TXN-${date}-${String(transactionCounter++).padStart(4, '0')}`;
}

export function generateAlertId(): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `ALRT-${date}-${String(alertCounter++).padStart(4, '0')}`;
}

export function generateAccountId(): string {
  return `AC-${100000 + Math.floor(Math.random() * 900000)}`;
}

export function generateTransaction(): Transaction {
  const amount = Math.random() > 0.9 
    ? Math.floor(Math.random() * 500000) + 50000 // 10% chance of high amount
    : Math.floor(Math.random() * 15000) + 100;
    
  return {
    transactionId: generateTransactionId(),
    accountId: generateAccountId(),
    txnType: txnTypes[Math.floor(Math.random() * txnTypes.length)],
    amount,
    currency: 'PKR',
    location: locations[Math.floor(Math.random() * locations.length)],
    merchant: merchants[Math.floor(Math.random() * merchants.length)],
    timestamp: new Date().toISOString(),
  };
}

export function generateFraudAlert(relatedTxn?: Transaction): FraudAlert {
  const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
  const alertScore = Math.floor(Math.random() * 60) + 40; // 40-100
  
  return {
    alertId: generateAlertId(),
    accountId: relatedTxn?.accountId || generateAccountId(),
    alertType,
    alertScore,
    relatedTxnId: relatedTxn?.transactionId || generateTransactionId(),
    details: {
      amount: relatedTxn?.amount || Math.floor(Math.random() * 50000),
      avg: Math.floor(Math.random() * 5000) + 500,
      reason: alertType.replace(/_/g, ' ').toLowerCase(),
    },
    detectedAt: new Date().toISOString(),
  };
}

export function generateAccountProfile(accountId: string, alertCount: number = 0): AccountProfile {
  const riskTiers: ('LOW' | 'MEDIUM' | 'HIGH')[] = ['LOW', 'MEDIUM', 'HIGH'];
  const riskIndex = alertCount > 5 ? 2 : alertCount > 2 ? 1 : 0;
  
  return {
    accountId,
    averageSpend: Math.floor(Math.random() * 50000) + 5000,
    riskTier: riskTiers[riskIndex],
    totalTransactions: Math.floor(Math.random() * 500) + 50,
    alertCount,
  };
}

export function generateInitialTransactions(count: number = 20): Transaction[] {
  const transactions: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    transactions.push(generateTransaction());
  }
  return transactions.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function generateInitialAlerts(count: number = 10): FraudAlert[] {
  const alerts: FraudAlert[] = [];
  for (let i = 0; i < count; i++) {
    alerts.push(generateFraudAlert());
  }
  return alerts.sort((a, b) => 
    new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  );
}
