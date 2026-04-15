<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
// خلي غير هادو اللي غانحتاجو فعلاً
use App\Models\Laboratoire;
use App\Models\Patient;
use App\Models\Medecin;
use App\Models\TypeAnalyse;
use App\Models\Analyse;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. كريينا المختبر (بلا ما نحطوه فـ متغير حيت ما غانحتاجوهش دابا)
        Laboratoire::create([
            'nom' => 'Laboratoire Atlas Bio',
            'logo' => null,
            'docteur_responsable' => 'Dr. Yassine',
            'adresse' => 'Boulevard Zerktouni, Casablanca',
            'ice_if_rc' => '123456789012345',
        ]);

        // 2. كنعيطو لـ UserSeeder اللي فيه الـ Admin والموظفين
        $this->call([
            UserSeeder::class,
        ]);

        // 3. الأنواع ديال التحاليل
        $typeBio = TypeAnalyse::create(['libelle' => 'Biochimie']);
        $typeHema = TypeAnalyse::create(['libelle' => 'Hématologie']);

        // 4. الـ Factories (هادو هما اللي كيخليو الـ Dashboard يبان ناضي وعامر داتا)
        Patient::factory(30)->create();
        Medecin::factory(10)->create();

        // 5. الكاطالوغ ديال التحاليل
        Analyse::factory(8)->create(['type_analyse_id' => $typeBio->id]);
        Analyse::factory(7)->create(['type_analyse_id' => $typeHema->id]);

        $this->command->info('Mabrouk! Database 3amra o nqiya daba.');
    }
}