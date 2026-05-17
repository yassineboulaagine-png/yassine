<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Examen extends Model
{
    use HasFactory;

    protected $fillable = [
        'date_examen',
        'statut',
        'medecin_id',
        'reference',
        'patient_id',
        'utilisateur_id',
        'biologiste_id',
        'type_analyse_id',
        'valeur'
    ];
    protected $connection = 'mysql';

    protected static function boot()
    {
        parent::boot();

    // 🎯 هادي لي غاتقاد ليك الـ reference والـ date وتـهـنّـيـك مـن هاد الـ Error بمرة
    static::creating(function ($examen) {
        if (empty($examen->reference)) {
            $count    = self::on('mysql')->count() + 1;
            $sequence = str_pad($count, 4, '0', STR_PAD_LEFT);
            $suffix   = strtoupper(\Illuminate\Support\Str::random(4));

            $examen->reference = 'EX-' . date('Y') . '-' . $sequence . '-' . $suffix;
        }
        
        // 🚨 هادي هي لي كتحل المشكل د Field 'date_examen' doesn't have a default value
        if (!$examen->date_examen) {
            $examen->date_examen = now();
        }
    });
     }

    /**
     * Génération automatique de la référence et de la date
     * FIX: reference générée ICI seulement — le Controller ne doit pas en générer une autre
     */
    

    // ─────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecin()
    {
        return $this->belongsTo(Medecin::class);
    }

    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }

    public function biologiste()
    {
        return $this->belongsTo(User::class, 'biologiste_id');
    }

    public function lignes()
    {
        return $this->hasMany(LigneExamen::class, 'examen_id');
    }

    public function facture()
    {
        return $this->hasOne(Facture::class);
    }

    public function resultats()
    {
        return $this->hasManyThrough(
            Resultat::class,
            LigneExamen::class,
            'examen_id',
            'ligne_examen_id'
        );
    }

    public function type_analyse()
    {
        return $this->belongsTo(TypeAnalyse::class, 'type_analyse_id');
    }
}