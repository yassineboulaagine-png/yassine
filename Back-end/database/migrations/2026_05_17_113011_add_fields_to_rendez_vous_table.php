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
        Schema::table('rendez_vous', function (Blueprint $table) {
            // $table->enum('sexe', ['M', 'F'])->nullable()->after('prenom');
            $table->date('date_naissance')->nullable()->after('sexe');
            $table->string('cin')->unique()->nullable()->after('date_naissance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rendez_vous', function (Blueprint $table) {
            $table->dropColumn(['sexe', 'date_naissance', 'cin']);
        });
    }
};
