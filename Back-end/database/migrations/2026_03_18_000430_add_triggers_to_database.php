<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Trigger mlli i-t-zad Patient jdid (INSERT)
        DB::unprepared('
            CREATE TRIGGER after_patient_insert
            AFTER INSERT ON patients
            FOR EACH ROW
            BEGIN
                INSERT INTO historiques (action, table_name, row_id, description, utilisateur, created_at, updated_at)
                VALUES (
                    "INSERT", 
                    "patients", 
                    NEW.id, 
                    -- Hna sta3melna CONCAT hit 3ndek nom o prenom mferrqin
                    CONCAT("Nouveau patient ajouté: ", NEW.nom, " ", NEW.prenom), 
                    "System/Admin", 
                    NOW(), 
                    NOW()
                );
            END
        ');

        // 2. Trigger mlli i-t-beddel Prix dyal t-7lila (UPDATE)
        DB::unprepared('
            CREATE TRIGGER after_analyse_update
            AFTER UPDATE ON analyses
            FOR EACH ROW
            BEGIN
                IF OLD.prix_unitaire <> NEW.prix_unitaire THEN
                    INSERT INTO historiques (action, table_name, row_id, description, utilisateur, created_at, updated_at)
                    VALUES (
                        "UPDATE", 
                        "analyses", 
                        OLD.id, 
                        CONCAT("Prix modifié de ", OLD.prix_unitaire, " DH à ", NEW.prix_unitaire, " DH"), 
                        "System/Admin", 
                        NOW(), 
                        NOW()
                    );
                END IF;
            END
        ');
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS after_patient_insert');
        DB::unprepared('DROP TRIGGER IF EXISTS after_analyse_update');
    }
};