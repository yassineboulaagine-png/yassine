<!DOCTYPE html>
<html lang="fr">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de Résultats d'Analyses</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f9fafb;
            color: #1f2937;
            line-height: 1.6;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Header Section */
        .header {
            text-align: center;
            border-bottom: 3px solid #334155;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 28px;
            color: #334155;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .header p {
            font-size: 12px;
            color: #666;
            margin-bottom: 3px;
        }

        .header .subtitle {
            font-size: 14px;
            color: #475569;
            font-style: italic;
            margin-top: 5px;
        }

        /* Patient Information Section */
        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #334155;
            background-color: #f1f5f9;
            padding: 8px 12px;
            margin-top: 20px;
            margin-bottom: 12px;
            border-left: 4px solid #334155;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }

        .info-row {
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 10px;
            font-size: 12px;
            margin-bottom: 8px;
        }

        .info-label {
            font-weight: 600;
            color: #334155;
            text-align: left;
        }

        .info-value {
            color: #475569;
            word-break: break-word;
        }

        /* Results Table */
        .results-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 11px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .results-table thead {
            background-color: #334155;
            color: white;
        }

        .results-table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #334155;
        }

        .results-table td {
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
        }

        .results-table tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }

        .results-table tbody tr:hover {
            background-color: #f1f5f9;
        }

        .designation-col {
            font-weight: 500;
            color: #1f2937;
            min-width: 200px;
        }

        .resultat-col {
            text-align: center;
            font-weight: 600;
        }

        .unite-col {
            text-align: center;
            color: #64748b;
            font-size: 10px;
        }

        .reference-col {
            text-align: center;
            color: #64748b;
            font-size: 10px;
        }

        .normal {
            color: #059669;
            background-color: #ecfdf5;
        }

        .abnormal {
            color: #dc2626;
            background-color: #fef2f2;
            font-weight: 600;
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #94a3b8;
            font-size: 12px;
        }

        /* Footer Section */
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            gap: 15px;
            font-size: 10px;
            color: #64748b;
        }

        .footer-content {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
        }

        .footer-section {
            text-align: center;
        }

        .footer-section strong {
            display: block;
            color: #334155;
            margin-bottom: 3px;
            font-size: 11px;
        }

        .footer-section p {
            margin: 2px 0;
            line-height: 1.4;
        }

        .disclaimer {
            text-align: center;
            padding: 10px;
            background-color: #f1f5f9;
            border-radius: 4px;
            font-style: italic;
            color: #475569;
            border: 1px dashed #cbd5e1;
            font-size: 9px;
        }

        .generation-info {
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
            margin-top: 10px;
        }

        /* Print Styles */
        @media print {
            body {
                background: white;
            }
            .container {
                padding: 0;
                min-height: auto;
            }
            .results-table {
                page-break-inside: avoid;
            }
            .section {
                page-break-inside: avoid;
            }
        }

        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-termine {
            background-color: #dcfce7;
            color: #166534;
        }

        .status-en-cours {
            background-color: #fef3c7;
            color: #92400e;
        }

        .status-rejete {
            background-color: #fee2e2;
            color: #991b1b;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Laboratoire d'Analyses Médicales</h1>
            <p>Rapport de Résultats d'Analyses Biologiques</p>
            <p class="subtitle">Rapport Professionnel - Document Officiel</p>
        </div>

        <!-- Patient Information -->
        <div class="section">
            <div class="section-title">Informations du Patient</div>
            <div class="info-grid">
                <div>
                    <div class="info-row">
                        <span class="info-label">Nom Complet:</span>
                        <span class="info-value">{{ $patient->nom }} {{ $patient->prenom }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">CIN:</span>
                        <span class="info-value">{{ $patient->cin ?? 'N/A' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Sexe:</span>
                        <span class="info-value">{{ $patient->sexe === 'M' ? 'Masculin' : 'Féminin' }}</span>
                    </div>
                </div>
                <div>
                    <div class="info-row">
                        <span class="info-label">Téléphone:</span>
                        <span class="info-value">{{ $patient->telephone ?? 'N/A' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Date de Naissance:</span>
                        <span class="info-value">{{ $patient->date_naissance ? \Carbon\Carbon::parse($patient->date_naissance)->format('d/m/Y') : 'N/A' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Examination Information -->
        <div class="section">
            <div class="section-title">Informations de l'Examen</div>
            <div class="info-grid">
                <div>
                    <div class="info-row">
                        <span class="info-label">Référence:</span>
                        <span class="info-value"><strong>{{ $examen->reference }}</strong></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Date d'Examen:</span>
                        <span class="info-value">{{ $examen->date_examen ? \Carbon\Carbon::parse($examen->date_examen)->format('d/m/Y à H:i') : 'N/A' }}</span>
                    </div>
                </div>
                <div>
                    <div class="info-row">
                        <span class="info-label">Statut:</span>
                        <span class="info-value">
                            <span class="status-badge status-{{ str_replace('_', '-', $examen->statut) }}">
                                {{ ucfirst(str_replace('_', ' ', $examen->statut)) }}
                            </span>
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Type d'Analyse:</span>
                        <span class="info-value">{{ $examen->type_analyse?->libelle ?? 'Analyses Générales' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Results Table -->
        <div class="section">
            <div class="section-title">Résultats d'Analyses</div>
            @if($lignes && count($lignes) > 0)
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Désignation d'Analyse</th>
                            <th class="resultat-col">Résultat</th>
                            <th class="unite-col">Unité</th>
                            <th class="reference-col">Valeurs de Référence</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($lignes as $ligne)
                            <tr>
                                <td class="designation-col">
                                    {{ $ligne->analyse?->designation ?? 'N/A' }}
                                </td>
                                <td class="resultat-col 
                                    @if($ligne->valeur_resultat !== null)
                                        @if($ligne->valeur_resultat > $ligne->analyse?->norme_max || $ligne->valeur_resultat < $ligne->analyse?->norme_min)
                                            abnormal
                                        @else
                                            normal
                                        @endif
                                    @endif
                                ">
                                    @if($ligne->valeur_resultat !== null)
                                        {{ number_format($ligne->valeur_resultat, 2, ',', ' ') }}
                                    @else
                                        <em>en_cours</em>
                                    @endif
                                </td>
                                <td class="unite-col">
                                    {{ $ligne->analyse?->unite_mesure ?? '-' }}
                                </td>
                                <td class="reference-col">
                                    @if($ligne->analyse)
                                        {{ $ligne->analyse->norme_min ?? '-' }} - {{ $ligne->analyse->norme_max ?? '-' }}
                                    @else
                                        -
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
                <div style="margin-top: 12px; font-size: 10px; color: #64748b;">
                    <strong>Statut des résultats:</strong> 
                    @if($examen->statut === 'en_cours' || $examen->statut === 'en_validation')
                        Résultats en cours de saisie
                    @elseif($examen->statut === 'termine')
                        Résultats validés et finalisés
                    @else
                        Examen {{ ucfirst(str_replace('_', ' ', $examen->statut)) }}
                    @endif
                </div>
            @else
                <div class="empty-state">
                    Aucun résultat disponible pour cet examen.
                </div>
            @endif
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <strong>ADRESSE</strong>
                    <p>Laboratoire Central</p>
                    <p>Casablanca, Maroc</p>
                </div>
                <div class="footer-section">
                    <strong>CONTACT</strong>
                    <p>Tél: +212 5 22 XX XX XX</p>
                    <p>Email: contact@lab.ma</p>
                </div>
                <div class="footer-section">
                    <strong>HEURES</strong>
                    <p>Lun-Ven: 08:00 - 17:00</p>
                    <p>Sam: 08:00 - 13:00</p>
                </div>
            </div>

            <div class="disclaimer">
                Document généré électroniquement - Valide sans signature officielle.<br>
                Les résultats marqués en rouge indiquent des valeurs en dehors de la plage normale.
            </div>

            <div class="generation-info">
                Généré le: {{ now()->format('d/m/Y à H:i:s') }} | Page 1/1
            </div>
        </div>
    </div>
</body>
</html>
