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

    /**
     * Relation: Natija kat-ntami l-LigneExamen wehda
     */
    public function ligne()
    {
        return $this->belongsTo(LigneExamen::class, 'ligne_examen_id');
    }
}