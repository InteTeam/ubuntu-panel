<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('backups', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('app_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('destination_id')->constrained('backup_destinations')->cascadeOnDelete();
            $table->foreignUlid('schedule_id')->nullable()->constrained('backup_schedules')->nullOnDelete();
            $table->enum('type', ['database', 'full'])->default('full');
            $table->enum('status', ['queued', 'running', 'success', 'failed'])->default('queued');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->unsignedBigInteger('file_size_bytes')->nullable();
            $table->string('file_path', 500)->nullable();
            $table->string('checksum', 64)->nullable();
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['app_id', 'created_at']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backups');
    }
};
