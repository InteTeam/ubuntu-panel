import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dices, Copy, Check, RefreshCw, Key } from 'lucide-react';
import {
    generatePassword,
    generateLaravelKey,
    copyToClipboard,
    PASSWORD_PRESETS,
    DEFAULT_OPTIONS,
    type PasswordOptions,
} from '@/lib/password-generator';

interface PasswordGeneratorProps {
    onGenerate: (password: string) => void;
    fieldName?: string;
}

export function PasswordGenerator({ onGenerate, fieldName }: PasswordGeneratorProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
    const [preview, setPreview] = useState('');
    const [copied, setCopied] = useState(false);

    // Auto-detect if this might be a Laravel APP_KEY field
    const isLikelyAppKey = fieldName?.toUpperCase().includes('APP_KEY');

    // Generate preview when options change or popover opens
    useEffect(() => {
        if (open) {
            regenerate();
        }
    }, [open, options]);

    const regenerate = () => {
        const newPassword = isLikelyAppKey ? generateLaravelKey() : generatePassword(options);
        setPreview(newPassword);
        setCopied(false);
    };

    const handleCopy = async () => {
        const success = await copyToClipboard(preview);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleUse = () => {
        onGenerate(preview);
        setOpen(false);
    };

    const applyPreset = (preset: typeof PASSWORD_PRESETS[0]) => {
        setOptions(preset.options);
    };

    const updateOption = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Generate password"
                >
                    <Dices className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Generate Password</h4>
                        {isLikelyAppKey && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-200">
                                Laravel Key
                            </span>
                        )}
                    </div>

                    {!isLikelyAppKey && (
                        <>
                            {/* Presets */}
                            <div className="flex flex-wrap gap-1">
                                {PASSWORD_PRESETS.map((preset) => (
                                    <Button
                                        key={preset.name}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-7"
                                        onClick={() => applyPreset(preset)}
                                        title={preset.description}
                                    >
                                        {preset.name}
                                    </Button>
                                ))}
                            </div>

                            {/* Length */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Length</Label>
                                    <span className="text-xs text-muted-foreground">{options.length} chars</span>
                                </div>
                                <Input
                                    type="range"
                                    min={8}
                                    max={64}
                                    value={options.length}
                                    onChange={(e) => updateOption('length', parseInt(e.target.value))}
                                    className="h-2 cursor-pointer"
                                />
                            </div>

                            {/* Character options */}
                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <Checkbox
                                        checked={options.uppercase}
                                        onCheckedChange={(checked) => updateOption('uppercase', !!checked)}
                                    />
                                    Uppercase (A-Z)
                                </label>
                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <Checkbox
                                        checked={options.lowercase}
                                        onCheckedChange={(checked) => updateOption('lowercase', !!checked)}
                                    />
                                    Lowercase (a-z)
                                </label>
                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <Checkbox
                                        checked={options.numbers}
                                        onCheckedChange={(checked) => updateOption('numbers', !!checked)}
                                    />
                                    Numbers (0-9)
                                </label>
                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <Checkbox
                                        checked={options.symbols}
                                        onCheckedChange={(checked) => updateOption('symbols', !!checked)}
                                    />
                                    Symbols (!@#$)
                                </label>
                            </div>
                        </>
                    )}

                    {isLikelyAppKey && (
                        <p className="text-xs text-muted-foreground">
                            Generates a Laravel-compatible APP_KEY in <code className="bg-muted px-1 rounded">base64:...</code> format.
                        </p>
                    )}

                    {/* Preview */}
                    <div className="space-y-2">
                        <Label className="text-xs">Preview</Label>
                        <div className="relative">
                            <Input
                                readOnly
                                value={preview}
                                className="font-mono text-xs pr-8 bg-muted"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-2"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={regenerate}
                            className="flex-1"
                        >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Regenerate
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleUse}
                            className="flex-1"
                        >
                            <Key className="h-3 w-3 mr-1" />
                            Use This
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
