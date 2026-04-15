<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Facture extends Model
{
    use HasFactory;

    /**
     * L-columns li derti f l-migration (montants, tva, statut...)
     */
    protected $fillable = [
        'montant_ht',
        'tva',
        'montant_ttc',
        'statut_paiement',
        'examen_id'
    ];

    /**
     * ---------------------------------------------------------
     * Les Relations (ORM)
     * ---------------------------------------------------------
     */

    // Ay fatora m-rtbta b Examen wahed bo7do (One-to-One)
    public function examen()
    {
        return $this->belongsTo(Examen::class);
    }
}