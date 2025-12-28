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
  const { useMockData = false, mockInterval = 2000 } = options;
  
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

           console.log("addTransactio txn ",txn)

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
    if (transactionEventSource.current || alertEventSource.current) return;

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
        console.log("Eventtttt",event)
      
        console.log("Eventtttt_data",event.data)

        const txn: Transaction = JSON.parse(event.data);
        
        console.log("Eventtttt txn",txn)

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
    // alertEventSource.current = new EventSource(`${API_URL}/stream/fraud-alerts`);
    
    // alertEventSource.current.onopen = () => {
    //   setAlertStatus('connected');
    // };

    alertEventSource.current = new EventSource(`${API_URL}/stream/fraud-alerts`);

alertEventSource.current.onopen = () => {
  console.log("🚨 Fraud Alert SSE connected");
  setAlertStatus('connected');
};

alertEventSource.current.addEventListener("fraud-alert", (event) => {
  try {
    console.log("🚨 FRAUD ALERT EVENT RAW:", event.data);

    const alert: FraudAlert = JSON.parse(event.data);
    console.log("🚨 PARSED ALERT:", alert);

    addAlert(alert);
  } catch (error) {
    console.error("❌ Failed to parse fraud alert:", error);
  }
});

alertEventSource.current.onerror = (err) => {
  console.error("❌ Fraud Alert SSE error:", err);
  setAlertStatus('error');
  alertEventSource.current?.close();
  isConnectedRef.current = false;
};

    // alertEventSource.current.onmessage = (event) => {
    //   try {
    //     const alert: FraudAlert = JSON.parse(event.data);
    //     addAlert(alert);
    //   } catch (error) {
    //     console.error('Failed to parse alert:', error);
    //   }
    // };

    transactionEventSource.current.addEventListener("transaction", (event) => {
  try {
    console.log("TX EVENT:", event.data);

    const txn: Transaction = JSON.parse(event.data);
    addTransaction(txn);
  } catch (error) {
    console.error("Failed to parse transaction:", error);
  }
});

    alertEventSource.current.onerror = () => {
      setAlertStatus('error');
      alertEventSource.current?.close();
      isConnectedRef.current = false; // 🔥 VERY IMPORTANT
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
