<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deployments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('app_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('commit_hash', 40);
            $table->text('commit_message')->nullable();
            $table->string('branch', 100);
            $table->enum('environment', ['production', 'staging']);
            $table->enum('status', ['queued', 'running', 'success', 'failed', 'cancelled'])->default('queued');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->text('log')->nullable();
            $table->text('error_message')->nullable();
            $table->boolean('is_rollback')->default(false);
            $table->ulid('rollback_from_id')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['app_id', 'created_at']);
            $table->index('status');
        });

        // Add self-referential FK after table exists
        Schema::table('deployments', function (Blueprint $table) {
            $table->foreign('rollback_from_id')
                ->references('id')
                ->on('deployments')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deployments');
    }
};
