<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id('product_id');
            $table->unsignedBigInteger('seller_id');
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('zone_id')->nullable();

            $table->string('name', 150);
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->string('unit', 30);
            $table->string('image_url', 255)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');

            $table->timestamps();

            $table->foreign('seller_id')
                  ->references('user_id')->on('users')
                  ->cascadeOnDelete();

            $table->foreign('category_id')
                  ->references('category_id')->on('categories');

            $table->foreign('zone_id')
                  ->references('zone_id')->on('pickup_zones')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
