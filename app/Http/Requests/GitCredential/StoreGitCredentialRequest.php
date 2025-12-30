<?php

declare(strict_types=1);

namespace App\Http\Requests\GitCredential;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreGitCredentialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'string', Rule::in(['ssh_key', 'token', 'basic'])],
            'private_key' => ['required_if:type,ssh_key', 'nullable', 'string'],
            'passphrase' => ['nullable', 'string'],
            'token' => ['required_if:type,token', 'nullable', 'string'],
            'username' => ['required_if:type,basic', 'nullable', 'string', 'max:255'],
            'password' => ['required_if:type,basic', 'nullable', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'private_key.required_if' => 'The private key is required for SSH credentials.',
            'token.required_if' => 'The token is required for token credentials.',
            'username.required_if' => 'The username is required for basic auth credentials.',
            'password.required_if' => 'The password is required for basic auth credentials.',
        ];
    }
}
