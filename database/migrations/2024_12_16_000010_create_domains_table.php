<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('domains', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('app_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('server_id')->constrained()->cascadeOnDelete();
            $table->string('domain', 255)->unique();
            $table->enum('environment', ['production', 'staging'])->default('production');
            $table->boolean('ssl_enabled')->default(true);
            $table->boolean('ssl_auto_renew')->default(true);
            $table->timestamp('ssl_expires_at')->nullable();
            $table->unsignedInteger('upstream_port');
            $table->enum('status', ['pending', 'active', 'error'])->default('pending');
            $table->boolean('caddy_configured')->default(false);
            $table->timestamps();

            $table->index('app_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('domains');
    }
};
