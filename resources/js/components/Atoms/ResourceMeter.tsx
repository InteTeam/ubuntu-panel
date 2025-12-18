import { cn } from '@/lib/utils';

interface ResourceMeterProps {
    label: string;
    value: number;
    max: number;
    unit?: string;
    className?: string;
}

export function ResourceMeter({ label, value, max, unit = '', className }: ResourceMeterProps) {
    const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
    
    const getColor = (percent: number) => {
        if (percent >= 90) return 'bg-red-500';
        if (percent >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className={cn('space-y-1', className)}>
            <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
                <span className="text-gray-900 dark:text-white font-medium">
                    {value}{unit} / {max}{unit}
                </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                    className={cn('h-2 rounded-full transition-all', getColor(percentage))}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {percentage}%
            </div>
        </div>
    );
}
