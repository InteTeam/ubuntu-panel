<?php

declare(strict_types=1);

namespace App\Http\Requests\App;

use Illuminate\Foundation\Http\FormRequest;

final class StoreAppRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'server_id' => ['required', 'ulid', 'exists:servers,id'],
            'name' => ['required', 'string', 'max:100'],
            'git_repository' => ['required', 'string', 'max:500', 'url'],
            'git_branch' => ['nullable', 'string', 'max:100'],
            'git_credentials_id' => ['nullable', 'ulid', 'exists:git_credentials,id'],
            'deploy_path' => ['required', 'string', 'max:255'],
            'docker_compose_file' => ['nullable', 'string', 'max:100'],
            'env_production' => ['nullable', 'array'],
            'env_staging' => ['nullable', 'array'],
            'primary_domain' => ['nullable', 'string', 'max:255'],
            'staging_domain' => ['nullable', 'string', 'max:255'],
        ];
    }
}
