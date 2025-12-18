import { Input } from '@/components/ui/input';

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export function DateRangeFilter({ from, to, onFromChange, onToChange }: DateRangeFilterProps) {
  return (
    <div className="space-y-2">
      <Input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        placeholder="From"
      />
      <Input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        placeholder="To"
      />
    </div>
  );
}
