<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add all new columns first (table currently has created_at, updated_at after partial prior run)
        Schema::table('pos_sale_items', function (Blueprint $table) {
            $table->id('pos_item_id');
            $table->unsignedBigInteger('sale_id');
            $table->string('product_name', 100);
            $table->decimal('quantity', 10, 2);
            $table->string('unit', 20)->default('kg');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 10, 2);

            $table->foreign('sale_id')->references('sale_id')->on('pos_sales')->cascadeOnDelete();
        });

        // Now safe to drop the leftover timestamp columns
        Schema::table('pos_sale_items', function (Blueprint $table) {
            $table->dropColumn(['created_at', 'updated_at']);
        });
    }

    public function down(): void
    {
        Schema::table('pos_sale_items', function (Blueprint $table) {
            $table->dropForeign(['sale_id']);
            $table->dropColumn(['pos_item_id', 'sale_id', 'product_name', 'quantity', 'unit', 'unit_price', 'subtotal']);
        });
    }
};
