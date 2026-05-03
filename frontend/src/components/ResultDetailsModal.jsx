import { X } from "lucide-react";

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

  // Gauge SVG rendering
  const renderGauge = () => {
    const cx = 150;
    const cy = 150;
    const radius = 120;
    const startAngle = 180; // Left side
    const endAngle = 0; // Right side

    // SVG arc path for each zone
    const yellowArc = {
      start: 180,
      end: 150,
      color: "#eab308",
      label: "Bas",
    };
    const greenArc = {
      start: 150,
      end: 30,
      color: "#22c55e",
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
    const pointerX = cx + (radius - 25) * Math.cos(pointerRad);
    const pointerY = cy + (radius - 25) * Math.sin(pointerRad);

    return (
      <svg
        width="400"
        height="280"
        viewBox="0 0 300 280"
        className="mx-auto"
      >
        {/* Gauge arcs */}
        <path
          d={arcToPath(yellowArc.start, yellowArc.end, radius, cx, cy)}
          stroke={yellowArc.color}
          strokeWidth="25"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arcToPath(greenArc.start, greenArc.end, radius, cx, cy)}
          stroke={greenArc.color}
          strokeWidth="25"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arcToPath(redArc.start, redArc.end, radius, cx, cy)}
          stroke={redArc.color}
          strokeWidth="25"
          fill="none"
          strokeLinecap="round"
        />

        {/* Scale markers */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const angle = 180 - (percent / 100) * 180;
          const rad = (angle * Math.PI) / 180;
          const x1 = cx + (radius + 15) * Math.cos(rad);
          const y1 = cy + (radius + 15) * Math.sin(rad);
          const x2 = cx + (radius + 28) * Math.cos(rad);
          const y2 = cy + (radius + 28) * Math.sin(rad);
          const labelX = cx + (radius + 45) * Math.cos(rad);
          const labelY = cy + (radius + 45) * Math.sin(rad);

          return (
            <g key={percent}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth="2" />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dy="0.3em"
                fontSize="11"
                fill="#64748b"
              >
                {percent}%
              </text>
            </g>
          );
        })}

        {/* Pointer needle */}
        <g>
          {/* Needle line */}
          <line
            x1={cx}
            y1={cy}
            x2={pointerX}
            y2={pointerY}
            stroke={zoneColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Center circle */}
          <circle cx={cx} cy={cy} r="8" fill={zoneColor} />
        </g>

        {/* Center text */}
        <text
          x={cx}
          y={cy + 35}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#1e293b"
        >
          {valeur} {unite}
        </text>
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Détails du Résultat
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {ana.reference}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Patient & Analysis Info */}
          <div className="grid grid-cols-2 gap-4 mb-8 pb-6 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500 font-medium">Patient</p>
              <p className="text-lg font-semibold text-gray-900">
                {ana.patient?.nom} {ana.patient?.prenom}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Analyse</p>
              <p className="text-lg font-semibold text-gray-900">
                {analyse?.designation}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Norme</p>
              <p className="text-lg font-semibold text-blue-600">
                {min} - {max} {unite}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Résultat</p>
              <p
                className={`text-lg font-bold ${
                  zone === "GREEN"
                    ? "text-green-600"
                    : zone === "LOW"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {valeur} {unite}
              </p>
            </div>
          </div>

          {/* Gauge */}
          <div className="mb-8">
            <p className="text-center text-sm text-gray-600 font-medium mb-4">
              Visualisation de la Valeur
            </p>
            {renderGauge()}
          </div>

          {/* Zone Legend & Status */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Yellow Zone */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="w-4 h-4 bg-yellow-400 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-semibold text-yellow-700">Bas</p>
              <p className="text-xs text-yellow-600 mt-1">&lt; {min} {unite}</p>
            </div>

            {/* Green Zone */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="w-4 h-4 bg-green-400 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-semibold text-green-700">Normal</p>
              <p className="text-xs text-green-600 mt-1">
                {min} - {max} {unite}
              </p>
            </div>

            {/* Red Zone */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="w-4 h-4 bg-red-400 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-semibold text-red-700">Élevé</p>
              <p className="text-xs text-red-600 mt-1">&gt; {max} {unite}</p>
            </div>
          </div>

          {/* Current Status */}
          <div
            className={`rounded-lg p-4 mb-6 ${
              zone === "GREEN"
                ? "bg-green-50 border border-green-200"
                : zone === "LOW"
                ? "bg-yellow-50 border border-yellow-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`font-semibold text-center ${
                zone === "GREEN"
                  ? "text-green-700"
                  : zone === "LOW"
                  ? "text-yellow-700"
                  : "text-red-700"
              }`}
            >
              {zone === "GREEN"
                ? "✓ Valeur dans les normes"
                : zone === "LOW"
                ? "⚠ Valeur en dessous des normes"
                : "✗ Valeur au-dessus des normes"}
            </p>
          </div>

          {/* Commentaire */}
          {ligne.commentaire && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 font-medium mb-2">
                Commentaire Médical
              </p>
              <p className="text-gray-800">{ligne.commentaire}</p>
            </div>
          )}

          {/* Close Button */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDetailsModal;
