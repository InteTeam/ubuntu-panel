<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('backup_destinations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name', 100);
            $table->enum('type', ['google_drive', 'backblaze_b2', 'sftp', 'local']);
            $table->text('credentials'); // Encrypted JSON
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backup_destinations');
    }
};
