<!DOCTYPE html>
<html lang="fr">
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
        }

        .info-card {
            width: 48%;
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
<body>
    @php
        $patientName = trim(($patient->nom ?? '') . ' ' . ($patient->prenom ?? '')) ?: 'N/A';
        $sexValue = $patient->sexe ?? null;
        $sexLabel = $sexValue === 'M' ? 'Masculin' : ($sexValue === 'F' ? 'Feminin' : 'N/A');
        $examStatus = $examen->statut ?? 'N/A';
        $statusLabels = [
            'en_cours' => 'En cours',
            'valide' => 'Valide',
            'en_validation' => 'En validation',
            'termine' => 'Termine',
            'rejete' => 'Rejete',
            'annule' => 'Annule',
        ];
        $statusClass = 'status-' . str_replace('_', '-', $examStatus);
        $statusLabel = $statusLabels[$examStatus] ?? ucfirst(str_replace('_', ' ', $examStatus));
        $analysisType = $examen->type_analyse?->libelle ?? 'Analyses generales';
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
                    <p class="lab-subtitle">Laboratoire d'analyses medicales</p>
                </div>
            </div>
            <div class="report-meta">
                <strong>Rapport medical</strong>
                Reference: {{ $examen->reference ?? 'N/A' }}<br>
                Genere le: {{ $generatedAt }}
            </div>
        </div>

        <div class="document-title">Rapport de resultats d'analyses</div>

        <div class="info-columns">
            <div class="info-card">
                <h2 class="section-title">Informations Patient</h2>
                <div class="info-row">
                    <span class="info-label">Nom complet</span>
                    <span class="info-value">{{ $patientName }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">CIN</span>
                    <span class="info-value">{{ $patient->cin ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Sexe</span>
                    <span class="info-value">{{ $sexLabel }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Naissance</span>
                    <span class="info-value">{{ $birthDate }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Telephone</span>
                    <span class="info-value">{{ $patient->telephone ?? 'N/A' }}</span>
                </div>
            </div>

            <div class="info-card">
                <h2 class="section-title">Informations Examen</h2>
                <div class="info-row">
                    <span class="info-label">Reference</span>
                    <span class="info-value">{{ $examen->reference ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date examen</span>
                    <span class="info-value">{{ $examDate }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Analyse</span>
                    <span class="info-value">{{ $analysisType }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Statut</span>
                    <span class="status-badge {{ $statusClass }}">{{ $statusLabel }}</span>
                </div>
            </div>
        </div>

        <div class="info-columns">
            <div class="info-card">
                <h2 class="section-title">Informations Laboratoire</h2>
                <div class="info-row">
                    <span class="info-label">Nom</span>
                    <span class="info-value">{{ $labName }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Dir</span>
                    <span class="info-value">{{ $labDirector }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Adresse</span>
                    <span class="info-value">{{ $labAddress }}</span>
                </div>
            </div>

            <div class="info-card">
                <h2 class="section-title">Informations Medecin</h2>
                <div class="info-row">
                    <span class="info-label">Nom complet</span>
                    <span class="info-value">{{ $medecinFullName }}</span>
                </div>
            </div>
        </div>

        <div class="results-section">
            <h2 class="results-title">Resultats d'analyses</h2>

            @if($ligneCollection->count() > 0)
                <table class="results-table">
                    <thead>
                        <tr>
                            <th class="col-analysis">Designation d'analyse</th>
                            <th class="col-result">Resultat</th>
                            <th class="col-unit">Unite</th>
                            <th class="col-reference">Valeurs de reference</th>
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
                                <td class="col-analysis">{{ $analyse?->designation ?? 'N/A' }}</td>
                                <td class="col-result">
                                    @if($hasValue)
                                        <span class="result-value {{ $isAbnormal ? 'result-abnormal' : '' }}">
                                            {{ $isNumeric ? number_format((float) $value, 2, ',', ' ') : $value }}
                                        </span>
                                    @else
                                        <span class="pending-value">En cours</span>
                                    @endif
                                </td>
                                <td class="col-unit">{{ $analyse?->unite_mesure ?? '-' }}</td>
                                <td class="col-reference">{{ $referenceRange }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

                <div class="summary-note">
                    Statut des resultats:
                    @if($examen->statut === 'en_cours' || $examen->statut === 'en_validation')
                        resultats en cours de validation.
                    @elseif($examen->statut === 'termine' || $examen->statut === 'valide')
                        resultats valides et disponibles.
                    @else
                        examen {{ $statusLabel }}.
                    @endif
                </div>
            @else
                <div class="empty-state">Aucun resultat disponible pour cet examen.</div>
            @endif
        </div>

        <div class="footer">
            <div class="footer-row">
                <div class="footer-disclaimer">
                    Document genere electroniquement par Helix Lab. Les resultats doivent etre
                    interpretes par un professionnel de sante avec le contexte clinique du patient.
                </div>
                <div class="page-number">Page 1/1</div>
            </div>
        </div>
    </div>
</body>
</html>
