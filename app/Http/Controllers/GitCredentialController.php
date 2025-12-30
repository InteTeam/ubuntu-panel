<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\GitCredential\StoreGitCredentialRequest;
use App\Models\GitCredential;
use App\Services\GitCredentialService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class GitCredentialController extends Controller
{
    public function __construct(
        private readonly GitCredentialService $gitCredentialService,
    ) {}

    public function index(): Response
    {
        if (!auth()->user()->can('viewAny', GitCredential::class)) {
            abort(403);
        }

        return Inertia::render('Settings/GitCredentials/Index', [
            'credentials' => $this->gitCredentialService->getAllCredentials(),
        ]);
    }

    public function create(): Response
    {
        if (!auth()->user()->can('create', GitCredential::class)) {
            abort(403);
        }

        return Inertia::render('Settings/GitCredentials/Create');
    }

    public function store(StoreGitCredentialRequest $request): RedirectResponse
    {
        if (!auth()->user()->can('create', GitCredential::class)) {
            abort(403);
        }

        $this->gitCredentialService->createCredential($request->validated());

        return redirect()
            ->route('settings.git-credentials.index')
            ->with(['alert' => 'Git credential created successfully.', 'type' => 'success']);
    }

    public function destroy(GitCredential $gitCredential): RedirectResponse
    {
        if (!auth()->user()->can('delete', $gitCredential)) {
            abort(403);
        }

        $this->gitCredentialService->deleteCredential($gitCredential);

        return redirect()
            ->route('settings.git-credentials.index')
            ->with(['alert' => 'Git credential deleted successfully.', 'type' => 'success']);
    }
}
