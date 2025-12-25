import { useState, useMemo } from 'react';
import { Header } from './Header';
import { SummaryBand } from './SummaryBand';
import { FilterBar } from './FilterBar';
import { TransactionFeed } from './TransactionFeed';
import { FraudAlerts } from './FraudAlerts';
import { InvestigationPane } from './InvestigationPane';
import { useSSE } from '@/hooks/useSSE';
import { useMetrics } from '@/hooks/useMetrics';
import { FilterState, FraudAlert, TimeWindow } from '@/types/fraud';

const getTimeWindowMs = (window: TimeWindow): number => {
  switch (window) {
    case '5m': return 5 * 60 * 1000;
    case '15m': return 15 * 60 * 1000;
    case '1h': return 60 * 60 * 1000;
  }
};

export function FraudDashboard() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    accountId: '',
    minAmount: 0,
    timeWindow: '15m',
  });

  const { transactions, alerts, transactionStatus, alertStatus, reconnect } = useSSE({
    useMockData: true,
    mockInterval: 1500,
  });

  const metrics = useMetrics(transactions, alerts);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    const windowMs = getTimeWindowMs(filters.timeWindow);
    
    return transactions.filter((txn) => {
      // Time window filter
      if (new Date(txn.timestamp).getTime() < now - windowMs) return false;
      
      // Account ID filter
      if (filters.accountId && !txn.accountId.toLowerCase().includes(filters.accountId.toLowerCase())) {
        return false;
      }
      
      // Minimum amount filter
      if (filters.minAmount > 0 && txn.amount < filters.minAmount) return false;
      
      return true;
    });
  }, [transactions, filters]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    const now = Date.now();
    const windowMs = getTimeWindowMs(filters.timeWindow);
    
    return alerts.filter((alert) => {
      // Time window filter
      if (new Date(alert.detectedAt).getTime() < now - windowMs) return false;
      
      // Account ID filter
      if (filters.accountId && !alert.accountId.toLowerCase().includes(filters.accountId.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [alerts, filters]);

  const handleAlertClick = (alert: FraudAlert) => {
    setSelectedAccountId(alert.accountId);
  };

  const handleAccountClick = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  const handleCloseInvestigation = () => {
    setSelectedAccountId(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header onReconnect={reconnect} />

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        {/* Summary Band */}
        <SummaryBand
          totalTransactionsToday={metrics.totalTransactionsToday}
          fraudAlertsLastHour={metrics.fraudAlertsLastHour}
          alertsPerSecond={metrics.alertsPerSecond}
          topRiskyAccounts={metrics.topRiskyAccounts}
          onAccountClick={handleAccountClick}
        />

        {/* Filter Bar */}
        <FilterBar filters={filters} onFilterChange={setFilters} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-4 min-h-[600px]" style={{ height: 'calc(100vh - 280px)' }}>
          {/* Left Column - Transaction Feed (~42%) */}
          <div className="col-span-5 h-full">
            <TransactionFeed
              transactions={filteredTransactions}
              status={transactionStatus}
              onInvestigate={handleAccountClick}
            />
          </div>

          {/* Right Column (~58%) */}
          <div className="col-span-7 flex flex-col gap-4 h-full">
            {/* Fraud Alerts (Top ~50%) */}
            <div className="flex-1 min-h-0">
              <FraudAlerts
                alerts={filteredAlerts}
                status={alertStatus}
                onAlertClick={handleAlertClick}
                onAccountClick={handleAccountClick}
              />
            </div>

            {/* Investigation Pane (Bottom ~50%) */}
            <div className="flex-1 min-h-0">
              <InvestigationPane
                accountId={selectedAccountId}
                onClose={handleCloseInvestigation}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
