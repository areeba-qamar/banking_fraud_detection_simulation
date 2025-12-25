import { Activity, AlertTriangle, TrendingUp, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SummaryBandProps {
  totalTransactionsToday: number;
  fraudAlertsLastHour: number;
  alertsPerSecond: number;
  topRiskyAccounts: Array<{ accountId: string; alertCount: number }>;
  onAccountClick: (accountId: string) => void;
}

export function SummaryBand({
  totalTransactionsToday,
  fraudAlertsLastHour,
  alertsPerSecond,
  topRiskyAccounts,
  onAccountClick,
}: SummaryBandProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between gap-6">
        {/* Total Transactions */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Transactions Today
            </p>
            <p className="text-2xl font-semibold font-mono">
              {totalTransactionsToday.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="w-px h-12 bg-border" />

        {/* Fraud Alerts */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-severity-high/10">
            <AlertTriangle className="w-5 h-5 text-severity-high" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Alerts (Last Hour)
            </p>
            <p className="text-2xl font-semibold font-mono text-severity-high">
              {fraudAlertsLastHour}
            </p>
          </div>
        </div>

        <div className="w-px h-12 bg-border" />

        {/* Alerts Per Second */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-severity-medium/10">
            <TrendingUp className="w-5 h-5 text-severity-medium" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Alerts/sec
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold font-mono">
                {alertsPerSecond.toFixed(2)}
              </p>
              <div className="status-dot status-dot-live" />
            </div>
          </div>
        </div>

        <div className="w-px h-12 bg-border" />

        {/* Top Risky Accounts */}
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 rounded-lg bg-accent/10">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">
              Top Risky Accounts
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {topRiskyAccounts.length > 0 ? (
                topRiskyAccounts.map((account) => (
                  <button
                    key={account.accountId}
                    onClick={() => onAccountClick(account.accountId)}
                    className="group flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="font-mono text-xs group-hover:text-primary transition-colors">
                      {account.accountId}
                    </span>
                    <Badge variant="high" className="text-[10px] px-1.5 py-0">
                      {account.alertCount}
                    </Badge>
                  </button>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No alerts</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
