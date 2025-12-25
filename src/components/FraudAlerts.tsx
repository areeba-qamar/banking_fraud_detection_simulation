import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FraudAlert, SSEConnectionStatus, AlertSeverity } from '@/types/fraud';

interface FraudAlertsProps {
  alerts: FraudAlert[];
  status: SSEConnectionStatus;
  onAlertClick: (alert: FraudAlert) => void;
  onAccountClick: (accountId: string) => void;
}

function getSeverity(score: number): AlertSeverity {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatAlertType(type: string): string {
  return type.replace(/_/g, ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function FraudAlerts({
  alerts,
  status,
  onAlertClick,
  onAccountClick,
}: FraudAlertsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set());

  // Track new alerts for animation
  useEffect(() => {
    if (alerts.length > 0) {
      const latestId = alerts[0]?.alertId;
      if (latestId && !newAlertIds.has(latestId)) {
        setNewAlertIds(prev => new Set([...prev, latestId]));
        
        setTimeout(() => {
          setNewAlertIds(prev => {
            const updated = new Set(prev);
            updated.delete(latestId);
            return updated;
          });
        }, 400);
      }
    }
  }, [alerts]);

  return (
    <div className="glass-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-severity-high" />
          <h2 className="font-semibold text-lg">Fraud Alerts</h2>
          <Badge variant={status === 'connected' ? 'live' : status === 'connecting' ? 'connecting' : 'error'}>
            {status === 'connected' ? 'LIVE' : status === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {alerts.length} alerts
        </span>
      </div>

      {/* Alert List */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin"
      >
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No alerts detected</p>
            </div>
          </div>
        ) : (
          alerts.map((alert) => {
            const severity = getSeverity(alert.alertScore);
            return (
              <div
                key={alert.alertId}
                className={`p-4 border-b border-border/30 data-row cursor-pointer ${
                  newAlertIds.has(alert.alertId) ? 'data-row-new' : ''
                }`}
                onClick={() => onAlertClick(alert)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant={severity} className="text-[10px]">
                        {severity.toUpperCase()}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatTime(alert.detectedAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium mb-1">
                      {formatAlertType(alert.alertType)}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs">
                      <button
                        className="font-mono text-primary hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAccountClick(alert.accountId);
                        }}
                      >
                        {alert.accountId}
                      </button>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono text-muted-foreground truncate">
                        {alert.relatedTxnId}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Score</p>
                      <p className={`font-mono font-semibold ${
                        severity === 'high' ? 'text-severity-high' :
                        severity === 'medium' ? 'text-severity-medium' :
                        'text-severity-low'
                      }`}>
                        {alert.alertScore.toFixed(1)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAlertClick(alert);
                      }}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
