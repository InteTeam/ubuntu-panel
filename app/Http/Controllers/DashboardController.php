<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\App;
use App\Models\Backup;
use App\Models\Deployment;
use App\Models\Server;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => [
                'servers' => Server::count(),
                'servers_online' => Server::where('status', 'online')->count(),
                'apps' => App::count(),
                'apps_running' => App::where('status', 'running')->count(),
                'deployments_today' => Deployment::whereDate('created_at', today())->count(),
                'backups_today' => Backup::whereDate('created_at', today())->count(),
            ],
            'recentDeployments' => Deployment::with(['app', 'user'])
                ->orderByDesc('created_at')
                ->limit(5)
                ->get(),
            'recentBackups' => Backup::with(['app', 'destination'])
                ->orderByDesc('created_at')
                ->limit(5)
                ->get(),
            'servers' => Server::orderByDesc('last_seen_at')
                ->limit(5)
                ->get(['id', 'name', 'host', 'status', 'last_seen_at']),
        ]);
    }
}
