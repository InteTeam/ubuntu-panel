<?php

declare(strict_types=1);

namespace App\Http\Requests\Server;

use Illuminate\Foundation\Http\FormRequest;

final class StoreServerRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:100'],
            'host' => ['required', 'string', 'max:255'],
            'port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'username' => ['nullable', 'string', 'max:50'],
            'agent_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
        ];
    }
}
