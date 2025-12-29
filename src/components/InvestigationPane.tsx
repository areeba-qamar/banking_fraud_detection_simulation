import { useState, useEffect, useMemo } from 'react';
import { X, User, AlertTriangle, TrendingUp, Shield, CheckCircle, XCircle, Lock, Loader2, Filter, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Transaction, FraudAlert, AccountProfile, TimeWindow } from '@/types/fraud';
import { fetchAccountTransactions, fetchAccountAlerts, fetchAccountProfile, acknowledgeAlert, markFalsePositive, freezeAccount } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface InvestigationPaneProps {
  accountId: string | null;
  onClose: () => void;
}

interface PaneFilters {
  minAmount: number;
  timeWindow: TimeWindow;
}

const timeWindows: { value: TimeWindow; label: string }[] = [
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
];

const getTimeWindowMs = (window: TimeWindow): number => {
  switch (window) {
    case '5m': return 5 * 60 * 1000;
    case '15m': return 15 * 60 * 1000;
    case '1h': return 60 * 60 * 1000;
  }
};

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function InvestigationPane({ accountId, onClose }: InvestigationPaneProps) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaneFilters>({
    minAmount: 0,
    timeWindow: '1h',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

const API_BASE_URL = import.meta.env.VITE_API_URL;

useEffect(() => {
  if (!accountId) return;

  const fetchData = async () => {
    setLoading(true); // start loading

    try {
      // Fetch transactions
      const transactionsRes = await fetch(`${API_BASE_URL}/api/accounts/${accountId}/transactions`);
      if (!transactionsRes.ok) throw new Error('Failed to fetch transactions');
      const transactionsData = await transactionsRes.json();
      setTransactions(transactionsData);

      // Fetch alerts
      const alertsRes = await fetch(`${API_BASE_URL}/api/accounts/${accountId}/alerts`);
      if (!alertsRes.ok) throw new Error('Failed to fetch alerts');
      const alertsData = await alertsRes.json();
      setAlerts(alertsData);

      // Fetch profile
      const profileRes = await fetch(`${API_BASE_URL}/api/accounts/${accountId}/profile`);
      if (!profileRes.ok) {
        const text = await profileRes.text();
        console.error("PROFILE API ERROR RESPONSE:", text);
        setProfile(null);
        return;
      }
      const profileData = await profileRes.json();
      setProfile(profileData);

    } catch (error) {
      console.error('Failed to fetch investigation data:', error);
      setProfile(null);
      setTransactions([]);
      setAlerts([]);
    } finally {
      setLoading(false); // stop loading in all cases
    }
  };

  fetchData();
}, [accountId]);


  // useEffect(() => {
  //   if (!accountId) return;

  //   const fetchData = async () => {
  //     try {
  //       const transactionsRes = await fetch(`${API_BASE_URL}/api/accounts/${accountId}/transactions`);
  //       const transactionsData = await transactionsRes.json();
  //       setTransactions(transactionsData);
        
  //       const alertsRes = await fetch(`${API_BASE_URL}/api/accounts/${accountId}/alerts`);
  //       const alertsData = await alertsRes.json();
  //       setAlerts(alertsData);

  //       // const profileRes = await fetch(`${API_BASE_URL}/api/accounts/${accountId}/profile`);
  //       // const profileData = await profileRes.json();
  //       // setProfile(profileData);
  //       const profileRes = await fetch(`${API_BASE_URL}/api/accounts/${accountId}/profile`);
  //       console.log("PROFILE API STATUS:", profileRes.status);
  //       if (!profileRes.ok) {
  //        const text = await profileRes.text();
  //        console.error("PROFILE API ERROR RESPONSE:", text);
        
  //        return;

  //       }

  //       const profileData = await profileRes.json();
  //       console.log("PROFILE DATA FROM BACKEND:", profileData);
  //       setProfile(profileData);


  //     } catch (error) {
  //       console.error('Failed to fetch investigation data:', error);
  //       }
  //   };

  //   fetchData();
  // }, [accountId]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    const windowMs = getTimeWindowMs(filters.timeWindow);
    console.log("Transactionssssssssss",transactions)
    return transactions.filter((txn) => {
      if (new Date(txn.timestamp).getTime() < now - windowMs) return false;
      if (filters.minAmount > 0 && txn.amount < filters.minAmount) return false;
      return true;
    });
  }, [transactions, filters]);

  const handleAcknowledge = async (alertId: string) => {
    setActionLoading(alertId);
    const success = await acknowledgeAlert(alertId);
    setActionLoading(null);
    
    if (success) {
      toast({
        title: 'Alert Acknowledged',
        description: `Alert ${alertId} has been acknowledged`,
      });
      setAlerts(prev => prev.filter(a => a.alertId !== alertId));
    }
  };

  const handleFalsePositive = async (alertId: string) => {
    setActionLoading(`fp-${alertId}`);
    const success = await markFalsePositive(alertId);
    setActionLoading(null);
    
    if (success) {
      toast({
        title: 'Marked as False Positive',
        description: `Alert ${alertId} marked as false positive`,
      });
      setAlerts(prev => prev.filter(a => a.alertId !== alertId));
    }
  };

  const handleFreeze = async () => {
    if (!accountId) return;
    
    setActionLoading('freeze');
    const success = await freezeAccount(accountId);
    setActionLoading(null);
    
    if (success) {
      toast({
        title: 'Account Frozen',
        description: `Account ${accountId} has been frozen`,
        variant: 'destructive',
      });
    }
  };

  if (!accountId) {
    return (
      <div className="glass-card h-full flex flex-col items-center justify-center text-muted-foreground">
        <User className="w-12 h-12 mb-4 opacity-30" />
        <h3 className="text-lg font-medium mb-2">No Account Selected</h3>
        <p className="text-sm text-center max-w-xs">
          Click on an account ID or alert to view investigation details
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-semibold text-lg">Investigation</h2>
            <p className="font-mono text-sm text-primary">{accountId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle filters"
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-4 py-3 bg-muted/30 border-b border-border/50 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Min amount"
              value={filters.minAmount || ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                minAmount: e.target.value ? Number(e.target.value) : 0 
              }))}
              className="h-7 w-24 text-xs font-mono bg-background/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {timeWindows.map((tw) => (
                <Button
                  key={tw.value}
                  variant={filters.timeWindow === tw.value ? 'default' : 'ghost'}
                  size="xs"
                  onClick={() => setFilters(prev => ({ ...prev, timeWindow: tw.value }))}
                  className="font-mono text-xs h-7 px-2"
                >
                  {tw.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            

{/* Account Profile */}
{profile && (
  <div className="space-y-3">
    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
      <Shield className="w-4 h-4" />
      Account Profile
    </h3>
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 rounded-lg bg-muted/30">
        <p className="text-xs text-muted-foreground">Avg Daily Spend</p>
        <p className="font-mono font-semibold">{profile.avgDailySpend}</p>
      </div>
      <div className="p-3 rounded-lg bg-muted/30">
        <p className="text-xs text-muted-foreground">Avg Transaction Amount</p>
        <p className="font-mono font-semibold">{profile.avgTxnAmount}</p>
      </div>
      <div className="p-3 rounded-lg bg-muted/30">
        <p className="text-xs text-muted-foreground">Risk Tier</p>
        <Badge
          variant={
            profile.riskTier === 'HIGH'
              ? 'high'
              : profile.riskTier === 'MEDIUM'
              ? 'medium'
              : 'safe'
          }
        >
          {profile.riskTier}
        </Badge>
      </div>
      <div className="p-3 rounded-lg bg-muted/30">
        <p className="text-xs text-muted-foreground">Home Country</p>
        <p className="font-mono font-semibold">{profile.homeCountry}</p>
      </div>
    </div>
  </div>
)}




            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={handleFreeze}
                disabled={actionLoading === 'freeze'}
              >
                {actionLoading === 'freeze' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Freeze Account
              </Button>
            </div>

            {/* Recent Alerts */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Recent Alerts ({alerts.length})
              </h3>
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No alerts for this account</p>
              ) : (
                <div className="space-y-2">
                  {alerts.slice(0, 10).map((alert) => (
                    <div key={alert.alertId} className="p-3 rounded-lg bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={alert.alertScore >= 80 ? 'high' : alert.alertScore >= 60 ? 'medium' : 'low'} className="text-[10px]">
                            {alert.alertScore.toFixed(0)}
                          </Badge>
                          <span className="text-sm">{alert.alertType.replace(/_/g, ' ')}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDateTime(alert.detectedAt)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          size="xs"
                          className="flex-1"
                          onClick={() => handleAcknowledge(alert.alertId)}
                          disabled={actionLoading === alert.alertId}
                        >
                          {actionLoading === alert.alertId ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          Acknowledge
                        </Button>
                        <Button
                          variant="warning"
                          size="xs"
                          className="flex-1"
                          onClick={() => handleFalsePositive(alert.alertId)}
                          disabled={actionLoading === `fp-${alert.alertId}`}
                        >
                          {actionLoading === `fp-${alert.alertId}` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          False Positive
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recent Transactions ({filteredTransactions.length}/{transactions.length})
              </h3>
              <div className="space-y-1">
                {filteredTransactions.slice(0, 50).map((txn) => (
                  <div key={txn.transactionId} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs truncate">{txn.transactionId}</p>
                      <p className="text-xs text-muted-foreground">{txn.merchant}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono text-sm ${
                        txn.amount >= 50000 ? 'text-severity-high font-semibold' : ''
                      }`}>
                        {formatAmount(txn.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(txn.timestamp)}</p>
                    </div>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No transactions match the current filters
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
