<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Server;
use App\Models\ServerMetric;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AgentController extends Controller
{
    public function heartbeat(Request $request): JsonResponse
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $hashedToken = hash('sha256', $token);
        $server = Server::where('agent_token', $hashedToken)->first();

        if (!$server) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'cpu_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'ram_used_mb' => ['nullable', 'integer'],
            'ram_total_mb' => ['nullable', 'integer'],
            'disk_used_gb' => ['nullable', 'integer'],
            'disk_total_gb' => ['nullable', 'integer'],
            'network_in_bytes' => ['nullable', 'integer'],
            'network_out_bytes' => ['nullable', 'integer'],
        ]);

        $server->update([
            'status' => 'online',
            'last_seen_at' => now(),
        ]);

        if ($request->has('cpu_percent')) {
            ServerMetric::create([
                'server_id' => $server->id,
                'cpu_percent' => $request->input('cpu_percent'),
                'ram_used_mb' => $request->input('ram_used_mb'),
                'ram_total_mb' => $request->input('ram_total_mb'),
                'disk_used_gb' => $request->input('disk_used_gb'),
                'disk_total_gb' => $request->input('disk_total_gb'),
                'network_in_bytes' => $request->input('network_in_bytes'),
                'network_out_bytes' => $request->input('network_out_bytes'),
                'recorded_at' => now(),
            ]);
        }

        return response()->json(['status' => 'ok']);
    }
}
