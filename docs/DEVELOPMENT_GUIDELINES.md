# Development Guidelines - UPanel

**Last Updated:** 2024-12-15

---

## Code Standards

### PHP Files

Every PHP file must start with:
```php
<?php

declare(strict_types=1);
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `ServerService` |
| Methods | camelCase | `getServerStatus()` |
| Variables | camelCase | `$serverName` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |
| Database tables | snake_case | `backup_schedules` |
| Database columns | snake_case | `created_at` |

### Controller Pattern

Controllers must be thin - authorization + service call + response:

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreServerRequest;
use App\Models\Server;
use App\Services\ServerService;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

#[UsePolicy(ServerPolicy::class)]
final class ServerController extends Controller
{
    public function __construct(
        private readonly ServerService $serverService
    ) {}

    public function index(): Response
    {
        if (!auth()->user()->can('viewAny', Server::class)) {
            abort(403);
        }

        return inertia('Servers/Index', [
            'servers' => $this->serverService->getAllServers(),
        ]);
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
}
```

**Rules:**
- `#[UsePolicy]` attribute on class
- Authorization via `auth()->user()->can()` with `abort(403)`
- NO `$this->authorize()` method
- Business logic in Service, not Controller
- Flash messages: `['alert' => 'The X was Y.', 'type' => 'success|error']`

### Service Pattern

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Server;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class ServerService
{
    public function __construct(
        private readonly SshService $sshService
    ) {}

    public function getAllServers(): Collection
    {
        return Server::query()
            ->with(['apps'])
            ->orderBy('name')
            ->get();
    }

    public function createServer(array $data): Server
    {
        return DB::transaction(function () use ($data) {
            $keypair = $this->sshService->generateKeypair();
            
            $server = Server::create([
                'name' => $data['name'],
                'host' => $data['host'],
                'port' => $data['port'] ?? 22,
                'username' => $data['username'] ?? 'upanel',
                'ssh_private_key' => $keypair['private'],
                'ssh_public_key' => $keypair['public'],
                'status' => 'pending',
            ]);

            Log::info('Server created', ['server_id' => $server->id]);

            return $server;
        });
    }
}
```

**Rules:**
- `final` class
- Constructor injection for dependencies
- Database transactions for multi-step operations
- Logging for important operations
- Return types on all methods

### Model Pattern

```php
<?php

declare(strict_types=1);

namespace App\Models;

use App\Policies\ServerPolicy;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[UsePolicy(ServerPolicy::class)]
final class Server extends Model
{
    use HasUlids;

    protected $fillable = [
        'name',
        'host',
        'port',
        'username',
        'ssh_private_key',
        'ssh_public_key',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'ssh_private_key' => 'encrypted',
            'port' => 'integer',
            'last_seen_at' => 'datetime',
        ];
    }

    public function apps(): HasMany
    {
        return $this->hasMany(App::class);
    }
}
```

**Rules:**
- `#[UsePolicy]` attribute
- `HasUlids` trait (not auto-increment)
- `casts()` method (not `$casts` property)
- `encrypted` cast for sensitive fields
- Return types on relationships

### Form Request Pattern

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class StoreServerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization in controller
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
        ];
    }
}
```

**Rules:**
- `authorize()` returns `true` (auth in controller)
- Array-based rules (NOT pipe strings)
- PHPDoc for return type

### Policy Pattern

```php
<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Server;
use App\Models\User;

final class ServerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(User $user, Server $server): bool
    {
        return $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Server $server): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Server $server): bool
    {
        return $user->role === 'admin';
    }
}
```

### Migration Pattern

```php
<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servers', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name', 100);
            $table->string('host', 255);
            $table->integer('port')->default(22);
            $table->string('username', 50)->default('upanel');
            $table->text('ssh_private_key');
            $table->text('ssh_public_key');
            $table->string('status', 20)->default('pending');
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->index(['status']);
            $table->index(['last_seen_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servers');
    }
};
```

**Rules:**
- `declare(strict_types=1)`
- `ulid()` for primary keys
- `foreignUlid()` for foreign keys
- Indexes on queried columns

---

## Flash Messages

**Format:** `['alert' => 'The X was Y.', 'type' => 'success|error|warning|info']`

**Rules:**
- Start with "The"
- End with period
- Use past tense
- Be specific

**Examples:**
```php
// ✅ CORRECT
->with(['alert' => 'The server was created successfully.', 'type' => 'success'])
->with(['alert' => 'The deployment failed.', 'type' => 'error'])
->with(['alert' => 'The backup was scheduled.', 'type' => 'success'])

// ❌ WRONG
->with(['alert' => 'Server created!', 'type' => 'success'])
->with(['alert' => 'Successfully created server', 'type' => 'success'])
->with(['alert' => 'Done', 'type' => 'success'])
```

---

## Error Handling

### SSH Operations

```php
try {
    $output = $this->sshService->execute($server, $command);
} catch (SshConnectionException $e) {
    Log::error('SSH connection failed', [
        'server_id' => $server->id,
        'error' => $e->getMessage(),
    ]);
    throw $e;
} catch (SshCommandException $e) {
    Log::error('SSH command failed', [
        'server_id' => $server->id,
        'command' => $command,
        'error' => $e->getMessage(),
    ]);
    throw $e;
}
```

### API Responses

```php
// Success
return response()->json(['data' => $server], 201);

// Validation error (automatic via Form Request)
// Returns 422 with errors

// Not found
abort(404, 'Server not found');

// Forbidden
abort(403, 'You do not have permission');

// Server error
Log::error('Unexpected error', ['exception' => $e]);
abort(500, 'An error occurred');
```

---

## Quality Tools

### PHPStan (Level 9)

```bash
docker compose exec app ./vendor/bin/phpstan analyse
```

### Laravel Pint

```bash
docker compose exec app ./vendor/bin/pint
```

### Run Before Commit

```bash
docker compose exec app php artisan test && \
docker compose exec app ./vendor/bin/pint && \
docker compose exec app ./vendor/bin/phpstan analyse
```
