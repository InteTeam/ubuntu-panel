import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import GuestLayout from '@/layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TwoFactorChallenge() {
    const [useRecovery, setUseRecovery] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        recovery_code: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/two-factor/challenge');
    };

    return (
        <GuestLayout title="Two-Factor Challenge - UPanel">
            <Card>
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        {useRecovery 
                            ? 'Enter one of your recovery codes to continue.'
                            : 'Enter the code from your authenticator app.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!useRecovery ? (
                            <div className="space-y-2">
                                <Label htmlFor="code">Authentication Code</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    placeholder="000000"
                                    autoComplete="one-time-code"
                                    autoFocus
                                />
                                {errors.code && (
                                    <p className="text-sm text-red-600">{errors.code}</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="recovery_code">Recovery Code</Label>
                                <Input
                                    id="recovery_code"
                                    type="text"
                                    value={data.recovery_code}
                                    onChange={(e) => setData('recovery_code', e.target.value)}
                                    placeholder="xxxxx-xxxxx"
                                    autoFocus
                                />
                                {errors.recovery_code && (
                                    <p className="text-sm text-red-600">{errors.recovery_code}</p>
                                )}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? 'Verifying...' : 'Verify'}
                        </Button>

                        <button
                            type="button"
                            onClick={() => {
                                setUseRecovery(!useRecovery);
                                setData({ code: '', recovery_code: '' });
                            }}
                            className="w-full text-sm text-gray-600 dark:text-gray-400 hover:underline"
                        >
                            {useRecovery ? 'Use authentication code' : 'Use a recovery code'}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
