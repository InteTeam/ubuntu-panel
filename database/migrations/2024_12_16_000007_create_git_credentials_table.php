<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('git_credentials', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name', 100);
            $table->enum('type', ['ssh_key', 'token', 'basic']);
            $table->text('credentials'); // Encrypted JSON
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('git_credentials');
    }
};
