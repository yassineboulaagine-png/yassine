import { X, User, Beaker, Gauge, Activity, ChevronRight } from "lucide-react";

const ResultDetailsModal = ({ isOpen, onClose, ana }) => {
  if (!isOpen || !ana) return null;

  const ligne = ana.lignes?.[0];
  if (!ligne) return null;

  const analyse = ligne.analyse;
  const valeur = parseFloat(ligne.valeur_resultat) || 0;
  const min = parseFloat(analyse?.norme_min) || 0;
  const max = parseFloat(analyse?.norme_max) || 100;
  const unite = analyse?.unite_mesure || "";

  // Determine zone: Yellow (low), Green (normal), Red (high)
  let zone = "GREEN"; // Normal
  let zoneColor = "#22c55e";
  if (valeur < min) {
    zone = "LOW";
    zoneColor = "#eab308";
  } else if (valeur > max) {
    zone = "HIGH";
    zoneColor = "#ef4444";
  }

  // Calculate pointer position (0-100%)
  const range = max - min;
  const pointerPercent = Math.max(0, Math.min(100, ((valeur - min) / range) * 100));

  // Gauge SVG rendering - Enhanced with better styling
  const renderGauge = () => {
    const cx = 160;
    const cy = 160;
    const radius = 130;

    // SVG arc path for each zone
    const yellowArc = {
      start: 180,
      end: 150,
      color: "#f59e0b",
      label: "Bas",
    };
    const greenArc = {
      start: 150,
      end: 30,
      color: "#10b981",
      label: "Normal",
    };
    const redArc = {
      start: 30,
      end: 0,
      color: "#ef4444",
      label: "Élevé",
    };

    const arcToPath = (startAngle, endAngle, radius, cx, cy) => {
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);
      const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 0 ${x2} ${y2}`;
    };

    // Pointer position
    const pointerAngle = 180 - (pointerPercent / 100) * 180;
    const pointerRad = (pointerAngle * Math.PI) / 180;
    const pointerX = cx + (radius - 35) * Math.cos(pointerRad);
    const pointerY = cy + (radius - 35) * Math.sin(pointerRad);

    return (
      <svg
        width="100%"
        height="350"
        viewBox="0 0 320 320"
        className="drop-shadow-lg"
        style={{ maxWidth: "380px", margin: "0 auto" }}
      >
        <defs>
          <filter id="gaugeGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background arc with shadow effect */}
        <path
          d={arcToPath(180, 0, radius + 5, cx, cy)}
          stroke="#f0f0f0"
          strokeWidth="30"
          fill="none"
          strokeLinecap="round"
          filter="url(#gaugeGlow)"
        />

        {/* Gauge arcs - Enhanced */}
        <path
          d={arcToPath(yellowArc.start, yellowArc.end, radius, cx, cy)}
          stroke={yellowArc.color}
          strokeWidth="28"
          fill="none"
          strokeLinecap="round"
          filter="url(#gaugeGlow)"
        />
        <path
          d={arcToPath(greenArc.start, greenArc.end, radius, cx, cy)}
          stroke={greenArc.color}
          strokeWidth="28"
          fill="none"
          strokeLinecap="round"
          filter="url(#gaugeGlow)"
        />
        <path
          d={arcToPath(redArc.start, redArc.end, radius, cx, cy)}
          stroke={redArc.color}
          strokeWidth="28"
          fill="none"
          strokeLinecap="round"
          filter="url(#gaugeGlow)"
        />

        {/* Scale markers - Enhanced */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const angle = 180 - (percent / 100) * 180;
          const rad = (angle * Math.PI) / 180;
          const x1 = cx + (radius + 18) * Math.cos(rad);
          const y1 = cy + (radius + 18) * Math.sin(rad);
          const x2 = cx + (radius + 32) * Math.cos(rad);
          const y2 = cy + (radius + 32) * Math.sin(rad);
          const labelX = cx + (radius + 50) * Math.cos(rad);
          const labelY = cy + (radius + 50) * Math.sin(rad);

          return (
            <g key={percent}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dy="0.3em"
                fontSize="12"
                fontWeight="600"
                fill="#475569"
              >
                {percent}%
              </text>
            </g>
          );
        })}

        {/* Pointer needle - Enhanced */}
        <g filter="url(#gaugeGlow)">
          {/* Needle line */}
          <line
            x1={cx}
            y1={cy}
            x2={pointerX}
            y2={pointerY}
            stroke={zoneColor}
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.9"
          />
          {/* Center circle with gradient */}
          <circle cx={cx} cy={cy} r="10" fill={zoneColor} opacity="0.9" />
          <circle cx={cx} cy={cy} r="6" fill="white" />
        </g>

        {/* Center value display - Enhanced */}
        <g>
          <circle cx={cx} cy={cy + 40} r="45" fill="white" opacity="0.95" stroke={zoneColor} strokeWidth="2" />
          <text
            x={cx}
            y={cy + 35}
            textAnchor="middle"
            fontSize="32"
            fontWeight="900"
            fill={zoneColor}
          >
            {valeur}
          </text>
          <text
            x={cx}
            y={cy + 55}
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill="#64748b"
          >
            {unite}
          </text>
        </g>
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-white/20" style={{ boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)" }}>
        
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 flex justify-between items-center rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/20">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Détails du Résultat
              </h3>
              <p className="text-slate-300 text-sm mt-1">Analyse complète et visualisation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/20 transition-all duration-300 transform hover:scale-110 group"
          >
            <X size={24} className="text-white group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Reference Badge Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-4 border-b border-blue-100/50 flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Référence :</span>
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
            {ana.reference}
          </span>
        </div>

        {/* Two-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          
          {/* LEFT COLUMN - Information */}
          <div className="space-y-6">
            
            {/* Patient Info Card */}
            <div className="group bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/40 hover:border-blue-200/60 transition-all duration-300 shadow-md hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all">
                  <User size={20} className="text-white" />
                </div>
                <h4 className="font-semibold text-slate-700">Patient</h4>
              </div>
              <p className="text-2xl font-bold text-slate-900 ml-12">
                {ana.patient?.nom} {ana.patient?.prenom}
              </p>
            </div>

            {/* Analysis Info Card */}
            <div className="group bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/40 hover:border-purple-200/60 transition-all duration-300 shadow-md hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all">
                  <Beaker size={20} className="text-white" />
                </div>
                <h4 className="font-semibold text-slate-700">Analyse</h4>
              </div>
              <p className="text-xl font-bold text-slate-900 ml-12">
                {analyse?.designation}
              </p>
            </div>

            {/* Norms Info Card */}
            <div className="group bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/40 hover:border-emerald-200/60 transition-all duration-300 shadow-md hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all">
                  <Gauge size={20} className="text-white" />
                </div>
                <h4 className="font-semibold text-slate-700">Valeurs Normales</h4>
              </div>
              <p className="text-lg font-bold text-emerald-600 ml-12">
                {min} - {max} <span className="text-slate-600">{unite}</span>
              </p>
            </div>

            {/* Status Badge */}
            <div
              className={`group rounded-2xl p-6 border-2 transition-all duration-300 shadow-md ${
                zone === "GREEN"
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300/60 hover:border-emerald-400"
                  : zone === "LOW"
                  ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300/60 hover:border-amber-400"
                  : "bg-gradient-to-br from-red-50 to-rose-50 border-red-300/60 hover:border-red-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Statut du Résultat</p>
                  <p
                    className={`text-lg font-bold flex items-center gap-2 ${
                      zone === "GREEN"
                        ? "text-emerald-700"
                        : zone === "LOW"
                        ? "text-amber-700"
                        : "text-red-700"
                    }`}
                  >
                    {zone === "GREEN"
                      ? "✓ Normal"
                      : zone === "LOW"
                      ? "⚠ Bas"
                      : "✗ Élevé"}
                  </p>
                </div>
                <div className={`rounded-full p-3 ${
                  zone === "GREEN"
                    ? "bg-emerald-200/40"
                    : zone === "LOW"
                    ? "bg-amber-200/40"
                    : "bg-red-200/40"
                }`}>
                  <ChevronRight size={20} className={
                    zone === "GREEN"
                      ? "text-emerald-600"
                      : zone === "LOW"
                      ? "text-amber-600"
                      : "text-red-600"
                  } />
                </div>
              </div>
            </div>

            {/* Current Result Value */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90 mb-2">Valeur Mesurée</p>
              <p className="text-4xl font-bold">
                {valeur} <span className="text-2xl opacity-80">{unite}</span>
              </p>
            </div>

            {/* Medical Comment */}
            {ligne.commentaire && (
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-md">
                <p className="text-sm font-semibold text-slate-700 mb-3">Commentaire Médical</p>
                <p className="text-slate-800 leading-relaxed italic">
                  "{ligne.commentaire}"
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Gauge Visualization */}
          <div className="flex flex-col justify-center items-center">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-xl w-full">
              <p className="text-center text-sm font-semibold text-slate-600 mb-6 uppercase tracking-widest">
                Visualisation
              </p>
              {renderGauge()}
            </div>

            {/* Zone Reference Legend */}
            <div className="grid grid-cols-3 gap-3 w-full mt-6">
              {/* Low Zone */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200/50 text-center">
                <div className="w-3 h-3 bg-amber-400 rounded-full mx-auto mb-2"></div>
                <p className="text-xs font-bold text-amber-700">Bas</p>
                <p className="text-xs text-amber-600 mt-1">&lt; {min}</p>
              </div>

              {/* Normal Zone */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200/50 text-center">
                <div className="w-3 h-3 bg-emerald-400 rounded-full mx-auto mb-2"></div>
                <p className="text-xs font-bold text-emerald-700">Normal</p>
                <p className="text-xs text-emerald-600 mt-1">{min}-{max}</p>
              </div>

              {/* High Zone */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200/50 text-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mx-auto mb-2"></div>
                <p className="text-xs font-bold text-red-700">Élevé</p>
                <p className="text-xs text-red-600 mt-1">&gt; {max}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-t border-slate-200/50 rounded-b-3xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-semibold text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDetailsModal;
