<?php

declare(strict_types=1);

namespace App\Http\Requests\Server;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateServerRequest extends FormRequest
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
            'host' => ['sometimes', 'string', 'max:255'],
            'port' => ['sometimes', 'integer', 'min:1', 'max:65535'],
            'username' => ['sometimes', 'string', 'max:50'],
            'agent_port' => ['sometimes', 'integer', 'min:1', 'max:65535'],
        ];
    }
}
