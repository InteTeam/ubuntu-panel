<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ServerService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

final class InstallController extends Controller
{
    public function __construct(
        private readonly ServerService $serverService,
    ) {}

    public function script(string $token): HttpResponse
    {
        $server = $this->serverService->validateInstallToken($token);

        if (!$server) {
            abort(404, 'Invalid or expired install token');
        }

        $script = view('scripts.install', [
            'token' => $token,
            'panelUrl' => config('app.url'),
            'publicKey' => $server->ssh_public_key,
            'agentPort' => $server->agent_port,
        ])->render();

        return response($script, 200, [
            'Content-Type' => 'text/plain',
        ]);
    }

    public function publicKey(string $token): HttpResponse
    {
        $server = $this->serverService->validateInstallToken($token);

        if (!$server) {
            abort(404);
        }

        return response($server->ssh_public_key, 200, [
            'Content-Type' => 'text/plain',
        ]);
    }

    public function complete(Request $request, string $token): HttpResponse
    {
        $server = $this->serverService->validateInstallToken($token);

        if (!$server) {
            abort(404);
        }

        $request->validate([
            'agent_token' => ['required', 'string', 'size:64'],
            'os_version' => ['nullable', 'string', 'max:50'],
            'cpu_cores' => ['nullable', 'integer'],
            'ram_mb' => ['nullable', 'integer'],
            'disk_gb' => ['nullable', 'integer'],
        ]);

        $server->update([
            'agent_token' => hash('sha256', $request->input('agent_token')),
            'status' => 'online',
            'last_seen_at' => now(),
            'os_version' => $request->input('os_version'),
            'cpu_cores' => $request->input('cpu_cores'),
            'ram_mb' => $request->input('ram_mb'),
            'disk_gb' => $request->input('disk_gb'),
        ]);

        // Clear the install token
        cache()->forget("install_token:{$token}");

        return response()->json(['status' => 'ok']);
    }
}
