import { Search, Clock, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilterState, TimeWindow } from '@/types/fraud';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const timeWindows: { value: TimeWindow; label: string }[] = [
  { value: '5m', label: '5 min' },
  { value: '15m', label: '15 min' },
  { value: '1h', label: '1 hour' },
];

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="glass-card p-3">
      <div className="flex items-center gap-4">
        {/* Account ID Filter */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filter by Account ID..."
            value={filters.accountId}
            onChange={(e) => onFilterChange({ ...filters, accountId: e.target.value })}
            className="h-8 text-sm font-mono bg-background/50"
          />
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Minimum Amount */}
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <Input
            type="number"
            placeholder="Min amount"
            value={filters.minAmount || ''}
            onChange={(e) => onFilterChange({ 
              ...filters, 
              minAmount: e.target.value ? Number(e.target.value) : 0 
            })}
            className="h-8 w-32 text-sm font-mono bg-background/50"
          />
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Time Window */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {timeWindows.map((tw) => (
              <Button
                key={tw.value}
                variant={filters.timeWindow === tw.value ? 'default' : 'ghost'}
                size="xs"
                onClick={() => onFilterChange({ ...filters, timeWindow: tw.value })}
                className="font-mono"
              >
                {tw.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {(filters.accountId || filters.minAmount > 0) && (
          <>
            <div className="w-px h-6 bg-border" />
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onFilterChange({ accountId: '', minAmount: 0, timeWindow: filters.timeWindow })}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
