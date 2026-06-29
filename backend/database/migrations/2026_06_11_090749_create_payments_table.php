<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->unsignedBigInteger('order_id')->unique();
            $table->enum('payment_method', ['M-Pesa', 'Card', 'Cash']);
            $table->decimal('amount', 10, 2);
            $table->enum('payment_status', ['Pending', 'Completed', 'Failed']);
            $table->string('phone_number')->nullable();
            $table->string('mpesa_checkout_request_id')->nullable();
            $table->string('mpesa_receipt_number')->nullable();
            $table->timestamp('payment_date')->useCurrent();
            $table->timestamps();

            $table->foreign('order_id')->references('order_id')->on('orders')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
