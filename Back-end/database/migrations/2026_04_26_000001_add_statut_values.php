<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the old enum and create new one with all statuses
        DB::statement("ALTER TABLE examens MODIFY statut ENUM('en_cours', 'valide', 'annule', 'en_validation', 'termine') DEFAULT 'en_cours'");
    }

    public function down(): void
    {
        // Revert to original
        DB::statement("ALTER TABLE examens MODIFY statut ENUM('en_cours', 'valide', 'annule') DEFAULT 'en_cours'");
    }
};