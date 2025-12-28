import { useState } from 'react';
import { Header } from './Header';
import { SummaryBand } from './SummaryBand';
import { TransactionFeed } from './TransactionFeed';
import { FraudAlerts } from './FraudAlerts';
import { InvestigationPane } from './InvestigationPane';
import { useSSE } from '@/hooks/useSSE';
import { useMetrics } from '@/hooks/useMetrics';
import { FraudAlert } from '@/types/fraud';

export function FraudDashboard() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const { transactions, alerts, transactionStatus, alertStatus, reconnect } = useSSE({
    useMockData: false,
    mockInterval: 1500,
  });

  const metrics = useMetrics(transactions, alerts);

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
      {/* Header with connection status */}
      <Header 
        onReconnect={reconnect} 
        transactionStatus={transactionStatus}
        alertStatus={alertStatus}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        {/* Summary Band - read-only monitoring view */}
        <SummaryBand
          totalTransactionsToday={metrics.totalTransactionsToday}
          fraudAlertsLastHour={metrics.fraudAlertsLastHour}
          alertsPerSecond={metrics.alertsPerSecond}
          topRiskyAccounts={metrics.topRiskyAccounts}
          selectedAccountId={selectedAccountId}
          onAccountClick={handleAccountClick}
        />

        {/* Main Dashboard Grid - Live monitoring feeds */}
        <div className="grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}>
          {/* Left Column - Transaction Feed (~58%) - expanded for better visibility */}
          <div className="col-span-7 h-full overflow-hidden">
            <TransactionFeed
              transactions={transactions}
              status={transactionStatus}
              onInvestigate={handleAccountClick}
            />
          </div>

          {/* Right Column (~42%) */}
          <div className="col-span-5 flex flex-col gap-4 h-full overflow-hidden">
            {/* Fraud Alerts (Top ~50%) */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <FraudAlerts
                alerts={alerts}
                status={alertStatus}
                onAlertClick={handleAlertClick}
                onAccountClick={handleAccountClick}
              />
            </div>

            {/* Investigation Pane (Bottom ~50%) */}
            <div className="flex-1 min-h-0 overflow-hidden">
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
