import { useState, useEffect, useCallback, useRef } from 'react';
import { Transaction, FraudAlert, SSEConnectionStatus } from '@/types/fraud';
import { generateTransaction, generateFraudAlert, generateInitialTransactions, generateInitialAlerts } from '@/lib/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface UseSSEOptions {
  useMockData?: boolean;
  mockInterval?: number;
}

interface UseSSEReturn {
  transactions: Transaction[];
  alerts: FraudAlert[];
  transactionStatus: SSEConnectionStatus;
  alertStatus: SSEConnectionStatus;
  reconnect: () => void;
}

export function useSSE(options: UseSSEOptions = {}): UseSSEReturn {
  const { useMockData = true, mockInterval = 2000 } = options;
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => 
    useMockData ? generateInitialTransactions(15) : []
  );
  const [alerts, setAlerts] = useState<FraudAlert[]>(() => 
    useMockData ? generateInitialAlerts(8) : []
  );
  const [transactionStatus, setTransactionStatus] = useState<SSEConnectionStatus>('connecting');
  const [alertStatus, setAlertStatus] = useState<SSEConnectionStatus>('connecting');
  
  const transactionEventSource = useRef<EventSource | null>(null);
  const alertEventSource = useRef<EventSource | null>(null);
  const mockIntervalRef = useRef<number | null>(null);
  const isConnectedRef = useRef(false);

  const addTransaction = useCallback((txn: Transaction) => {
    setTransactions(prev => [txn, ...prev.slice(0, 199)]);
  }, []);

  const addAlert = useCallback((alert: FraudAlert) => {
    setAlerts(prev => [alert, ...prev.slice(0, 99)]);
  }, []);

  const startMockStreaming = useCallback(() => {
    if (isConnectedRef.current) return;
    isConnectedRef.current = true;

    // Set connected immediately for demo
    setTransactionStatus('connected');
    setAlertStatus('connected');

    mockIntervalRef.current = window.setInterval(() => {
      const txn = generateTransaction();
      addTransaction(txn);
      
      // 30% chance of generating an alert
      if (Math.random() > 0.7) {
        setTimeout(() => {
          const alert = generateFraudAlert(txn);
          addAlert(alert);
        }, 500);
      }
    }, mockInterval);
  }, [mockInterval, addTransaction, addAlert]);

  const startRealSSE = useCallback(() => {
    if (isConnectedRef.current) return;
    isConnectedRef.current = true;

    setTransactionStatus('connecting');
    setAlertStatus('connecting');

    // Transaction stream
    transactionEventSource.current = new EventSource(`${API_URL}/stream/transactions`);
    
    transactionEventSource.current.onopen = () => {
      setTransactionStatus('connected');
    };

    transactionEventSource.current.onmessage = (event) => {
      try {
        const txn: Transaction = JSON.parse(event.data);
        addTransaction(txn);
      } catch (error) {
        console.error('Failed to parse transaction:', error);
      }
    };

    transactionEventSource.current.onerror = () => {
      setTransactionStatus('error');
      transactionEventSource.current?.close();
      isConnectedRef.current = false;
    };

    // Alert stream
    alertEventSource.current = new EventSource(`${API_URL}/stream/fraud-alerts`);
    
    alertEventSource.current.onopen = () => {
      setAlertStatus('connected');
    };

    alertEventSource.current.onmessage = (event) => {
      try {
        const alert: FraudAlert = JSON.parse(event.data);
        addAlert(alert);
      } catch (error) {
        console.error('Failed to parse alert:', error);
      }
    };

    alertEventSource.current.onerror = () => {
      setAlertStatus('error');
      alertEventSource.current?.close();
    };
  }, [addTransaction, addAlert]);

  const cleanup = useCallback(() => {
    transactionEventSource.current?.close();
    alertEventSource.current?.close();
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
    isConnectedRef.current = false;
  }, []);

  const reconnect = useCallback(() => {
    cleanup();
    if (useMockData) {
      startMockStreaming();
    } else {
      startRealSSE();
    }
  }, [cleanup, useMockData, startMockStreaming, startRealSSE]);

  useEffect(() => {
    if (useMockData) {
      startMockStreaming();
    } else {
      startRealSSE();
    }

    return cleanup;
  }, [useMockData, startMockStreaming, startRealSSE, cleanup]);

  return {
    transactions,
    alerts,
    transactionStatus,
    alertStatus,
    reconnect,
  };
}
