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

        // Support both nested format (from agent) and flat format (legacy)
        $metrics = $request->input('metrics', []);
        $isNestedFormat = !empty($metrics);

        if ($isNestedFormat) {
            // Nested format from Go agent
            $request->validate([
                'server_id' => ['required', 'string'],
                'timestamp' => ['required', 'string'],
                'agent_version' => ['nullable', 'string'],
                'metrics' => ['required', 'array'],
                'metrics.cpu_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
                'metrics.ram_used_mb' => ['nullable', 'integer'],
                'metrics.ram_total_mb' => ['nullable', 'integer'],
                'metrics.disk_used_gb' => ['nullable', 'integer'],
                'metrics.disk_total_gb' => ['nullable', 'integer'],
                'containers' => ['nullable', 'array'],
                'containers.*.id' => ['required', 'string'],
                'containers.*.name' => ['required', 'string'],
                'containers.*.image' => ['required', 'string'],
                'containers.*.status' => ['required', 'string'],
                'containers.*.state' => ['nullable', 'string'],
            ]);

            $cpuPercent = $metrics['cpu_percent'] ?? null;
            $ramUsedMb = $metrics['ram_used_mb'] ?? null;
            $ramTotalMb = $metrics['ram_total_mb'] ?? null;
            $diskUsedGb = $metrics['disk_used_gb'] ?? null;
            $diskTotalGb = $metrics['disk_total_gb'] ?? null;
        } else {
            // Flat format (legacy/direct)
            $request->validate([
                'cpu_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
                'ram_used_mb' => ['nullable', 'integer'],
                'ram_total_mb' => ['nullable', 'integer'],
                'disk_used_gb' => ['nullable', 'integer'],
                'disk_total_gb' => ['nullable', 'integer'],
                'network_in_bytes' => ['nullable', 'integer'],
                'network_out_bytes' => ['nullable', 'integer'],
            ]);

            $cpuPercent = $request->input('cpu_percent');
            $ramUsedMb = $request->input('ram_used_mb');
            $ramTotalMb = $request->input('ram_total_mb');
            $diskUsedGb = $request->input('disk_used_gb');
            $diskTotalGb = $request->input('disk_total_gb');
        }

        // Update server status
        $updateData = [
            'status' => 'online',
            'last_seen_at' => now(),
        ];

        // Store containers as JSON if provided
        $containers = $request->input('containers');
        if ($containers !== null) {
            $updateData['containers'] = $containers;
        }

        $server->update($updateData);

        // Store metrics if CPU data is present
        if ($cpuPercent !== null) {
            ServerMetric::create([
                'server_id' => $server->id,
                'cpu_percent' => $cpuPercent,
                'ram_used_mb' => $ramUsedMb,
                'ram_total_mb' => $ramTotalMb,
                'disk_used_gb' => $diskUsedGb,
                'disk_total_gb' => $diskTotalGb,
                'network_in_bytes' => $request->input('network_in_bytes'),
                'network_out_bytes' => $request->input('network_out_bytes'),
                'recorded_at' => now(),
            ]);
        }

        return response()->json([
            'status' => 'ok',
            'server_time' => now()->toIso8601String(),
            'next_heartbeat_seconds' => 60,
        ]);
    }
}
