<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str; // ضرورية باش نولدو الكود العشوائي

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
        'biologiste_id'
    ];

    /**
     * Logic أوتوماتيكي للـ Reference والوقت
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($examen) {
            // 1. توليد Reference آمنة وغير قابلة للتوقع
            // التنسيق: EX-2026-0001-A4B2 (الرقم الترتيبي + كود عشوائي من 4 حروف)
            $count = Examen::count() + 1;
            $sequence = str_pad($count, 4, '0', STR_PAD_LEFT);
            $randomSuffix = strtoupper(Str::random(4)); // كود عشوائي باش حد ما يتوقع الكود اللي قبل منه
            
            $examen->reference = 'EX-' . date('Y') . '-' . $sequence . '-' . $randomSuffix;
            
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
        return $this->belongsTo(User::class, 'utilisateur_id');
    }

    public function lignes()
    {
        return $this->hasMany(LigneExamen::class,'examen_id');
    }

    public function facture()
    {
        return $this->hasOne(Facture::class);
    }

    public function resultats()
    {
        return $this->hasManyThrough(Resultat::class, LigneExamen::class, 'examen_id', 'ligne_examen_id');
    }

    public function type_analyse()
{
    // هادي كتربط كل examen بنوع التحليلة ديالو
    return $this->belongsTo(TypeAnalyse::class, 'type_analyse_id'); 
}
}