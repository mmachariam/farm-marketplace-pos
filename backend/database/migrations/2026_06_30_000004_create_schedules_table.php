<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id('schedule_id');
            $table->unsignedBigInteger('seller_id');
            $table->enum('day', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
            $table->time('arrival_time');
            $table->string('notes', 255)->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->timestamps();

            $table->foreign('seller_id')->references('user_id')->on('users')->cascadeOnDelete();
            $table->foreign('zone_id')->references('zone_id')->on('pickup_zones')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
