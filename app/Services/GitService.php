<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\App;
use App\Models\GitCredential;
use phpseclib3\Net\SSH2;

final class GitService
{
    public function __construct(
        private readonly SshService $sshService,
    ) {}

    public function clone(SSH2 $ssh, App $app): string
    {
        $repoUrl = $this->buildAuthenticatedUrl($app);
        $deployPath = $app->deploy_path;

        $output = $this->sshService->execute($ssh, "mkdir -p {$deployPath}");
        $output .= $this->sshService->execute($ssh, "git clone --branch {$app->git_branch} --depth 1 {$repoUrl} {$deployPath}");

        return $output;
    }

    public function pull(SSH2 $ssh, App $app): string
    {
        $deployPath = $app->deploy_path;

        return $this->sshService->execute($ssh, "cd {$deployPath} && git fetch origin && git reset --hard origin/{$app->git_branch}");
    }

    public function getLatestCommit(SSH2 $ssh, App $app): array
    {
        $deployPath = $app->deploy_path;

        $hash = trim($this->sshService->execute($ssh, "cd {$deployPath} && git rev-parse HEAD"));
        $message = trim($this->sshService->execute($ssh, "cd {$deployPath} && git log -1 --pretty=%s"));

        return [
            'hash' => $hash,
            'message' => $message,
        ];
    }

    public function checkout(SSH2 $ssh, App $app, string $commitHash): string
    {
        $deployPath = $app->deploy_path;

        return $this->sshService->execute($ssh, "cd {$deployPath} && git checkout {$commitHash}");
    }

    private function buildAuthenticatedUrl(App $app): string
    {
        $repoUrl = $app->git_repository;
        $credential = $app->gitCredential;

        if (!$credential) {
            return $repoUrl;
        }

        $credentials = $credential->credentials;

        return match ($credential->type) {
            'token' => $this->injectToken($repoUrl, $credentials['token']),
            'basic' => $this->injectBasicAuth($repoUrl, $credentials['username'], $credentials['password']),
            default => $repoUrl,
        };
    }

    private function injectToken(string $url, string $token): string
    {
        // https://github.com/... → https://x-access-token:TOKEN@github.com/...
        return preg_replace('#^https://#', "https://x-access-token:{$token}@", $url);
    }

    private function injectBasicAuth(string $url, string $username, string $password): string
    {
        $encodedPassword = urlencode($password);

        return preg_replace('#^https://#', "https://{$username}:{$encodedPassword}@", $url);
    }
}
