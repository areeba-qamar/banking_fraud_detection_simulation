import { useState, useEffect, useMemo } from 'react';
import { Transaction, FraudAlert } from '@/types/fraud';

interface Metrics {
  totalTransactionsToday: number;
  fraudAlertsLastHour: number;
  alertsPerSecond: number;
  topRiskyAccounts: Array<{ accountId: string; alertCount: number }>;
}

export function useMetrics(
  transactions: Transaction[],
  alerts: FraudAlert[]
): Metrics {
  const [alertsPerSecond, setAlertsPerSecond] = useState(0);
  const [recentAlertCounts, setRecentAlertCounts] = useState<number[]>([]);

  // Calculate rolling alerts per second
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const now = Date.now();
  //     const oneMinuteAgo = now - 60000;
      
  //     const recentAlerts = alerts.filter(
  //       alert => new Date(alert.detectedAt).getTime() > oneMinuteAgo
  //     ).length;
      
  //     setRecentAlertCounts(prev => {
  //       const updated = [...prev, recentAlerts].slice(-10); // Keep last 10 readings
  //       const avg = updated.reduce((a, b) => a + b, 0) / updated.length / 60;
  //       setAlertsPerSecond(Math.round(avg * 100) / 100);
  //       return updated;
  //     });
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [alerts]);
  useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const recentAlerts = alerts.filter(
      alert => new Date(alert.detectedAt).getTime() > oneMinuteAgo
    ).length;

    const aps = Math.round((recentAlerts / 60) * 100) / 100;

    console.log(" Alerts last 60s:", recentAlerts);
    console.log("Alerts/sec:", aps);

    setAlertsPerSecond(aps);
  }, 1000);

  return () => clearInterval(interval);
}, [alerts]);

  const metrics = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneHourAgo = new Date(now.getTime() - 3600000);

    // // Total transactions today
    // const totalTransactionsToday = transactions.filter(
    //   txn => new Date(txn.timestamp) >= todayStart
    // ).length;

    const totalTransactionsToday = transactions.filter(txn => {
      const txTime = new Date(txn.timestamp).getTime();
      return txTime >= todayStart.getTime();
    }).length;


    // // Fraud alerts in last hour
    // const fraudAlertsLastHour = alerts.filter(
    //   alert => new Date(alert.detectedAt) >= oneHourAgo
    // ).length;
    
    const fraudAlertsLastHour = alerts.filter(alert => {
      const alertTime = new Date(alert.detectedAt).getTime();
      return alertTime >= oneHourAgo.getTime();
    }).length;



    // Top 3 risky accounts
    const accountAlertCounts = alerts.reduce((acc, alert) => {
      acc[alert.accountId] = (acc[alert.accountId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topRiskyAccounts = Object.entries(accountAlertCounts)
      .map(([accountId, alertCount]) => ({ accountId, alertCount }))
      .sort((a, b) => b.alertCount - a.alertCount)
      .slice(0, 3);

    return {
      totalTransactionsToday,
      fraudAlertsLastHour,
      alertsPerSecond,
      topRiskyAccounts,
    };
  }, [transactions, alerts, alertsPerSecond]);

  return metrics;
}
