<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Resultat extends Model
{
    use HasFactory;

    protected $fillable = [
        'conclusion',
        'date_validation',
        'ligne_examen_id'
    ];

    protected $casts = [
        'date_validation' => 'datetime',
    ];

    /**
     * Relation: Natija kat-ntami l-LigneExamen wehda
     */
    public function ligneExamen()
    {
        return $this->belongsTo(LigneExamen::class, 'ligne_examen_id');
    }

    public function ligne()
    {
        return $this->ligneExamen();
    }
}
