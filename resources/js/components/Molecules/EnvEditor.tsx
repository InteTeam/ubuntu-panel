import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

interface EnvEditorProps {
    value: Record<string, string>;
    onChange: (value: Record<string, string>) => void;
    label?: string;
}

export function EnvEditor({ value, onChange, label }: EnvEditorProps) {
    const [showValues, setShowValues] = useState(false);
    const entries = Object.entries(value || {});

    const addEntry = () => {
        onChange({ ...value, '': '' });
    };

    const updateKey = (oldKey: string, newKey: string) => {
        const newValue = { ...value };
        const val = newValue[oldKey];
        delete newValue[oldKey];
        newValue[newKey] = val;
        onChange(newValue);
    };

    const updateValue = (key: string, newVal: string) => {
        onChange({ ...value, [key]: newVal });
    };

    const removeEntry = (key: string) => {
        const newValue = { ...value };
        delete newValue[key];
        onChange(newValue);
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                {label && <Label>{label}</Label>}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowValues(!showValues)}
                >
                    {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>

            <div className="space-y-2">
                {entries.map(([key, val], index) => (
                    <div key={index} className="flex gap-2">
                        <Input
                            placeholder="KEY"
                            value={key}
                            onChange={(e) => updateKey(key, e.target.value)}
                            className="font-mono text-sm flex-1"
                        />
                        <Input
                            placeholder="value"
                            type={showValues ? 'text' : 'password'}
                            value={val}
                            onChange={(e) => updateValue(key, e.target.value)}
                            className="font-mono text-sm flex-1"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntry(key)}
                        >
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={addEntry}>
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
            </Button>
        </div>
    );
}
