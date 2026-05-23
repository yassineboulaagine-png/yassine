@php
    $pdfLang = ($lang ?? request('lang')) === 'ar' ? 'ar' : 'fr';
    $isArabic = $pdfLang === 'ar';
@endphp
<!DOCTYPE html>
<html lang="{{ $pdfLang }}" dir="{{ $isArabic ? 'rtl' : 'ltr' }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Rapport de Resultats d'Analyses</title>
    <style>
        @page {
            margin: 30px 34px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: "DejaVu Sans", Arial, sans-serif;
            color: #243241;
            background: #ffffff;
            font-size: 12px;
            line-height: 1.45;
        }

        body.rtl {
            direction: rtl;
            text-align: right;
        }

        body.rtl .brand-left {
            float: right;
        }

        body.rtl .logo-placeholder,
        body.rtl .logo-image {
            float: right;
            margin-right: 0;
            margin-left: 14px;
        }

        body.rtl .report-meta {
            float: left;
            text-align: left;
        }

        body.rtl .document-title {
            border-left: 0;
            border-right: 5px solid #19b3a6;
        }

        body.rtl .info-label {
            float: right;
        }

        body.rtl .info-value,
        body.rtl .status-badge {
            float: left;
            text-align: left;
        }

        body.rtl .results-table th,
        body.rtl .results-table td {
            text-align: right;
        }

        .report {
            width: 100%;
        }

        .header {
            padding-bottom: 16px;
            margin-bottom: 18px;
            border-bottom: 2px solid #2c3e50;
        }

        .header:after,
        .brand-left:after,
        .info-columns:after,
        .footer-row:after {
            content: "";
            display: block;
            clear: both;
        }

        .brand-left {
            float: left;
            width: 62%;
        }

        .logo-placeholder {
            width: 58px;
            height: 58px;
            float: left;
            border: 2px solid #2c3e50;
            border-radius: 7px;
            text-align: center;
            line-height: 54px;
            font-size: 13px;
            font-weight: 700;
            color: #2c3e50;
            margin-right: 14px;
        }

        .logo-image {
            width: 58px;
            height: 58px;
            float: left;
            border-radius: 7px;
            margin-right: 14px;
        }

        .lab-name {
            margin: 4px 0 2px;
            font-size: 24px;
            font-weight: 700;
            color: #2c3e50;
            letter-spacing: 0;
        }

        .lab-subtitle {
            margin: 0;
            color: #64748b;
            font-size: 11px;
        }

        .report-meta {
            float: right;
            width: 34%;
            text-align: right;
            color: #64748b;
            font-size: 10px;
        }

        .report-meta strong {
            display: block;
            margin-bottom: 4px;
            color: #2c3e50;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .document-title {
            margin: 18px 0 14px;
            padding: 11px 14px;
            border-left: 5px solid #19b3a6;
            border-radius: 6px;
            background: #f6f8fb;
            color: #2c3e50;
            font-size: 17px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .info-columns {
            width: 100%;
            margin-bottom: 20px;
            clear: both;
        }

        .info-card {
            width: 45%;
            min-height: 156px;
            float: left;
            padding: 14px;
            border: 1px solid #dbe4ee;
            border-radius: 8px;
            background: #ffffff;
        }

        .info-card + .info-card {
            float: right;
        }

        .section-title {
            margin: 0 0 11px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5ebf2;
            color: #2c3e50;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-row {
            margin-bottom: 8px;
        }

        .info-label {
            display: inline-block;
            width: 112px;
            color: #6b7280;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .info-value {
            color: #111827;
            font-size: 11px;
            font-weight: 500;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 9px;
            border-radius: 16px;
            background: #eef2f7;
            color: #2c3e50;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .status-termine,
        .status-valide {
            background: #e8f5ee;
            color: #17633a;
        }

        .status-en-cours,
        .status-en-validation {
            background: #fff7e6;
            color: #8a5a00;
        }

        .status-rejete,
        .status-annule {
            background: #fdecec;
            color: #a62828;
        }

        .results-section {
            margin-top: 6px;
        }

        .results-title {
            margin: 0 0 10px;
            color: #2c3e50;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .results-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 11px;
            margin-bottom: 12px;
        }

        .results-table thead {
            display: table-header-group;
        }

        .results-table th {
            background: #2c3e50;
            color: #ffffff;
            padding: 10px 9px;
            border: 1px solid #2c3e50;
            text-align: left;
            font-weight: 700;
        }

        .results-table td {
            padding: 9px;
            border: 1px solid #dde4ec;
            color: #263445;
            vertical-align: middle;
            word-wrap: break-word;
        }

        .results-table tbody tr {
            background: #f9f9f9;
            page-break-inside: avoid;
        }

        .results-table tbody tr:nth-child(even) {
            background: #ffffff;
        }

        .col-analysis {
            width: 36%;
        }

        .col-result {
            width: 20%;
            text-align: center;
        }

        .col-unit {
            width: 16%;
            text-align: center;
        }

        .col-reference {
            width: 28%;
            text-align: center;
        }

        .result-value {
            font-weight: 700;
            color: #17633a;
        }

        .result-abnormal {
            color: #b42318;
        }

        .pending-value {
            color: #8a5a00;
            font-style: italic;
        }

        .empty-state {
            padding: 22px;
            border: 1px solid #dde4ec;
            border-radius: 6px;
            background: #f9fafb;
            color: #64748b;
            text-align: center;
        }

        .summary-note {
            margin-top: 8px;
            padding: 10px 12px;
            border: 1px solid #dbe4ee;
            border-radius: 6px;
            background: #f8fafc;
            color: #4b5563;
            font-size: 10px;
        }

        .footer {
            margin-top: 26px;
            padding-top: 12px;
            border-top: 1px solid #d8e0ea;
            color: #64748b;
            font-size: 9px;
        }

        .footer-disclaimer {
            float: left;
            width: 76%;
        }

        .page-number {
            float: right;
            width: 20%;
            text-align: right;
            color: #2c3e50;
            font-weight: 700;
        }
    </style>
</head>
<body class="{{ $isArabic ? 'rtl' : '' }}">
    @php
        $arabicLetters = [
            'ء' => ['ﺀ', 'ﺀ', 'ﺀ', 'ﺀ', false],
            'آ' => ['ﺁ', 'ﺂ', 'ﺁ', 'ﺂ', false],
            'أ' => ['ﺃ', 'ﺄ', 'ﺃ', 'ﺄ', false],
            'ؤ' => ['ﺅ', 'ﺆ', 'ﺅ', 'ﺆ', false],
            'إ' => ['ﺇ', 'ﺈ', 'ﺇ', 'ﺈ', false],
            'ئ' => ['ﺉ', 'ﺊ', 'ﺋ', 'ﺌ', true],
            'ا' => ['ﺍ', 'ﺎ', 'ﺍ', 'ﺎ', false],
            'ب' => ['ﺏ', 'ﺐ', 'ﺑ', 'ﺒ', true],
            'ة' => ['ﺓ', 'ﺔ', 'ﺓ', 'ﺔ', false],
            'ت' => ['ﺕ', 'ﺖ', 'ﺗ', 'ﺘ', true],
            'ث' => ['ﺙ', 'ﺚ', 'ﺛ', 'ﺜ', true],
            'ج' => ['ﺝ', 'ﺞ', 'ﺟ', 'ﺠ', true],
            'ح' => ['ﺡ', 'ﺢ', 'ﺣ', 'ﺤ', true],
            'خ' => ['ﺥ', 'ﺦ', 'ﺧ', 'ﺨ', true],
            'د' => ['ﺩ', 'ﺪ', 'ﺩ', 'ﺪ', false],
            'ذ' => ['ﺫ', 'ﺬ', 'ﺫ', 'ﺬ', false],
            'ر' => ['ﺭ', 'ﺮ', 'ﺭ', 'ﺮ', false],
            'ز' => ['ﺯ', 'ﺰ', 'ﺯ', 'ﺰ', false],
            'س' => ['ﺱ', 'ﺲ', 'ﺳ', 'ﺴ', true],
            'ش' => ['ﺵ', 'ﺶ', 'ﺷ', 'ﺸ', true],
            'ص' => ['ﺹ', 'ﺺ', 'ﺻ', 'ﺼ', true],
            'ض' => ['ﺽ', 'ﺾ', 'ﺿ', 'ﻀ', true],
            'ط' => ['ﻁ', 'ﻂ', 'ﻃ', 'ﻄ', true],
            'ظ' => ['ﻅ', 'ﻆ', 'ﻇ', 'ﻈ', true],
            'ع' => ['ﻉ', 'ﻊ', 'ﻋ', 'ﻌ', true],
            'غ' => ['ﻍ', 'ﻎ', 'ﻏ', 'ﻐ', true],
            'ف' => ['ﻑ', 'ﻒ', 'ﻓ', 'ﻔ', true],
            'ق' => ['ﻕ', 'ﻖ', 'ﻗ', 'ﻘ', true],
            'ك' => ['ﻙ', 'ﻚ', 'ﻛ', 'ﻜ', true],
            'ل' => ['ﻝ', 'ﻞ', 'ﻟ', 'ﻠ', true],
            'م' => ['ﻡ', 'ﻢ', 'ﻣ', 'ﻤ', true],
            'ن' => ['ﻥ', 'ﻦ', 'ﻧ', 'ﻨ', true],
            'ه' => ['ﻩ', 'ﻪ', 'ﻫ', 'ﻬ', true],
            'و' => ['ﻭ', 'ﻮ', 'ﻭ', 'ﻮ', false],
            'ى' => ['ﻯ', 'ﻰ', 'ﻯ', 'ﻰ', false],
            'ي' => ['ﻱ', 'ﻲ', 'ﻳ', 'ﻴ', true],
        ];

        $shapeArabic = function ($text) use (&$shapeArabic, $arabicLetters, $isArabic) {
            $text = (string) $text;

            if (!$isArabic || $text === '') {
                return $text;
            }

            $chars = preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY);
            $count = count($chars);
            $out = '';

            for ($i = 0; $i < $count; $i++) {
                $char = $chars[$i];

                if (!isset($arabicLetters[$char])) {
                    $out .= $char;
                    continue;
                }

                $prev = $chars[$i - 1] ?? null;
                $next = $chars[$i + 1] ?? null;
                $prevCanConnect = $prev !== null && isset($arabicLetters[$prev]) && $arabicLetters[$prev][4];
                $nextIsArabic = $next !== null && isset($arabicLetters[$next]);
                $connectPrev = $prevCanConnect;
                $connectNext = $nextIsArabic && $arabicLetters[$char][4];

                if ($connectPrev && $connectNext) {
                    $out .= $arabicLetters[$char][3];
                } elseif ($connectPrev) {
                    $out .= $arabicLetters[$char][1];
                } elseif ($connectNext) {
                    $out .= $arabicLetters[$char][2];
                } else {
                    $out .= $arabicLetters[$char][0];
                }
            }

            return $out;
        };

        $txt = fn ($text) => $shapeArabic($text);

        $tr = [
            'lab_subtitle' => $isArabic ? 'مختبر التحاليل الطبية' : "Laboratoire d'analyses medicales",
            'medical_report' => $isArabic ? 'تقرير طبي' : 'Rapport medical',
            'reference' => $isArabic ? 'المرجع' : 'Reference',
            'generated_at' => $isArabic ? 'تم إنشاؤه في' : 'Genere le',
            'report_title' => $isArabic ? 'تقرير نتائج التحاليل' : "Rapport de resultats d'analyses",
            'patient_info' => $isArabic ? 'معلومات المريض' : 'Informations Patient',
            'exam_info' => $isArabic ? 'معلومات الفحص' : 'Informations Examen',
            'lab_info' => $isArabic ? 'معلومات المختبر' : 'Informations Laboratoire',
            'doctor_info' => $isArabic ? 'معلومات الطبيب' : 'Informations Medecin',
            'full_name' => $isArabic ? 'الاسم الكامل' : 'Nom complet',
            'sex' => $isArabic ? 'الجنس' : 'Sexe',
            'birth' => $isArabic ? 'تاريخ الازدياد' : 'Naissance',
            'phone' => $isArabic ? 'الهاتف' : 'Telephone',
            'exam_date' => $isArabic ? 'تاريخ الفحص' : 'Date examen',
            'analysis' => $isArabic ? 'التحليل' : 'Analyse',
            'status' => $isArabic ? 'الحالة' : 'Statut',
            'name' => $isArabic ? 'الاسم' : 'Nom',
            'director' => $isArabic ? 'المدير' : 'Dir',
            'address' => $isArabic ? 'العنوان' : 'Adresse',
            'results_title' => $isArabic ? 'نتائج التحاليل' : "Resultats d'analyses",
            'designation' => $isArabic ? 'اسم التحليل' : "Designation d'analyse",
            'result' => $isArabic ? 'النتيجة' : 'Resultat',
            'unit' => $isArabic ? 'الوحدة' : 'Unite',
            'reference_values' => $isArabic ? 'القيم المرجعية' : 'Valeurs de reference',
            'pending' => $isArabic ? 'قيد المعالجة' : 'En cours',
            'results_status' => $isArabic ? 'حالة النتائج:' : 'Statut des resultats:',
            'pending_validation' => $isArabic ? 'النتائج قيد التحقق.' : 'resultats en cours de validation.',
            'available' => $isArabic ? 'النتائج مصادق عليها ومتاحة.' : 'resultats valides et disponibles.',
            'empty' => $isArabic ? 'لا توجد نتائج متاحة لهذا الفحص.' : 'Aucun resultat disponible pour cet examen.',
            'footer' => $isArabic
                ? 'تم إنشاء هذا المستند إلكترونيا بواسطة Helix Lab. يجب تفسير النتائج من طرف مهني صحي مع السياق السريري للمريض.'
                : 'Document genere electroniquement par Helix Lab. Les resultats doivent etre interpretes par un professionnel de sante avec le contexte clinique du patient.',
            'page' => $isArabic ? 'صفحة 1/1' : 'Page 1/1',
            'male' => $isArabic ? 'ذكر' : 'Masculin',
            'female' => $isArabic ? 'أنثى' : 'Feminin',
            'na' => $isArabic ? 'غير متوفر' : 'N/A',
        ];

        if ($isArabic) {
            foreach ($tr as $key => $value) {
                $tr[$key] = $txt($value);
            }
        }

        $patientName = trim(($patient->nom ?? '') . ' ' . ($patient->prenom ?? '')) ?: 'N/A';
        $sexValue = $patient->sexe ?? null;
        $sexLabel = $sexValue === 'M' ? $tr['male'] : ($sexValue === 'F' ? $tr['female'] : $tr['na']);
        $examStatus = $examen->statut ?? 'N/A';
        $statusLabels = $isArabic
            ? [
                'en_cours' => 'قيد المعالجة',
                'valide' => 'مصادق عليه',
                'en_validation' => 'قيد التحقق',
                'termine' => 'منتهي',
                'rejete' => 'مرفوض',
                'annule' => 'ملغى',
            ]
            : [
                'en_cours' => 'En cours',
                'valide' => 'Valide',
                'en_validation' => 'En validation',
                'termine' => 'Termine',
                'rejete' => 'Rejete',
                'annule' => 'Annule',
            ];
        if ($isArabic) {
            foreach ($statusLabels as $key => $value) {
                $statusLabels[$key] = $txt($value);
            }
        }
        $statusClass = 'status-' . str_replace('_', '-', $examStatus);
        $statusLabel = $statusLabels[$examStatus] ?? ucfirst(str_replace('_', ' ', $examStatus));
        $translateAnalysis = function ($value) use ($isArabic, $txt) {
            if (!$isArabic) {
                return $value;
            }

            $map = [
                'Biochimie' => 'الكيمياء الحيوية',
                'Hématologie' => 'أمراض الدم',
                'Hematologie' => 'أمراض الدم',
                'Glycémie' => 'سكر الدم',
                'Glycemie' => 'سكر الدم',
                'Hémoglobine' => 'الهيموغلوبين',
                'Hemoglobine' => 'الهيموغلوبين',
                'NFS' => 'تعداد الدم الكامل',
            ];

            return $txt($map[$value] ?? $value);
        };
        $analysisType = $translateAnalysis($examen->type_analyse?->libelle ?? ($isArabic ? 'تحاليل عامة' : 'Analyses generales'));
        $examDate = ($examen->date_examen ?? null)
            ? \Carbon\Carbon::parse($examen->date_examen)->format('d/m/Y H:i')
            : 'N/A';
        $birthDate = ($patient->date_naissance ?? null)
            ? \Carbon\Carbon::parse($patient->date_naissance)->format('d/m/Y')
            : 'N/A';
        $formatDoctor = function ($value) {
            $name = trim((string) ($value ?? ''));

            if ($name === '') {
                return 'N/A';
            }

            $name = trim(preg_replace('/^Dr\.?(?=\s|$)/i', '', $name));

            return 'Dr. ' . $name;
        };
        $labName = $laboratoire->nom ?? 'N/A';
        $labDirector = $formatDoctor($laboratoire->docteur_responsable ?? null);
        $labAddress = $laboratoire->adresse ?? 'N/A';
        $medecinName = trim(($medecin->nom ?? '') . ' ' . ($medecin->prenom ?? ''));
        $medecinFullName = $formatDoctor($medecinName);
        $ligneCollection = $lignes instanceof \Illuminate\Support\Collection ? $lignes : collect($lignes ?? []);
        $generatedAt = now()->format('d/m/Y H:i');
        $logoPath = public_path('images/helix-lab-logo.svg');
        $logoSrc = file_exists($logoPath)
            ? 'data:image/svg+xml;base64,' . base64_encode(file_get_contents($logoPath))
            : null;
    @endphp

    <div class="report">
        <div class="header">
            <div class="brand-left">
                @if($logoSrc)
                    <img class="logo-image" src="{{ $logoSrc }}" alt="Helix Lab">
                @else
                    <div class="logo-placeholder">HL</div>
                @endif
                <div>
                    <h1 class="lab-name">Helix Lab</h1>
                    <p class="lab-subtitle">{{ $tr['lab_subtitle'] }}</p>
                </div>
            </div>
            <div class="report-meta">
                <strong>{{ $tr['medical_report'] }}</strong>
                {{ $tr['reference'] }}: {{ $examen->reference ?? 'N/A' }}<br>
                {{ $tr['generated_at'] }}: {{ $generatedAt }}
            </div>
        </div>

        <div class="document-title">{{ $tr['report_title'] }}</div>

        <div class="info-columns">
            <div class="info-card">
                <h2 class="section-title">{{ $tr['patient_info'] }}</h2>
                <div class="info-row">
                    <span class="info-label">{{ $tr['full_name'] }}</span>
                    <span class="info-value">{{ $patientName }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">CIN</span>
                    <span class="info-value">{{ $patient->cin ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">{{ $tr['sex'] }}</span>
                    <span class="info-value">{{ $sexLabel }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">{{ $tr['birth'] }}</span>
                    <span class="info-value">{{ $birthDate }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">{{ $tr['phone'] }}</span>
                    <span class="info-value">{{ $patient->telephone ?? 'N/A' }}</span>
                </div>
            </div>

            <div class="info-card">
                <h2 class="section-title">{{ $tr['exam_info'] }}</h2>
                <div class="info-row">
                    <span class="info-label">{{ $tr['reference'] }}</span>
                    <span class="info-value">{{ $examen->reference ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">{{ $tr['exam_date'] }}</span>
                    <span class="info-value">{{ $examDate }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">{{ $tr['analysis'] }}</span>
                    <span class="info-value">{{ $analysisType }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">{{ $tr['status'] }}</span>
                    <span class="status-badge {{ $statusClass }}">{{ $statusLabel }}</span>
                </div>
            </div>
        </div>

        <div class="info-columns">
            <div class="info-card">
                <h2 class="section-title">{{ $tr['lab_info'] }}</h2>
                <div class="info-row">
                    <span class="info-label">{{ $tr['name'] }}</span>
                    <span class="info-value">{{ $labName }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">{{ $tr['director'] }}</span>
                    <span class="info-value">{{ $labDirector }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">{{ $tr['address'] }}</span>
                    <span class="info-value">{{ $labAddress }}</span>
                </div>
            </div>

            <div class="info-card">
                <h2 class="section-title">{{ $tr['doctor_info'] }}</h2>
                <div class="info-row">
                    <span class="info-label">{{ $tr['full_name'] }}</span>
                    <span class="info-value">{{ $medecinFullName }}</span>
                </div>
            </div>
        </div>

        <div class="results-section">
            <h2 class="results-title">{{ $tr['results_title'] }}</h2>

            @if($ligneCollection->count() > 0)
                <table class="results-table">
                    <thead>
                        <tr>
                            <th class="col-analysis">{{ $tr['designation'] }}</th>
                            <th class="col-result">{{ $tr['result'] }}</th>
                            <th class="col-unit">{{ $tr['unit'] }}</th>
                            <th class="col-reference">{{ $tr['reference_values'] }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($ligneCollection as $ligne)
                            @php
                                $analyse = $ligne->analyse;
                                $value = $ligne->valeur_resultat;
                                $hasValue = $value !== null && $value !== '';
                                $min = $analyse?->norme_min;
                                $max = $analyse?->norme_max;
                                $isNumeric = $hasValue && is_numeric($value);
                                $isAbnormal = false;

                                if ($isNumeric) {
                                    $numericValue = (float) $value;
                                    $isAbnormal = ($min !== null && $numericValue < (float) $min)
                                        || ($max !== null && $numericValue > (float) $max);
                                }

                                if ($min !== null && $max !== null) {
                                    $referenceRange = $min . ' - ' . $max;
                                } elseif ($min !== null) {
                                    $referenceRange = '>= ' . $min;
                                } elseif ($max !== null) {
                                    $referenceRange = '<= ' . $max;
                                } else {
                                    $referenceRange = '-';
                                }
                            @endphp
                            <tr>
                                <td class="col-analysis">{{ $translateAnalysis($analyse?->designation ?? 'N/A') }}</td>
                                <td class="col-result">
                                    @if($hasValue)
                                        <span class="result-value {{ $isAbnormal ? 'result-abnormal' : '' }}">
                                            {{ $isNumeric ? number_format((float) $value, 2, ',', ' ') : $value }}
                                        </span>
                                    @else
                                        <span class="pending-value">{{ $tr['pending'] }}</span>
                                    @endif
                                </td>
                                <td class="col-unit">{{ $analyse?->unite_mesure ?? '-' }}</td>
                                <td class="col-reference">{{ $referenceRange }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

                <div class="summary-note">
                    {{ $tr['results_status'] }}
                    @if($examen->statut === 'en_cours' || $examen->statut === 'en_validation')
                        {{ $tr['pending_validation'] }}
                    @elseif($examen->statut === 'termine' || $examen->statut === 'valide')
                        {{ $tr['available'] }}
                    @else
                        {{ $tr['status'] }} {{ $statusLabel }}.
                    @endif
                </div>
            @else
                <div class="empty-state">{{ $tr['empty'] }}</div>
            @endif
        </div>

        <div class="footer">
            <div class="footer-row">
                <div class="footer-disclaimer">
                    {{ $tr['footer'] }}
                </div>
                <div class="page-number">{{ $tr['page'] }}</div>
            </div>
        </div>
    </div>
</body>
</html>
