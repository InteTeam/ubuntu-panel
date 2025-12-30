import { Link, router } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmationDialog } from '@/components/Molecules/ConfirmationDialog';
import { EmptyState } from '@/components/Atoms/EmptyState';
import { ArrowLeft, Plus, Key, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface GitCredential {
    id: string;
    name: string;
    type: 'ssh_key' | 'token' | 'basic';
    apps_count: number;
    created_at: string;
}

interface Props {
    credentials: GitCredential[];
}

const typeLabels: Record<string, string> = {
    ssh_key: 'SSH Key',
    token: 'Token',
    basic: 'Basic Auth',
};

const typeBadgeVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
    ssh_key: 'default',
    token: 'secondary',
    basic: 'outline',
};

export default function Index({ credentials }: Props) {
    const [deleteCredential, setDeleteCredential] = useState<GitCredential | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!deleteCredential) return;

        setIsDeleting(true);
        router.delete(`/settings/git-credentials/${deleteCredential.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteCredential(null);
            },
        });
    };

    return (
        <AuthLayout title="Git Credentials - UPanel">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/settings">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Settings
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Git Credentials</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Manage credentials for private Git repositories
                            </p>
                        </div>
                    </div>
                    <Link href="/settings/git-credentials/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Credential
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Saved Credentials
                        </CardTitle>
                        <CardDescription>
                            Credentials are encrypted and used for cloning private repositories
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {credentials.length === 0 ? (
                            <EmptyState message="No git credentials yet" />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Used By</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {credentials.map((credential) => (
                                        <TableRow key={credential.id}>
                                            <TableCell className="font-medium">
                                                {credential.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={typeBadgeVariants[credential.type]}>
                                                    {typeLabels[credential.type]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {credential.apps_count === 0 ? (
                                                    <span className="text-gray-400">No apps</span>
                                                ) : (
                                                    <span>{credential.apps_count} app{credential.apps_count !== 1 ? 's' : ''}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-gray-500">
                                                {new Date(credential.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteCredential(credential)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmationDialog
                open={!!deleteCredential}
                onClose={() => setDeleteCredential(null)}
                title="Delete Git Credential"
                description={
                    deleteCredential?.apps_count && deleteCredential.apps_count > 0
                        ? `This credential is used by ${deleteCredential.apps_count} app(s). They will be set to use public repository access. Are you sure you want to delete "${deleteCredential?.name}"?`
                        : `Are you sure you want to delete "${deleteCredential?.name}"? This action cannot be undone.`
                }
                confirmText={isDeleting ? 'Deleting...' : 'Delete'}
                onConfirm={handleDelete}
                variant="destructive"
            />
        </AuthLayout>
    );
}
