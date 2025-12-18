<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\App;
use App\Models\Backup;
use App\Models\BackupDestination;
use App\Models\Server;
use App\Policies\AppPolicy;
use App\Policies\BackupDestinationPolicy;
use App\Policies\BackupPolicy;
use App\Policies\ServerPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Server::class, ServerPolicy::class);
        Gate::policy(App::class, AppPolicy::class);
        Gate::policy(Backup::class, BackupPolicy::class);
        Gate::policy(BackupDestination::class, BackupDestinationPolicy::class);
    }
}
