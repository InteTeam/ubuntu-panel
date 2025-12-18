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
            $table->unsignedInteger('port')->default(22);
            $table->string('username', 50)->default('upanel');
            $table->text('ssh_private_key');
            $table->text('ssh_public_key');
            $table->string('agent_token', 255)->nullable();
            $table->unsignedInteger('agent_port')->default(8443);
            $table->enum('status', ['pending', 'online', 'offline', 'error'])->default('pending');
            $table->timestamp('last_seen_at')->nullable();
            $table->string('os_version', 50)->nullable();
            $table->unsignedInteger('cpu_cores')->nullable();
            $table->unsignedInteger('ram_mb')->nullable();
            $table->unsignedInteger('disk_gb')->nullable();
            $table->timestamp('hardened_at')->nullable();
            $table->unsignedInteger('security_score')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('last_seen_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servers');
    }
};
