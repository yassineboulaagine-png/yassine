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
        Schema::create('examens', function (Blueprint $table) {
            $table->id();
            $table->dateTime('date_examen');
            $table->enum('statut', ['en_cours', 'valide', 'annule'])->default('en_cours');
            $table->string('reference')->unique(); // EX-2026-0001
            
            // الربط مع الطبيب والمريض
            $table->foreignId('medecin_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            
            // الربط مع جدول utilisateurs (ضروري نحددو السمية هنا)
            $table->foreignId('utilisateur_id')->constrained('utilisateurs')->onDelete('cascade');
            $table->foreignId('type_analyse_id')->nullable()->constrained('type_analyses')->onDelete('set null');
            $table->foreignId('biologiste_id')->nullable()->constrained('utilisateurs');
            $table->string('valeur')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('examens');
    }
};