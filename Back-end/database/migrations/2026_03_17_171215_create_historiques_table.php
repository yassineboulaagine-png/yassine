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
        Schema::create('historiques', function (Blueprint $table) {
            $table->id();
            $table->string('action'); // Exemple: 'INSERT', 'UPDATE', 'DELETE'
            $table->string('table_name'); // Smiyet l-table li t-moudifiat
            $table->unsignedBigInteger('row_id'); // L-ID dyal l-ligne li t-moudifia
            $table->text('description'); // Chno tra b-dabt
            $table->string('utilisateur')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historiques');
    }
};
