<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id('delivery_id');
            $table->unsignedBigInteger('order_id')->unique();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->string('delivery_address')->nullable();
            $table->enum('delivery_status', ['Pending', 'In Transit', 'Delivered'])->default('Pending');
            $table->date('delivery_date')->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('order_id')->on('orders')->cascadeOnDelete();
            $table->foreign('zone_id')->references('zone_id')->on('pickup_zones')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
