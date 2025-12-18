<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\App;
use App\Models\Backup;
use App\Models\BackupDestination;
use App\Models\BackupSchedule;
use App\Services\BackupService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class BackupController extends Controller
{
    public function __construct(
        private readonly BackupService $backupService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Backups/Index', [
            'backups' => $this->backupService->getAllBackups(),
            'destinations' => $this->backupService->getAllDestinations(),
            'schedules' => $this->backupService->getAllSchedules(),
        ]);
    }

    public function createBackup(Request $request): RedirectResponse
    {
        $request->validate([
            'app_id' => ['required', 'ulid', 'exists:apps,id'],
            'destination_id' => ['required', 'ulid', 'exists:backup_destinations,id'],
            'type' => ['required', 'in:full,database'],
        ]);

        $app = App::findOrFail($request->input('app_id'));
        $destination = BackupDestination::findOrFail($request->input('destination_id'));

        $this->backupService->createBackup($app, $destination, $request->input('type'));

        return back()->with(['alert' => 'Backup started.', 'type' => 'success']);
    }

    public function storeDestination(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'in:local,sftp,b2,google_drive'],
            'credentials' => ['required', 'array'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $this->backupService->createDestination($request->only(['name', 'type', 'credentials', 'is_default']));

        return back()->with(['alert' => 'Destination created.', 'type' => 'success']);
    }

    public function updateDestination(Request $request, BackupDestination $destination): RedirectResponse
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'type' => ['sometimes', 'in:local,sftp,b2,google_drive'],
            'credentials' => ['sometimes', 'array'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $this->backupService->updateDestination($destination, $request->only(['name', 'type', 'credentials', 'is_default']));

        return back()->with(['alert' => 'Destination updated.', 'type' => 'success']);
    }

    public function destroyDestination(BackupDestination $destination): RedirectResponse
    {
        $this->backupService->deleteDestination($destination);

        return back()->with(['alert' => 'Destination deleted.', 'type' => 'success']);
    }

    public function storeSchedule(Request $request): RedirectResponse
    {
        $request->validate([
            'app_id' => ['required', 'ulid', 'exists:apps,id'],
            'destination_id' => ['required', 'ulid', 'exists:backup_destinations,id'],
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'in:full,database'],
            'cron_expression' => ['required', 'string', 'max:50'],
            'retention_count' => ['nullable', 'integer', 'min:1', 'max:365'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $this->backupService->createSchedule($request->only([
            'app_id', 'destination_id', 'name', 'type', 'cron_expression', 'retention_count', 'is_active'
        ]));

        return back()->with(['alert' => 'Schedule created.', 'type' => 'success']);
    }

    public function updateSchedule(Request $request, BackupSchedule $schedule): RedirectResponse
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'destination_id' => ['sometimes', 'ulid', 'exists:backup_destinations,id'],
            'type' => ['sometimes', 'in:full,database'],
            'cron_expression' => ['sometimes', 'string', 'max:50'],
            'retention_count' => ['nullable', 'integer', 'min:1', 'max:365'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $this->backupService->updateSchedule($schedule, $request->only([
            'name', 'destination_id', 'type', 'cron_expression', 'retention_count', 'is_active'
        ]));

        return back()->with(['alert' => 'Schedule updated.', 'type' => 'success']);
    }

    public function destroySchedule(BackupSchedule $schedule): RedirectResponse
    {
        $this->backupService->deleteSchedule($schedule);

        return back()->with(['alert' => 'Schedule deleted.', 'type' => 'success']);
    }

    public function destroyBackup(Backup $backup): RedirectResponse
    {
        $backup->delete();

        return back()->with(['alert' => 'Backup deleted.', 'type' => 'success']);
    }
}
