<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->unsignedBigInteger('buyer_id');
            $table->decimal('total_amount', 10, 2);
            $table->enum('order_status', ['Pending', 'Confirmed', 'Delivered', 'Cancelled'])->default('Pending');
            $table->timestamp('order_date')->useCurrent();
            $table->timestamps();

            $table->foreign('buyer_id')->references('user_id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
