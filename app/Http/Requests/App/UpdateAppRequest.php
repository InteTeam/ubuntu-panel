<?php

declare(strict_types=1);

namespace App\Http\Requests\App;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateAppRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:100'],
            'git_repository' => ['sometimes', 'string', 'max:500', 'url'],
            'git_branch' => ['sometimes', 'string', 'max:100'],
            'git_credentials_id' => ['nullable', 'ulid', 'exists:git_credentials,id'],
            'deploy_path' => ['sometimes', 'string', 'max:255'],
            'docker_compose_file' => ['sometimes', 'string', 'max:100'],
            'env_production' => ['nullable', 'array'],
            'env_staging' => ['nullable', 'array'],
            'primary_domain' => ['nullable', 'string', 'max:255'],
            'staging_domain' => ['nullable', 'string', 'max:255'],
        ];
    }
}
