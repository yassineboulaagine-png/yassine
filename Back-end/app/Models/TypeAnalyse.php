<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeAnalyse extends Model
{
    // Darouriya hit l-migration smitha "type_analyses"
    protected $table = 'type_analyses';

    protected $fillable = ['libelle'];

    /**
     * Relation: Type wahed (matalan Biochimie) fih bzaf d l-analyses
     */
    public function analyses()
    {
        return $this->hasMany(Analyse::class, 'type_analyse_id');
    }
}