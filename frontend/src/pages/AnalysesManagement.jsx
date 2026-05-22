import { useState, useEffect } from "react";
import { Plus, Search, FileText, Trash2, X, Edit3 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import "./Dashboard.css";
import "./AnalysesManagement.css";

const API_BASE_URL = "http://projet_pff.test/api";

const AnalysesManagement = () => {
  const { token } = useAuth();
  const { t, i18n } = useTranslation();
  const [examens, setExamens] = useState([]);
  const [filteredExamens, setFilteredExamens] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(null);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedExamen, setSelectedExamen] = useState(null);
  const [resultValue, setResultValue] = useState(""); 

  const [formData, setFormData] = useState({
    patient_id: "",
  });
  const [typeAnalyseId, setTypeAnalyseId] = useState("");

  // Get axios config with auth header
  const getAxiosConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Fetch examens and patients
  useEffect(() => {
    if (token) {
      fetchExamens();
      fetchPatients();
    }
  }, [token]);

  // Filter examens based on search term
  useEffect(() => {
    const filtered = examens.filter((examen) => {
      const patientName = examen.patient
        ? `${examen.patient.prenom} ${examen.patient.nom}`.toLowerCase()
        : "";
      const reference = (examen.reference || "").toLowerCase();
      const term = searchTerm.toLowerCase();
      return patientName.includes(term) || reference.includes(term);
    });
    setFilteredExamens(filtered);
  }, [searchTerm, examens]);

  const fetchExamens = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/examens`, getAxiosConfig());
      setExamens(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching examens:", error);
      toast.error(t("analysesManagement.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
  try {
    await axios.patch(
      `${API_BASE_URL}/examens/${selectedExamen.id}/resultat`,
      {
        statut: 'termine',
        valeur: resultValue,
      },
      getAxiosConfig()  // ✅ زدنا token
    );
    setIsResultModalOpen(false);
    setResultValue("");
    fetchExamens();
    toast.success(t("analysesManagement.resultSaved"));
  } catch (error) {
    console.error("Error saving result:", error);
    toast.error(t("analysesManagement.saveResultError"));
  }
};

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients`, getAxiosConfig());
      setPatients(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error(t("analysesManagement.patientLoadError"));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 const handleAddAnalyse = async (e) => {
    e.preventDefault();

    // 1. Validation: زيد تشيك حتى على النوع
    if (!formData.patient_id || !formData.type_analyse_id) {
      toast.error(t("analysesManagement.selectPatientAndType"));
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 2. صيفط كاع البيانات اللي محتاجها Laravel
      const analyseData = {
        patient_id: formData.patient_id,
        type_analyse_id: formData.type_analyse_id, // 👈 هادي هي اللي كانت ناقصة!
        statut: 'en_cours' // من الأحسن تحدد الحالة البدئية هنا
      };

      await axios.post(`${API_BASE_URL}/examens`, analyseData, getAxiosConfig());
      
      toast.success(t("analysesManagement.createSuccess"));
      resetForm();
      fetchExamens();
    } catch (error) {
      console.error("Error creating analyse:", error);
      toast.error(
        error.response?.data?.message || 
        t("analysesManagement.createError")
      );
    } finally {
      setIsSubmitting(false);
    }
};

  const handleGeneratePDF = async (examenId) => {
    try {
      setDownloadingPdf(examenId);
      // The PDF endpoint returns a binary file, so we use responseType: 'blob'
      const response = await axios.get(`${API_BASE_URL}/examens/${examenId}/pdf`, {
        ...getAxiosConfig(),
        responseType: "blob",
      });

      // Create a blob and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rapport_${examenId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t("analysesManagement.pdfDownloaded"));
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(t("analysesManagement.pdfError"));
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handleExportXML = async (patientId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients/export-xml/${patientId}`, {
        ...getAxiosConfig(),
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/xml" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "patient.xml";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting XML:", error);
      toast.error("Erreur lors de l'export XML");
    }
  };

  const handleDeleteAnalyse = async (id) => {
    if (window.confirm(t("analysesManagement.deleteConfirm"))) {
      try {
        await axios.delete(`${API_BASE_URL}/examens/${id}`, getAxiosConfig());
        toast.success(t("analysesManagement.deleteSuccess"));
        fetchExamens();
      } catch (error) {
        console.error("Error deleting analyse:", error);
        toast.error(t("analysesManagement.deleteError"));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
    });
    setOpenModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(i18n.language?.startsWith("ar") ? "ar-MA" : "fr-FR", options);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      en_cours: "status-badge en-cours",
      valide: "status-badge valide",
      termine: "status-badge termine",
      annule: "status-badge annule",
      rejete: "status-badge rejete",
      en_validation: "status-badge en-validation",
    };
    return statusMap[status] || "status-badge";
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      en_cours: t("status.en_cours"),
      valide: t("status.validee"),
      termine: t("status.terminee"),
      annule: t("status.annulee"),
      rejete: t("status.rejetee"),
      en_validation: t("status.en_validation"),
    };
    return statusMap[status] || status;
  };

  
  return (
    
    
    <div className="analyses-management" >
     

      {/* Header Section */}
      <div className="analyses-header">
        <div className="analyses-header-top">
          <h1>{t("analysesManagement.title")}</h1>
          <Button
            onClick={() => {
              resetForm();
              setOpenModal(true);
            }}
            className="btn-add-analyse"
          >
            <Plus size={20} /> {t("analysesManagement.newAnalysis")}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <Input
            type="text"
            placeholder={t("analysesManagement.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="hl-table-container">
        {loading ? (
          <div className="loading-state">
            <p>{t("analysesManagement.loading")}</p>
          </div>
        ) : filteredExamens.length === 0 ? (
          <div className="empty-state">
            <p>
              {examens.length === 0
                ? t("analysesManagement.empty")
                : t("analysesManagement.noSearchResult")}
            </p>
          </div>
        ) : (
          <table className="hl-table">
            <thead>
              <tr>
                <th>{t("common.reference")}</th>
                <th>{t("common.patient")}</th>
                <th>{t("common.status")}</th>
                <th>{t("analysesManagement.creationDate")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>

                
              {filteredExamens.map((examen) => (
                <tr key={examen.id}>
                  <td className="reference-cell" data-label={t("common.reference")}>
                    <span className="reference-badge">{examen.reference || "-"}</span>
                  </td>
                  <td data-label={t("common.patient")}>
                    {examen.patient
                      ? `${examen.patient.prenom} ${examen.patient.nom}`
                      : "-"}
                  </td>
                  <td data-label={t("common.status")}>
                    <span className={getStatusBadgeClass(examen.statut)}>
                      {getStatusDisplay(examen.statut)}
                    </span>
                  </td>
                  <td data-label={t("analysesManagement.creationDate")}>{formatDate(examen.created_at)}</td>
                  <td data-label={t("common.actions")}>
                    <div className="actions-cell">
                      {examen.statut === "en_cours" && (
                        <button
                          className="action-btn edit-btn"
                          onClick={() => {
                            setSelectedExamen(examen);
                            setResultValue(examen.valeur || "");
                            setIsResultModalOpen(true);
                          }}
                          title={t("analysesManagement.resultTitle")}
                        >
                          <Edit3 size={18} />
                        </button>
                      )}
                      <button
                        className="action-btn pdf-btn"
                        onClick={() => handleGeneratePDF(examen.id)}
                        disabled={downloadingPdf === examen.id}
                        title={t("analysesManagement.pdfTitle")}
                      >
                        <FileText size={18} />
                      </button>
                      {(examen.statut === "termine" || examen.statut === "valide") && (
                        <a
                          href={`http://Projet_PFF.test/api/patients/export-xml/${examen.patient_id}`}
                          download="patient.xml"
                          onClick={(event) => {
                            event.preventDefault();
                            handleExportXML(examen.patient_id);
                          }}
                          title="Exporter XML"
                          style={{
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "700",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "42px",
                            height: "36px",
                          }}
                        >
                          XML
                        </a>
                      )}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteAnalyse(examen.id)}
                        title={t("common.delete")}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {openModal && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <h2>{t("analysesManagement.modalTitle")}</h2>
              <button className="modal-close-btn" onClick={() => resetForm()}>
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddAnalyse} className="analyse-form">
              <div className="form-group">
                <label htmlFor="patient_id">{t("analysesManagement.patientRequired")}</label>
                <select
                  id="patient_id"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">{t("analysesManagement.selectPatient")}</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.prenom} {patient.nom} - CIN: {patient.cin}
                    </option>
                  ))}
                </select>
              </div>
                               <div className="form-group">
  <label>{t("analysesManagement.analysisType")}</label>
  <select
    className="hl-input"
    value={formData.type_analyse_id}
    onChange={(e) => setFormData({...formData, type_analyse_id: e.target.value})}
  >
    <option value="">{t("analysesManagement.selectType")}</option>
    {/* هنا تقدر تدير map لـ types اللي جايين من الـ DB */}
    <option value="1">Biochimie</option>
    <option value="2">Hématologie</option>
  </select>
</div>

              {/* Form Actions */}
              <div className="form-actions">
                <Button
                  type="button"
                  onClick={() => resetForm()}
                  className="btn-cancel"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-submit"
                >
                  {isSubmitting ? t("analysesManagement.createRunning") : t("analysesManagement.createAnalysis")}
                </Button>

                
              </div>
            </form>
          </div>
        </div>
      )}

     {isResultModalOpen && (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999
  }}>
    <div style={{
      backgroundColor: 'white', padding: '24px',
      borderRadius: '12px', width: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
        {t("analysesManagement.enterResult")}
      </h2>
      <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
        {t("analysesManagement.patientLabel")} <strong>{selectedExamen?.patient?.prenom} {selectedExamen?.patient?.nom}</strong>
      </p>
      <input
        type="text"
        value={resultValue}
        onChange={(e) => setResultValue(e.target.value)}
        placeholder={t("analysesManagement.resultPlaceholder")}
        style={{ width: '100%', border: '1px solid #ddd', padding: '8px', borderRadius: '6px', marginBottom: '16px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button 
          onClick={() => setIsResultModalOpen(false)}
          style={{ padding: '8px 16px', color: '#666' }}
        >
          {t("common.cancel")}
        </button>
        <button 
          onClick={handleSaveResult}
          style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px' }}
        >
          {t("common.validate")}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default AnalysesManagement;
