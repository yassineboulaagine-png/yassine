<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Examen extends Model
{
    use HasFactory;

    protected $fillable = [
        'date_examen',
        'statut',
        'medecin_id',
        'reference',
        'patient_id',
        'utilisateur_id'
    ];

    /**
     * Logic أوتوماتيكي للـ Reference والوقت
     * هاد الكود كيخلي الـ Reference تتصاوب بوحدها فاش كيدير Admin "Enregistrer"
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($examen) {
            // 1. تصاوب Reference أوتوماتيك (مثال: EX-2026-0001)
            $count = Examen::count() + 1;
            $examen->reference = 'EX-' . date('Y') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
            
            // 2. دير تاريخ اليوم أوتوماتيكياً إلا مكنش داخل من الـ Front
            if (!$examen->date_examen) {
                $examen->date_examen = now();
            }
        });
    }

    /**
     * ---------------------------------------------------------
     * العلاقات (ORM Relations)
     * ---------------------------------------------------------
     */

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
        // كنربطوه بـ User Model وكنعطيوه الـ Foreign Key 'utilisateur_id'
        return $this->belongsTo(User::class, 'utilisateur_id');
    }

    public function lignes()
    {
        return $this->hasMany(LigneExamen::class);
    }

    public function facture()
    {
        return $this->hasOne(Facture::class);
    }
    public function resultats()
    {
    // هاد العلاقة كتقول بلي الامتحان واحد يقدر يكون عندو بزاف ديال ملفات النتائج (PDFs)
    return $this->hasMany(Resultat::class);
    }
}