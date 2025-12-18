<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\App\StoreAppRequest;
use App\Http\Requests\App\UpdateAppRequest;
use App\Models\App;
use App\Models\GitCredential;
use App\Models\Server;
use App\Services\AppService;
use App\Services\DeploymentService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class AppController extends Controller
{
    public function __construct(
        private readonly AppService $appService,
        private readonly DeploymentService $deploymentService,
    ) {}

    public function index(): Response
    {
        if (!auth()->user()->can('viewAny', App::class)) {
            abort(403);
        }

        return Inertia::render('Apps/Index', [
            'apps' => $this->appService->getAllApps(),
        ]);
    }

    public function create(): Response
    {
        if (!auth()->user()->can('create', App::class)) {
            abort(403);
        }

        return Inertia::render('Apps/Create', [
            'servers' => Server::where('status', 'online')->get(['id', 'name']),
            'gitCredentials' => GitCredential::all(['id', 'name', 'type']),
        ]);
    }

    public function store(StoreAppRequest $request): RedirectResponse
    {
        if (!auth()->user()->can('create', App::class)) {
            abort(403);
        }

        $app = $this->appService->createApp($request->validated());

        return redirect()
            ->route('apps.show', $app)
            ->with(['alert' => 'Application created successfully.', 'type' => 'success']);
    }

    public function show(App $app): Response
    {
        if (!auth()->user()->can('view', $app)) {
            abort(403);
        }

        $app = $this->appService->getApp($app->id);

        return Inertia::render('Apps/Show', [
            'app' => $app,
        ]);
    }

    public function edit(App $app): Response
    {
        if (!auth()->user()->can('update', $app)) {
            abort(403);
        }

        return Inertia::render('Apps/Edit', [
            'app' => $app,
            'servers' => Server::where('status', 'online')->get(['id', 'name']),
            'gitCredentials' => GitCredential::all(['id', 'name', 'type']),
        ]);
    }

    public function update(UpdateAppRequest $request, App $app): RedirectResponse
    {
        if (!auth()->user()->can('update', $app)) {
            abort(403);
        }

        $this->appService->updateApp($app, $request->validated());

        return redirect()
            ->route('apps.show', $app)
            ->with(['alert' => 'Application updated successfully.', 'type' => 'success']);
    }

    public function destroy(App $app): RedirectResponse
    {
        if (!auth()->user()->can('delete', $app)) {
            abort(403);
        }

        $this->appService->deleteApp($app);

        return redirect()
            ->route('apps.index')
            ->with(['alert' => 'Application deleted successfully.', 'type' => 'success']);
    }

    public function deploy(App $app, string $environment = 'production'): RedirectResponse
    {
        if (!auth()->user()->can('deploy', $app)) {
            abort(403);
        }

        $this->deploymentService->createDeployment($app, auth()->user(), $environment);

        return back()->with(['alert' => 'Deployment started.', 'type' => 'success']);
    }

    public function rollback(App $app, string $deploymentId): RedirectResponse
    {
        if (!auth()->user()->can('deploy', $app)) {
            abort(403);
        }

        $fromDeployment = $app->deployments()->where('id', $deploymentId)->firstOrFail();

        $this->deploymentService->createRollback($app, auth()->user(), $fromDeployment);

        return back()->with(['alert' => 'Rollback started.', 'type' => 'success']);
    }
}
