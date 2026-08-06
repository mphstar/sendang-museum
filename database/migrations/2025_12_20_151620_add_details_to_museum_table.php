<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('museum', function (Blueprint $table) {
            $table->text('address')->nullable();
            $table->string('opening_hours')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('distance_from_city_center')->nullable();
            $table->string('ticket_price')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('museum', function (Blueprint $table) {
            $table->dropColumn(['address', 'opening_hours', 'contact_person', 'distance_from_city_center', 'ticket_price']);
        });
    }
};
