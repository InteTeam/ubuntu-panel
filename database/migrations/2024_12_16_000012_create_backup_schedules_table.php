<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('backup_schedules', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('app_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('destination_id')->constrained('backup_destinations')->cascadeOnDelete();
            $table->string('name', 100);
            $table->enum('type', ['database', 'full'])->default('full');
            $table->string('cron_expression', 100);
            $table->unsignedInteger('retention_count')->default(7);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_run_at')->nullable();
            $table->timestamp('next_run_at')->nullable();
            $table->timestamps();

            $table->index('next_run_at');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backup_schedules');
    }
};
