<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LigneExamen extends Model
{
    use HasFactory;

    // Darouriya hit l-migration fiha "s" (ligne_examens)
    protected $table = 'ligne_examens';

    /**
     * L-columns li derti f l-migration (valeur, commentaire, ids...)
     */
    protected $fillable = [
        'valeur_resultat',
        'commentaire',
        'examen_id',
        'analyse_id'
    ];

    /**
     * ---------------------------------------------------------
     * Les Relations (ORM)
     * ---------------------------------------------------------
     */

    // Ay ligne kat-ntami l-Examen (Dossier) wahed
    public function examen()
    {
        return $this->belongsTo(Examen::class);
    }

    // Ay ligne kat-mettel Analyse (T7lila) wehda mn l-catalogue
    public function analyse()
    {
        return $this->belongsTo(Analyse::class);
    }

    // Wast app/Models/LigneExamen.php
    public function resultats()
    {
    // HasOne hit ay t7lila (Ligne) 3ndha natija (Conclusion) wehda
    return $this->hasOne(Resultat::class, 'ligne_examen_id');
    }
}