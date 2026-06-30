<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pos_sales', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        Schema::table('pos_sales', function (Blueprint $table) {
            $table->id('sale_id')->first();
            $table->unsignedBigInteger('seller_id')->after('sale_id');
            $table->string('buyer_name', 100)->nullable()->after('seller_id');
            $table->enum('payment_method', ['Cash', 'M-Pesa'])->default('Cash')->after('buyer_name');
            $table->decimal('total_amount', 10, 2)->after('payment_method');
            $table->timestamp('sale_date')->useCurrent()->after('total_amount');

            $table->foreign('seller_id')->references('user_id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pos_sales', function (Blueprint $table) {
            $table->dropForeign(['seller_id']);
            $table->dropColumn(['sale_id', 'seller_id', 'buyer_name', 'payment_method', 'total_amount', 'sale_date']);
        });

        Schema::table('pos_sales', function (Blueprint $table) {
            $table->id()->first();
        });
    }
};
