<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('server_metrics', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('server_id')->constrained()->cascadeOnDelete();
            $table->decimal('cpu_percent', 5, 2);
            $table->unsignedInteger('ram_used_mb');
            $table->unsignedInteger('ram_total_mb');
            $table->unsignedInteger('disk_used_gb');
            $table->unsignedInteger('disk_total_gb');
            $table->unsignedBigInteger('network_in_bytes')->nullable();
            $table->unsignedBigInteger('network_out_bytes')->nullable();
            $table->timestamp('recorded_at')->useCurrent();

            $table->index(['server_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('server_metrics');
    }
};
