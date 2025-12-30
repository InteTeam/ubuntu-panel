<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\GitCredential;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

final class GitCredentialService
{
    /**
     * Get all credentials with app counts (without exposing secrets)
     */
    public function getAllCredentials(): Collection
    {
        return GitCredential::query()
            ->withCount('apps')
            ->orderBy('name')
            ->get()
            ->map(fn (GitCredential $cred) => [
                'id' => $cred->id,
                'name' => $cred->name,
                'type' => $cred->type,
                'apps_count' => $cred->apps_count,
                'created_at' => $cred->created_at,
            ]);
    }

    /**
     * Create a new credential
     *
     * @param array<string, mixed> $data
     */
    public function createCredential(array $data): GitCredential
    {
        $credentials = $this->buildCredentialsArray($data);

        $credential = GitCredential::create([
            'name' => $data['name'],
            'type' => $data['type'],
            'credentials' => $credentials,
        ]);

        Log::info('Git credential created', [
            'credential_id' => $credential->id,
            'name' => $credential->name,
            'type' => $credential->type,
        ]);

        return $credential;
    }

    /**
     * Delete a credential
     */
    public function deleteCredential(GitCredential $credential): void
    {
        // Set git_credentials_id to null for apps using this credential
        $credential->apps()->update(['git_credentials_id' => null]);

        Log::info('Git credential deleted', [
            'credential_id' => $credential->id,
            'name' => $credential->name,
        ]);

        $credential->delete();
    }

    /**
     * Build the credentials array based on type
     *
     * @param array<string, mixed> $data
     * @return array<string, string|null>
     */
    private function buildCredentialsArray(array $data): array
    {
        return match ($data['type']) {
            'ssh_key' => [
                'private_key' => $data['private_key'],
                'passphrase' => $data['passphrase'] ?? null,
            ],
            'token' => [
                'token' => $data['token'],
            ],
            'basic' => [
                'username' => $data['username'],
                'password' => $data['password'],
            ],
            default => [],
        };
    }

    /**
     * Get decrypted credentials for a credential ID
     */
    public function getCredentials(string $credentialId): ?array
    {
        $credential = GitCredential::find($credentialId);

        if (!$credential) {
            return null;
        }

        return [
            'type' => $credential->type,
            'credentials' => $credential->credentials,
        ];
    }
}
