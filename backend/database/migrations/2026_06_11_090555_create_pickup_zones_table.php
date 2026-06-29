<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pickup_zones', function (Blueprint $table) {
            $table->id('zone_id');
            $table->string('zone_name', 100);
            $table->string('pickup_address', 255);
            $table->string('region', 100);
            // No timestamps — zones are relatively static
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pickup_zones');
    }
};