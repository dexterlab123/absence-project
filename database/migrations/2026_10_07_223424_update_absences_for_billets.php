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
            $table->dropForeign(['billet_by']);
            $table->dropColumn(['billet', 'billet_by', 'billet_at']);
            $table->foreignId('billet_id')->nullable()->constrained('billets')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('absences', function (Blueprint $table) {
            $table->dropForeign(['billet_id']);
            $table->dropColumn('billet_id');
            $table->boolean('billet')->default(false);
            $table->foreignId('billet_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('billet_at')->nullable();
        });
    }
};
