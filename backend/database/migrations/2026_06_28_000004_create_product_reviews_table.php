<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id('review_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('buyer_id');
            $table->tinyInteger('rating'); // 1–5
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'buyer_id']); // one review per buyer per product

            $table->foreign('product_id')
                  ->references('product_id')->on('products')
                  ->cascadeOnDelete();

            $table->foreign('buyer_id')
                  ->references('user_id')->on('users')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};
