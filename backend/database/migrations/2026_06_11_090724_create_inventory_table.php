<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory', function (Blueprint $table) {
            $table->id('inventory_id');
            $table->unsignedBigInteger('product_id')->unique();
            $table->decimal('quantity_available', 10, 2)->default(0);
            $table->decimal('low_stock_threshold', 10, 2)->default(10);
            $table->timestamps();

            $table->foreign('product_id')
                  ->references('product_id')->on('products')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};
