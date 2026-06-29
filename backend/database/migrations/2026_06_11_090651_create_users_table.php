<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id('user_id');
            $table->string('name', 100);
            $table->string('email', 100)->unique();
            $table->string('password', 255);
            $table->string('phone_number', 20)->nullable();
            $table->enum('role', ['buyer', 'seller', 'admin'])->default('buyer');
            $table->string('region', 100)->nullable();
            $table->string('avatar_url', 255)->nullable();

            // Farmer-specific: linked to a pickup zone
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->foreign('zone_id')
                  ->references('zone_id')
                  ->on('pickup_zones')
                  ->nullOnDelete();

            // Admin verifies farmers before they can list products
            $table->boolean('is_verified')->default(false);
            $table->enum('status', ['active', 'suspended'])->default('active');

            $table->timestamps(); // created_at, updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};