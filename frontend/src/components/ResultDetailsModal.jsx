import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Beaker,
  CalendarDays,
  ClipboardCheck,
  Hash,
  MessageSquare,
  User,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "./ResultDetailsModal.css";

const ResultDetailsModal = ({ isOpen, onClose, ana }) => {
  const { t } = useTranslation();

  if (!isOpen || !ana) return null;

  const lines = ana.lignes || [];
  const text = (key, defaultValue) => t(key, { defaultValue });

  const cleanDisplayValue = (value) => {
    if (value === null || value === undefined) return "";

    const displayValue = String(value).trim();
    const normalizedValue = displayValue.toLowerCase();

    return ["nan", "null", "undefined"].includes(normalizedValue) ? "" : displayValue;
  };

  const parseNumber = (value) => {
    const numberValue = Number.parseFloat(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  };

  const formatValue = (value) => cleanDisplayValue(value) || "-";

  const formatWithUnit = (value, unit) => {
    const displayValue = formatValue(value);
    return displayValue === "-" ? displayValue : `${displayValue}${unit ? ` ${unit}` : ""}`;
  };

  const formatNormalRange = (analyse) => {
    const min = cleanDisplayValue(analyse?.norme_min);
    const max = cleanDisplayValue(analyse?.norme_max);
    const unit = cleanDisplayValue(analyse?.unite_mesure);
    const range = [min, max].filter(Boolean).join(" - ");

    return range ? `${range}${unit ? ` ${unit}` : ""}` : "-";
  };

  const getLineStatus = (line) => {
    const analyse = line.analyse;
    const value = parseNumber(line.valeur_resultat);
    const min = parseNumber(analyse?.norme_min);
    const max = parseNumber(analyse?.norme_max);

    if (value === null || min === null || max === null) {
      return {
        label: text("resultModal.notEvaluated", "Non evalue"),
        icon: Activity,
        className: "neutral",
      };
    }

    if (value < min) {
      return {
        label: t("resultModal.low"),
        icon: AlertTriangle,
        className: "low",
      };
    }

    if (value > max) {
      return {
        label: t("resultModal.high"),
        icon: AlertTriangle,
        className: "high",
      };
    }

    return {
      label: t("resultModal.normal"),
      icon: BadgeCheck,
      className: "normal",
    };
  };

  const patientName = `${ana.patient?.nom || ""} ${ana.patient?.prenom || ""}`.trim() || "-";
  const examName =
    ana.type_analyse?.libelle ||
    lines[0]?.analyse?.type_analyse?.libelle ||
    lines[0]?.analyse?.typeAnalyse?.libelle ||
    "-";
  const formattedDate = ana.created_at ? new Date(ana.created_at).toLocaleDateString("fr-FR") : "-";

  return (
    <div className="result-details-overlay">
      <div className="result-details-modal" role="dialog" aria-modal="true">
        <div className="result-details-header">
          <div className="result-details-title-group">
            <span className="result-details-header-icon">
              <ClipboardCheck size={24} />
            </span>
            <div>
              <h3>{t("resultModal.title")}</h3>
              <p>{text("resultModal.subtitleInfo", "Informations de l'examen et resultats saisis")}</p>
            </div>
          </div>

          <button className="result-details-close-x" onClick={onClose} aria-label={t("resultModal.close")}>
            <X size={22} />
          </button>
        </div>

        <div className="result-details-top-grid">
          <InfoTile icon={Hash} label={text("resultModal.referenceLabel", "Reference")} value={ana.reference || "-"} />
          <InfoTile icon={Beaker} label={t("resultModal.analysis")} value={examName} />
          <InfoTile icon={CalendarDays} label={text("resultModal.date", "Date")} value={formattedDate} />
        </div>

        <div className="result-details-body">
          <div className="result-details-summary-grid">
            <section className="result-details-panel">
              <div className="result-details-section-title">
                <User size={18} />
                <h4>{t("resultModal.patient")}</h4>
              </div>
              <p className="result-details-patient-name">{patientName}</p>
              <p className="result-details-muted">
                {text("resultModal.status", "Statut")}: {t(`status.${ana.statut}`, { defaultValue: ana.statut || "-" })}
              </p>
            </section>

            <section className="result-details-panel result-details-panel-accent">
              <div className="result-details-section-title">
                <Activity size={18} />
                <h4>{text("resultModal.summary", "Resume")}</h4>
              </div>
              <p className="result-details-muted">{text("resultModal.resultsCount", "Nombre de resultats")}</p>
              <p className="result-details-count">{lines.length}</p>
            </section>
          </div>

          <section className="result-details-results">
            <h4>{text("resultModal.results", "Resultats")}</h4>

            {lines.length === 0 ? (
              <div className="result-details-empty">{text("resultModal.noResults", "Aucun resultat disponible")}</div>
            ) : (
              <div className="result-details-lines">
                {lines.map((line) => {
                  const analyse = line.analyse || {};
                  const unit = cleanDisplayValue(analyse.unite_mesure);
                  const status = getLineStatus(line);
                  const StatusIcon = status.icon;

                  return (
                    <article key={line.id} className={`result-details-line ${status.className}`}>
                      <div className="result-details-line-main">
                        <div>
                          <p className="result-details-analysis-name">{analyse.designation || "-"}</p>
                          <p className="result-details-range">
                            {text("resultModal.normalValues", "Valeurs normales")}: {formatNormalRange(analyse)}
                          </p>
                        </div>

                        <div className="result-details-value-group">
                          <span className="result-details-value">{formatWithUnit(line.valeur_resultat, unit)}</span>
                          <span className={`result-details-status ${status.className}`}>
                            <StatusIcon size={14} />
                            {status.label}
                          </span>
                        </div>
                      </div>

                      <div className="result-details-comment">
                        <MessageSquare size={16} />
                        <div>
                          <p>{t("resultModal.medicalComment")}</p>
                          <span>{cleanDisplayValue(line.commentaire) || text("resultModal.noComment", "Aucun commentaire")}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="result-details-footer">
          <button className="result-details-close-button" onClick={onClose}>
            <X size={17} />
            {t("resultModal.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="result-details-info-tile">
    <Icon size={18} />
    <div>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  </div>
);

export default ResultDetailsModal;
