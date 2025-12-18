<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('apps', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('server_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('git_repository', 500);
            $table->string('git_branch', 100)->default('main');
            $table->foreignUlid('git_credentials_id')->nullable()->constrained()->nullOnDelete();
            $table->string('deploy_path', 255);
            $table->string('docker_compose_file', 100)->default('docker-compose.yml');
            $table->text('env_vars')->nullable(); // Encrypted JSON
            $table->text('env_production')->nullable(); // Encrypted JSON
            $table->text('env_staging')->nullable(); // Encrypted JSON
            $table->string('primary_domain', 255)->nullable();
            $table->string('staging_domain', 255)->nullable();
            $table->enum('status', ['pending', 'deploying', 'running', 'stopped', 'failed'])->default('pending');
            $table->string('current_commit', 40)->nullable();
            $table->timestamps();

            $table->index('server_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('apps');
    }
};
