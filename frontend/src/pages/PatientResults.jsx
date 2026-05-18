import React from "react";
import { useTranslation } from "react-i18next";

const PatientResults = () => {
  const { t } = useTranslation();
  const examId = localStorage.getItem("patient_exam_id");

  return (
    <div className="p-10">
      <h1>{t("patientResults.title")}</h1>
      <p>
        {t("patientResults.analysisId")} <strong>{examId}</strong>
      </p>
    </div>
  );
};

export default PatientResults;
