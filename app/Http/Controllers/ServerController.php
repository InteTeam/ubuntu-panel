<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Server\StoreServerRequest;
use App\Http\Requests\Server\UpdateServerRequest;
use App\Models\Server;
use App\Services\ServerService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class ServerController extends Controller
{
    public function __construct(
        private readonly ServerService $serverService,
    ) {}

    public function index(): Response
    {
        if (!auth()->user()->can('viewAny', Server::class)) {
            abort(403);
        }

        return Inertia::render('Servers/Index', [
            'servers' => $this->serverService->getAllServers(),
        ]);
    }

    public function create(): Response
    {
        if (!auth()->user()->can('create', Server::class)) {
            abort(403);
        }

        return Inertia::render('Servers/Create');
    }

    public function store(StoreServerRequest $request): RedirectResponse
    {
        if (!auth()->user()->can('create', Server::class)) {
            abort(403);
        }

        $server = $this->serverService->createServer($request->validated());

        return redirect()
            ->route('servers.show', $server)
            ->with(['alert' => 'The server was created successfully.', 'type' => 'success']);
    }

    public function show(Server $server): Response
    {
        if (!auth()->user()->can('view', $server)) {
            abort(403);
        }

        $server = $this->serverService->getServer($server->id);
        $installToken = $server->isPending() ? $this->serverService->generateInstallToken($server) : null;

        return Inertia::render('Servers/Show', [
            'server' => $server,
            'installToken' => $installToken,
        ]);
    }

    public function edit(Server $server): Response
    {
        if (!auth()->user()->can('update', $server)) {
            abort(403);
        }

        return Inertia::render('Servers/Edit', [
            'server' => $server,
        ]);
    }

    public function update(UpdateServerRequest $request, Server $server): RedirectResponse
    {
        if (!auth()->user()->can('update', $server)) {
            abort(403);
        }

        $this->serverService->updateServer($server, $request->validated());

        return redirect()
            ->route('servers.show', $server)
            ->with(['alert' => 'The server was updated successfully.', 'type' => 'success']);
    }

    public function destroy(Server $server): RedirectResponse
    {
        if (!auth()->user()->can('delete', $server)) {
            abort(403);
        }

        $this->serverService->deleteServer($server);

        return redirect()
            ->route('servers.index')
            ->with(['alert' => 'The server was deleted successfully.', 'type' => 'success']);
    }

    public function testConnection(Server $server): RedirectResponse
    {
        if (!auth()->user()->can('manage', $server)) {
            abort(403);
        }

        $success = $this->serverService->testConnection($server);

        if ($success) {
            return back()->with(['alert' => 'Connection successful.', 'type' => 'success']);
        }

        return back()->with(['alert' => 'Connection failed.', 'type' => 'error']);
    }

    public function rotateToken(Server $server): RedirectResponse
    {
        if (!auth()->user()->can('manage', $server)) {
            abort(403);
        }

        $this->serverService->rotateAgentToken($server);

        return back()->with(['alert' => 'Agent token rotated. Update your agent configuration.', 'type' => 'success']);
    }
}
