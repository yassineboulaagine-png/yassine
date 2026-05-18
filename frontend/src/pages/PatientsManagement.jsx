import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import "./Dashboard.css";
import "./PatientsManagement.css";

const API_BASE_URL = "http://projet_pff.test/api";

const PatientsManagement = () => {
  const { token } = useAuth();
  const { t, i18n } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    cin: "",
    telephone: "",
    sexe: "M",
    date_naissance: "",
  });

  // Get axios config with auth header
  const getAxiosConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Fetch patients list
  useEffect(() => {
    if (token) {
      fetchPatients();
    }
  }, [token]);

  // Filter patients based on search term
  useEffect(() => {
    const filtered = patients.filter((patient) => {
      const fullName = `${patient.prenom} ${patient.nom}`.toLowerCase();
      const cin = patient.cin.toLowerCase();
      const term = searchTerm.toLowerCase();
      return fullName.includes(term) || cin.includes(term);
    });
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/patients`, getAxiosConfig());
      setPatients(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error(t("patientsManagement.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.nom || !formData.prenom || !formData.cin || !formData.telephone || !formData.date_naissance) {
      toast.error(t("common.required_fields"));
      return;
    }

    try {
      setIsSubmitting(true);
      const patientData = {
        nom: formData.nom,
        prenom: formData.prenom,
        cin: formData.cin,
        telephone: formData.telephone,
        sexe: formData.sexe,
        date_naissance: formData.date_naissance,
      };

      if (editingId) {
        // Update patient
        await axios.put(`${API_BASE_URL}/patients/${editingId}`, patientData, getAxiosConfig());
        toast.success(t("patientsManagement.updateSuccess"));
      } else {
        // Add new patient
        await axios.post(`${API_BASE_URL}/patients`, patientData, getAxiosConfig());
        toast.success(t("patientsManagement.saveSuccess"));
      }
      resetForm();
      fetchPatients();
    } catch (error) {
      console.error("Error saving patient:", error);
      const validationErrors = error.response?.data?.errors;
      toast.error(error.response?.data?.message || (validationErrors ? Object.values(validationErrors).flat().join(", ") : t("patientsManagement.saveError")));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPatient = (patient) => {
    setFormData({
      nom: patient.nom,
      prenom: patient.prenom,
      cin: patient.cin,
      telephone: patient.telephone,
      sexe: patient.sexe || "M",
      date_naissance: patient.date_naissance,
    });
    setEditingId(patient.id);
    setOpenModal(true);
  };

  const handleDeletePatient = async (id) => {
    if (window.confirm(t("patientsManagement.deleteConfirm"))) {
      try {
        await axios.delete(`${API_BASE_URL}/patients/${id}`, getAxiosConfig());
        toast.success(t("patientsManagement.deleteSuccess"));
        fetchPatients();
      } catch (error) {
        console.error("Error deleting patient:", error);
        toast.error(t("patientsManagement.deleteError"));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      cin: "",
      telephone: "",
      sexe: "M",
      date_naissance: "",
    });
    setEditingId(null);
    setOpenModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(i18n.language?.startsWith("ar") ? "ar-MA" : "fr-FR", options);
  };

  return (
    <div className="patients-management">
      {/* Header Section */}
      <div className="patients-header">
        <div className="patients-header-top">
          <h1>{t("patientsManagement.title")}</h1>
          <Button
            onClick={() => {
              resetForm();
              setOpenModal(true);
            }}
            className="btn-add-patient"
          >
            <Plus size={20} /> {t("patientsManagement.addPatient")}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <Input
            type="text"
            placeholder={t("patientsManagement.searchPlaceholder")}
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
            <p>{t("patientsManagement.loading")}</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="empty-state">
            <p>
              {patients.length === 0
                ? t("patientsManagement.empty")
                : t("patientsManagement.noSearchResult")}
            </p>
          </div>
        ) : (
          <table className="hl-table">
            <thead>
              <tr>
                <th>{t("patientsManagement.fullName")}</th>
                <th>CIN</th>
                <th>{t("patientsManagement.phone")}</th>
                <th>{t("patientsManagement.registrationDate")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td className="patient-name">
                    <span className="name-badge">{patient.prenom} {patient.nom}</span>
                  </td>
                  <td>{patient.cin}</td>
                  <td>{patient.telephone}</td>
                  <td>{formatDate(patient.created_at || patient.date_inscription)}</td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditPatient(patient)}
                        title={t("common.modify")}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeletePatient(patient.id)}
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
              <h2>{editingId ? t("patientsManagement.editTitle") : t("patientsManagement.addTitle")}</h2>
              <button className="modal-close-btn" onClick={() => resetForm()}>
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddPatient} className="patient-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nom">{t("patientsManagement.lastName")} *</label>
                  <Input
                    id="nom"
                    name="nom"
                    type="text"
                    value={formData.nom}
                    onChange={handleInputChange}
                    placeholder="Ex: Dupont"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prenom">{t("patientsManagement.firstName")} *</label>
                  <Input
                    id="prenom"
                    name="prenom"
                    type="text"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    placeholder="Ex: Jean"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cin">CIN *</label>
                  <Input
                    id="cin"
                    name="cin"
                    type="text"
                    value={formData.cin}
                    onChange={handleInputChange}
                    placeholder="Ex: 12345678"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="telephone">{t("patientsManagement.phone")} *</label>
                  <Input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    placeholder="Ex: +212612345678"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sexe">{t("patients.sexe")}</label>
                  <select
                    id="sexe"
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="M">{t("patientsManagement.male")}</option>
                    <option value="F">{t("patientsManagement.female")}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="date_naissance">{t("patientsManagement.birthDate")} *</label>
                  <Input
                    id="date_naissance"
                    name="date_naissance"
                    type="date"
                    value={formData.date_naissance}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
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
                  {isSubmitting ? t("patientsManagement.submitSaving") : editingId ? t("common.update") : t("common.add")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsManagement;
