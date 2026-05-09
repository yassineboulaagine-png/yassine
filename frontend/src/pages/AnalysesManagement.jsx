import { useState, useEffect } from "react";
import { Plus, Search, FileText, Trash2, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import "./Dashboard.css";
import "./AnalysesManagement.css";

const API_BASE_URL = "http://localhost:8000/api";

const AnalysesManagement = () => {
  const { token } = useAuth();
  const [examens, setExamens] = useState([]);
  const [filteredExamens, setFilteredExamens] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(null);

  const [formData, setFormData] = useState({
    patient_id: "",
  });

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
      toast.error("Erreur lors du chargement des analyses");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients`, getAxiosConfig());
      setPatients(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Erreur lors du chargement des patients");
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

    // Validation
    if (!formData.patient_id) {
      toast.error("Veuillez sélectionner un patient");
      return;
    }

    try {
      setIsSubmitting(true);
      const analyseData = {
        patient_id: formData.patient_id,
      };

      await axios.post(`${API_BASE_URL}/examens`, analyseData, getAxiosConfig());
      toast.success("Analyse créée avec succès");
      resetForm();
      fetchExamens();
    } catch (error) {
      console.error("Error creating analyse:", error);
      toast.error(
        error.response?.data?.message ||
          (error.response?.data?.errors
            ? Object.values(error.response.data.errors).flat().join(", ")
            : "Erreur lors de la création de l'analyse")
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

      toast.success("PDF téléchargé avec succès");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handleDeleteAnalyse = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette analyse ?")) {
      try {
        await axios.delete(`${API_BASE_URL}/examens/${id}`, getAxiosConfig());
        toast.success("Analyse supprimée avec succès");
        fetchExamens();
      } catch (error) {
        console.error("Error deleting analyse:", error);
        toast.error("Erreur lors de la suppression de l'analyse");
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
    return new Date(dateString).toLocaleDateString("fr-FR", options);
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
      en_cours: "En cours",
      valide: "Validée",
      termine: "Terminée",
      annule: "Annulée",
      rejete: "Rejetée",
      en_validation: "En validation",
    };
    return statusMap[status] || status;
  };

  return (
    <div className="analyses-management">
      {/* Header Section */}
      <div className="analyses-header">
        <div className="analyses-header-top">
          <h1>Gestion des Analyses</h1>
          <Button
            onClick={() => {
              resetForm();
              setOpenModal(true);
            }}
            className="btn-add-analyse"
          >
            <Plus size={20} /> Nouvelle Analyse
          </Button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <Input
            type="text"
            placeholder="Rechercher par patient ou référence..."
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
            <p>Chargement des analyses...</p>
          </div>
        ) : filteredExamens.length === 0 ? (
          <div className="empty-state">
            <p>
              {examens.length === 0
                ? "Aucune analyse enregistrée"
                : "Aucune analyse trouvée pour votre recherche"}
            </p>
          </div>
        ) : (
          <table className="hl-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Patient</th>
                <th>Statut</th>
                <th>Date Création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExamens.map((examen) => (
                <tr key={examen.id}>
                  <td className="reference-cell">
                    <span className="reference-badge">{examen.reference || "-"}</span>
                  </td>
                  <td>
                    {examen.patient
                      ? `${examen.patient.prenom} ${examen.patient.nom}`
                      : "-"}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(examen.statut)}>
                      {getStatusDisplay(examen.statut)}
                    </span>
                  </td>
                  <td>{formatDate(examen.created_at)}</td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-btn pdf-btn"
                        onClick={() => handleGeneratePDF(examen.id)}
                        disabled={downloadingPdf === examen.id}
                        title="Voir PDF"
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteAnalyse(examen.id)}
                        title="Supprimer"
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
              <h2>Créer une Nouvelle Analyse</h2>
              <button className="modal-close-btn" onClick={() => resetForm()}>
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddAnalyse} className="analyse-form">
              <div className="form-group">
                <label htmlFor="patient_id">Patient *</label>
                <select
                  id="patient_id"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">-- Sélectionner un patient --</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.prenom} {patient.nom} - CIN: {patient.cin}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <Button
                  type="button"
                  onClick={() => resetForm()}
                  className="btn-cancel"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-submit"
                >
                  {isSubmitting ? "Création en cours..." : "Créer l'Analyse"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysesManagement;
