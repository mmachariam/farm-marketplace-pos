<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Optional description of what one unit contains, e.g. "Approx 500g"
            // shown to buyers so they know what a "bunch"/"piece" means for this product.
            $table->string('bunch_contains', 100)->nullable()->after('unit');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('bunch_contains');
        });
    }
};
