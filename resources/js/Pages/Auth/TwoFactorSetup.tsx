import { useForm } from '@inertiajs/react';
import GuestLayout from '@/layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    qrCode: string;
    secret: string;
}

export default function TwoFactorSetup({ qrCode, secret }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/two-factor/confirm');
    };

    return (
        <GuestLayout title="Setup 2FA - UPanel">
            <Card>
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center">
                        <div 
                            className="p-4 bg-white rounded-lg"
                            dangerouslySetInnerHTML={{ __html: qrCode }} 
                        />
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Or enter this code manually:
                        </p>
                        <code className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">
                            {secret}
                        </code>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Verification Code</Label>
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

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? 'Verifying...' : 'Enable Two-Factor'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
