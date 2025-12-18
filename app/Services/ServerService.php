<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Server;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class ServerService
{
    public function __construct(
        private readonly SshService $sshService,
    ) {}

    public function getAllServers(): Collection
    {
        return Server::query()
            ->withCount('apps')
            ->orderBy('name')
            ->get();
    }

    public function getServer(string $id): Server
    {
        return Server::query()
            ->with(['apps', 'metrics' => fn ($q) => $q->latest('recorded_at')->limit(60)])
            ->findOrFail($id);
    }

    public function createServer(array $data): Server
    {
        return DB::transaction(function () use ($data) {
            $keypair = $this->sshService->generateKeypair();

            $server = Server::create([
                'name' => $data['name'],
                'host' => $data['host'],
                'port' => $data['port'] ?? 22,
                'username' => $data['username'] ?? 'upanel',
                'ssh_private_key' => $keypair['private'],
                'ssh_public_key' => $keypair['public'],
                'agent_port' => $data['agent_port'] ?? 8443,
                'status' => 'pending',
            ]);

            Log::info('Server created', ['server_id' => $server->id, 'name' => $server->name]);

            return $server;
        });
    }

    public function updateServer(Server $server, array $data): Server
    {
        $server->update([
            'name' => $data['name'] ?? $server->name,
            'host' => $data['host'] ?? $server->host,
            'port' => $data['port'] ?? $server->port,
            'username' => $data['username'] ?? $server->username,
            'agent_port' => $data['agent_port'] ?? $server->agent_port,
        ]);

        Log::info('Server updated', ['server_id' => $server->id]);

        return $server->fresh();
    }

    public function deleteServer(Server $server): void
    {
        $serverId = $server->id;
        $serverName = $server->name;

        $server->delete();

        Log::info('Server deleted', ['server_id' => $serverId, 'name' => $serverName]);
    }

    public function generateInstallToken(Server $server): string
    {
        $token = Str::random(64);

        cache()->put(
            "install_token:{$token}",
            ['server_id' => $server->id, 'created_at' => now()],
            now()->addHour()
        );

        return $token;
    }

    public function validateInstallToken(string $token): ?Server
    {
        $data = cache()->get("install_token:{$token}");

        if (!$data) {
            return null;
        }

        return Server::find($data['server_id']);
    }

    public function completeInstallation(Server $server, string $agentToken): Server
    {
        $server->update([
            'agent_token' => hash('sha256', $agentToken),
            'status' => 'online',
            'last_seen_at' => now(),
        ]);

        Log::info('Server installation completed', ['server_id' => $server->id]);

        return $server->fresh();
    }

    public function rotateAgentToken(Server $server): string
    {
        $newToken = Str::random(64);

        $server->update([
            'agent_token' => hash('sha256', $newToken),
        ]);

        Log::info('Agent token rotated', ['server_id' => $server->id]);

        return $newToken;
    }

    public function testConnection(Server $server): bool
    {
        return $this->sshService->testConnection(
            $server->host,
            $server->port,
            $server->username,
            decrypt($server->ssh_private_key)
        );
    }
}
