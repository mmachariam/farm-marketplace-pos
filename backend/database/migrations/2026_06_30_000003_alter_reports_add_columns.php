<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->id('report_id')->first();
            $table->unsignedBigInteger('admin_id')->after('report_id');
            $table->string('report_type', 100)->after('admin_id');
            $table->json('parameters')->nullable()->after('report_type');
            $table->timestamp('generated_date')->useCurrent()->after('parameters');

            $table->foreign('admin_id')->references('user_id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
            $table->dropColumn(['report_id', 'admin_id', 'report_type', 'parameters', 'generated_date']);
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->id()->first();
        });
    }
};
