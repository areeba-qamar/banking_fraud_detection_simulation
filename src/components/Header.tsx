import { Shield, RefreshCw, Moon, Sun, WifiOff, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { SSEConnectionStatus } from '@/types/fraud';

interface HeaderProps {
  onReconnect: () => void;
  transactionStatus: SSEConnectionStatus;
  alertStatus: SSEConnectionStatus;
}

export function Header({ onReconnect, transactionStatus, alertStatus }: HeaderProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    // Default to dark mode
    if (!document.documentElement.classList.contains('dark') && !document.documentElement.classList.contains('light')) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
  };

  const isConnected = transactionStatus === 'connected' && alertStatus === 'connected';
  const hasError = transactionStatus === 'error' || alertStatus === 'error';

  return (
    <>
      <header className="glass-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Banking Fraud Detection Simulation</h1>
              <p className="text-sm text-muted-foreground">Real-time Transaction Monitoring</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-data-positive" />
            ) : hasError ? (
              <WifiOff className="w-4 h-4 text-severity-high" />
            ) : (
              <Wifi className="w-4 h-4 text-severity-medium animate-pulse" />
            )}
            <span className="text-xs font-mono">
              {isConnected ? 'Connected' : hasError ? 'Disconnected' : 'Connecting...'}
            </span>
          </div>
          
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button variant="outline" size="sm" onClick={onReconnect}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reconnect
          </Button>
        </div>
      </header>

      {/* Error Banner - Non-blocking */}
      {hasError && (
        <div className="mx-4 mt-2 p-3 rounded-lg bg-severity-high/10 border border-severity-high/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-severity-high" />
            <div>
              <p className="text-sm font-medium text-severity-high">Connection Lost</p>
              <p className="text-xs text-muted-foreground">
                {transactionStatus === 'error' && alertStatus === 'error' 
                  ? 'Both transaction and alert streams disconnected' 
                  : transactionStatus === 'error' 
                    ? 'Transaction stream disconnected' 
                    : 'Alert stream disconnected'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onReconnect}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      )}
    </>
  );
}
