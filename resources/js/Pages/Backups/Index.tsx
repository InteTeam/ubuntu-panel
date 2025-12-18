import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BackupRow } from '@/components/Molecules/BackupRow';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Archive, HardDrive, Calendar, Trash2 } from 'lucide-react';

interface Backup {
    id: string;
    type: 'full' | 'database';
    status: 'queued' | 'running' | 'success' | 'failed';
    file_size_bytes?: number;
    created_at: string;
    app?: { id: string; name: string };
    destination?: { id: string; name: string };
    error_message?: string;
}

interface Destination {
    id: string;
    name: string;
    type: string;
    is_default: boolean;
    backups_count: number;
}

interface Schedule {
    id: string;
    name: string;
    type: string;
    cron_expression: string;
    retention_count: number;
    is_active: boolean;
    next_run_at?: string;
    app?: { id: string; name: string };
    destination?: { id: string; name: string };
}

interface Props {
    backups: Backup[];
    destinations: Destination[];
    schedules: Schedule[];
}

export default function Index({ backups, destinations, schedules }: Props) {
    const [showDestinationDialog, setShowDestinationDialog] = useState(false);

    const destinationForm = useForm({
        name: '',
        type: 'local',
        credentials: {} as Record<string, string>,
        is_default: false,
    });

    const handleCreateDestination = (e: React.FormEvent) => {
        e.preventDefault();
        destinationForm.post('/backups/destinations', {
            onSuccess: () => {
                setShowDestinationDialog(false);
                destinationForm.reset();
            },
        });
    };

    const handleDeleteDestination = (id: string) => {
        if (confirm('Delete this destination?')) {
            router.delete(`/backups/destinations/${id}`);
        }
    };

    const handleDeleteSchedule = (id: string) => {
        if (confirm('Delete this schedule?')) {
            router.delete(`/backups/schedules/${id}`);
        }
    };

    const handleToggleSchedule = (schedule: Schedule) => {
        router.put(`/backups/schedules/${schedule.id}`, {
            is_active: !schedule.is_active,
        });
    };

    return (
        <AuthLayout title="Backups - UPanel">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Backups</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage backups, destinations, and schedules
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Archive className="h-4 w-4" />
                                Total Backups
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{backups.length}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <HardDrive className="h-4 w-4" />
                                Destinations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{destinations.length}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Active Schedules
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {schedules.filter(s => s.is_active).length}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Backup Destinations</CardTitle>
                            <CardDescription>Where your backups are stored</CardDescription>
                        </div>
                        <Dialog open={showDestinationDialog} onOpenChange={setShowDestinationDialog}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Destination
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Backup Destination</DialogTitle>
                                    <DialogDescription>
                                        Configure where backups will be stored
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateDestination} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dest-name">Name</Label>
                                        <Input
                                            id="dest-name"
                                            value={destinationForm.data.name}
                                            onChange={(e) => destinationForm.setData('name', e.target.value)}
                                            placeholder="My Backup Storage"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select 
                                            value={destinationForm.data.type} 
                                            onValueChange={(v) => destinationForm.setData('type', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="local">Local Storage</SelectItem>
                                                <SelectItem value="sftp">SFTP</SelectItem>
                                                <SelectItem value="b2">Backblaze B2</SelectItem>
                                                <SelectItem value="google_drive">Google Drive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {destinationForm.data.type === 'local' && (
                                        <div className="space-y-2">
                                            <Label>Path</Label>
                                            <Input
                                                value={destinationForm.data.credentials.path || ''}
                                                onChange={(e) => destinationForm.setData('credentials', { ...destinationForm.data.credentials, path: e.target.value })}
                                                placeholder="/backups"
                                            />
                                        </div>
                                    )}

                                    {destinationForm.data.type === 'sftp' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-2">
                                                    <Label>Host</Label>
                                                    <Input
                                                        value={destinationForm.data.credentials.host || ''}
                                                        onChange={(e) => destinationForm.setData('credentials', { ...destinationForm.data.credentials, host: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Port</Label>
                                                    <Input
                                                        value={destinationForm.data.credentials.port || '22'}
                                                        onChange={(e) => destinationForm.setData('credentials', { ...destinationForm.data.credentials, port: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Username</Label>
                                                <Input
                                                    value={destinationForm.data.credentials.username || ''}
                                                    onChange={(e) => destinationForm.setData('credentials', { ...destinationForm.data.credentials, username: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {destinationForm.data.type === 'b2' && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Bucket Name</Label>
                                                <Input
                                                    value={destinationForm.data.credentials.bucket || ''}
                                                    onChange={(e) => destinationForm.setData('credentials', { ...destinationForm.data.credentials, bucket: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Key ID</Label>
                                                <Input
                                                    value={destinationForm.data.credentials.key_id || ''}
                                                    onChange={(e) => destinationForm.setData('credentials', { ...destinationForm.data.credentials, key_id: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Application Key</Label>
                                                <Input
                                                    type="password"
                                                    value={destinationForm.data.credentials.app_key || ''}
                                                    onChange={(e) => destinationForm.setData('credentials', { ...destinationForm.data.credentials, app_key: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {destinationForm.data.type === 'google_drive' && (
                                        <div className="space-y-2">
                                            <Label>Folder ID</Label>
                                            <Input
                                                value={destinationForm.data.credentials.folder_id || ''}
                                                onChange={(e) => destinationForm.setData('credentials', { ...destinationForm.data.credentials, folder_id: e.target.value })}
                                                placeholder="1abc..."
                                            />
                                            <p className="text-xs text-gray-500">
                                                Requires service account JSON on server
                                            </p>
                                        </div>
                                    )}

                                    <Button type="submit" disabled={destinationForm.processing}>
                                        {destinationForm.processing ? 'Creating...' : 'Create Destination'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {destinations.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No destinations configured</p>
                        ) : (
                            <div className="space-y-2">
                                {destinations.map((dest) => (
                                    <div key={dest.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <HardDrive className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium">{dest.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {dest.type.replace('_', ' ')} • {dest.backups_count} backups
                                                </p>
                                            </div>
                                            {dest.is_default && (
                                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDestination(dest.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Backup Schedules</CardTitle>
                        <CardDescription>Automated backup schedules</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {schedules.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No schedules configured</p>
                        ) : (
                            <div className="space-y-2">
                                {schedules.map((schedule) => (
                                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium">{schedule.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {schedule.app?.name} → {schedule.destination?.name} • {schedule.cron_expression}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded ${schedule.is_active ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                                {schedule.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleToggleSchedule(schedule)}>
                                                {schedule.is_active ? 'Pause' : 'Resume'}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSchedule(schedule.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Backups</CardTitle>
                        <CardDescription>Last 100 backups across all apps</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {backups.length === 0 ? (
                            <p className="text-gray-500 text-center py-6">No backups yet</p>
                        ) : (
                            <div className="divide-y dark:divide-gray-700">
                                {backups.map((backup) => (
                                    <BackupRow key={backup.id} backup={backup} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
