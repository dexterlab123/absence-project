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
        Schema::table('absences', function (Blueprint $table) {
            $table->string('category')->default('Absence');
            $table->boolean('billet')->default(false);
            $table->foreignId('billet_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('billet_at')->nullable();
            $table->dropColumn('justified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('absences', function (Blueprint $table) {
            $table->boolean('justified')->default(false);
            $table->dropForeign(['billet_by']);
            $table->dropColumn(['category', 'billet', 'billet_by', 'billet_at']);
        });
    }
};
