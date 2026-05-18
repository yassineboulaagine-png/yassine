import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  LogOut,
  UserCircle,
  X,
  ClipboardCheck,
  User,
  Settings,
  Search,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import "./Dashboard.css";
import DashboardRendezVous from "./DashboardRendezVous";
import { useTranslation } from "react-i18next";

const API_BASE = "http://projet_pff.test/api";
const API_URL = `${API_BASE}/patients`;
const EXAMEN_URL = `${API_BASE}/examens`;
const TODAY_URL = `${API_BASE}/examens-today`;

const DashboardPreleveur = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("patients");
  const [showModal, setShowModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewExam, setIsNewExam] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [patients, setPatients] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExamen, setSelectedExamen] = useState("");
  const [analysesLyoum, setAnalysesLyoum] = useState([]);
  const [analysesLoading, setAnalysesLoading] = useState(true);
  const [currentPatientId, setCurrentPatientId] = useState(null);

  const { t, i18n } = useTranslation();

  const changeLanguage = (e) => {
    const selectedLanguage = e.target.value;

    i18n.changeLanguage(selectedLanguage);

    if (selectedLanguage === "ar") {
      document.body.dir = "rtl";
    } else {
      document.body.dir = "ltr";
    }
  };

  const [newPatient, setNewPatient] = useState({
    nom: "",
    prenom: "",
    cin: "",
    telephone: "",
    sexe: "M",
    date_naissance: ""
  });

  const userString = localStorage.getItem("user");

  const user = userString
    ? JSON.parse(userString)
    : { id: 1, name: "Ibrahim", role: "Prélèveur" };

  // ================= FETCH PATIENTS =================
  const fetchPatients = async (query = "") => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await axios.get(`${API_URL}?search=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      setPatients(response.data);
    } catch (error) {
      console.error("API error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }

      setPatients([]);
    }
  };

  // ================= FETCH ANALYSES =================
  const fetchAnalysesLyoum = async (isInitial = false) => {
    try {
      if (isInitial) setAnalysesLoading(true);

      const response = await axios.get(TODAY_URL);

      setAnalysesLyoum(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching analyses:", error);
    } finally {
      if (isInitial) setAnalysesLoading(false);
    }
  };

  // ================= EFFECTS =================
  useEffect(() => {
    const delay = setTimeout(() => fetchPatients(searchTerm), 400);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    fetchAnalysesLyoum(true);

    const interval = setInterval(() => fetchAnalysesLyoum(false), 4000);

    return () => clearInterval(interval);
  }, []);

  // ================= SAVE PATIENT =================
  const handleSavePatient = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      // ===== NEW EXAM =====
      if (isNewExam && currentPatientId) {
        if (!selectedExamen) {
          toast.error("Veuillez choisir un type d'analyse !");
          return;
        }

        const examPayload = {
          patient_id: parseInt(currentPatientId),
          type_analyse_id: parseInt(selectedExamen)
        };

        const response = await axios.post(EXAMEN_URL, examPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        });

        const ref =
          response.data?.data?.reference || response.data?.reference;

        if (ref) setGeneratedCode(ref);

        toast.success("Nouvel examen enregistré !");

        fetchAnalysesLyoum();

        closeAndReset();

        return;
      }

      // ===== EDIT PATIENT =====
      if (isEditing) {
        await axios.put(`${API_URL}/${patients[editIndex].id}`, newPatient, {
          headers: { Authorization: `Bearer ${token}` }
        });

        toast.success("Patient modifié !");

        fetchPatients(searchTerm);

        closeAndReset();

        return;
      }

      // ===== NEW PATIENT =====
      const patientRes = await axios.post(API_URL, newPatient, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newPatientId =
        patientRes.data?.id || patientRes.data?.data?.id;

      if (newPatientId && selectedExamen) {
        const examPayload = {
          patient_id: newPatientId,
          type_analyse_id: parseInt(selectedExamen)
        };

        const examRes = await axios.post(EXAMEN_URL, examPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        });

        const ref =
          examRes.data?.data?.reference || examRes.data?.reference;

        if (ref) setGeneratedCode(ref);
      }

      toast.success("Patient et examen enregistrés !");

      fetchPatients(searchTerm);

      fetchAnalysesLyoum();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Erreur d'enregistrement"
      );
    }
  };

  // ================= STATUS =================
  const handleStatusChange = async (id, newStatus) => {
    try {
      const endpoint =
        newStatus === "valide"
          ? `${EXAMEN_URL}/${id}/valider`
          : `${EXAMEN_URL}/${id}/annuler`;

      await axios.patch(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      toast.success(
        newStatus === "valide"
          ? "Examen validé !"
          : "Examen annulé !"
      );

      fetchAnalysesLyoum();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour"
      );
    }
  };

  // ================= RESET =================
  const closeAndReset = () => {
    setShowModal(false);
    setGeneratedCode(null);
    setIsEditing(false);
    setIsNewExam(false);
    setCurrentPatientId(null);
    setSelectedExamen("");

    setNewPatient({
      nom: "",
      prenom: "",
      cin: "",
      telephone: "",
      sexe: "M",
      date_naissance: ""
    });
  };

  // ================= OPEN NEW EXAM =================
  const openNewExamModal = (patient) => {
    setNewPatient({
      nom: patient.nom,
      prenom: patient.prenom,
      cin: patient.cin,
      telephone: patient.telephone,
      sexe: patient.sexe,
      date_naissance: patient.date_naissance
    });

    setCurrentPatientId(patient.id);

    setIsNewExam(true);

    setSelectedExamen("");

    setShowModal(true);
  };

  return (
    <div className="hl-dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside className="hl-sidebar preleveur">
        <div className="hl-sidebar-header">
          <h1 className="hl-logo">
            Helix <span>Lab</span>
          </h1>
        </div>

        <nav className="hl-nav">
          <button
            className={`hl-nav-btn ${
              activeTab === "patients" ? "active" : ""
            }`}
            onClick={() => setActiveTab("patients")}
          >
            <Users size={20} /> {t("sidebar.patients_list")}
          </button>

          <button
            className={`hl-nav-btn ${
              activeTab === "analyses" ? "active" : ""
            }`}
            onClick={() => setActiveTab("analyses")}
          >
            <ClipboardCheck size={20} />{" "}
            {t("sidebar.today_analyses")}
          </button>

          <button
            className={`hl-nav-btn ${
              activeTab === "rendezvous" ? "active" : ""
            }`}
            onClick={() => setActiveTab("rendezvous")}
          >
            <Calendar size={20} />{" "}
            {t("sidebar.appointments_management")}
          </button>
        </nav>

        <div className="hl-logout-section">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            <LogOut size={20} /> {t("sidebar.logout")}
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="hl-main">
        <header className="hl-header">
          <h2>
            {t("header.space")} {user.role}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            {/* LANGUAGE */}
            <select
              onChange={changeLanguage}
              defaultValue={i18n.language}
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc"
              }}
            >
              <option value="fr">FR</option>
              <option value="ar">AR</option>
            </select>

            {/* USER */}
            <div
              className="hl-user-info"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="hl-user-text">
                <p className="hl-user-name">
                  {user.nom || user.name || "Ibrahim"}
                </p>

                <p className="hl-user-role">{user.role}</p>
              </div>

              <UserCircle size={38} color="#312e81" />

              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/profil-preleveur")}
                  >
                    <User size={16} /> Mon Profil
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/settings-preleveur")}
                  >
                    <Settings size={16} /> Paramètres
                  </button>

                  <hr />

                  <button
                    className="dropdown-item logout-item"
                    onClick={() => {
                      localStorage.clear();
                      navigate("/login");
                    }}
                  >
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="hl-content-body">
          {/* ================= PATIENTS ================= */}
          {activeTab === "patients" && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "25px",
                  alignItems: "center"
                }}
              >
                <div className="search-wrapper">
                  <div className="search-input-container">
                    <Search
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "12px"
                      }}
                      size={18}
                      color="#94a3b8"
                    />

                    <input
                      className="hl-search-input"
                      type="text"
                      placeholder={t(
                        "patients.search_placeholder"
                      )}
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(e.target.value)
                      }
                    />
                  </div>
                </div>

                <button
                  className="btn-new-patient"
                  onClick={() => setShowModal(true)}
                >
                  <Users size={18} />{" "}
                  {t("patients.new_patient")}
                </button>
              </div>

              <div className="hl-table-container">
                <table className="hl-table">
                  <thead>
                    <tr>
                      <th>{t("patients.name_prenom")}</th>
                      <th>{t("patients.sexe")}</th>
                      <th>{t("patients.cin")}</th>
                      <th>{t("patients.phone")}</th>
                      <th>{t("patients.birth_date")}</th>
                      <th>{t("common.actions")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {patients.map((p, index) => (
                      <tr key={p.id}>
                        <td className="font-bold">
                          {p.nom} {p.prenom}
                        </td>

                        <td>
                          {p.sexe === "M"
                            ? "👨 Masculin"
                            : "👩 Féminin"}
                        </td>

                        <td>{p.cin}</td>

                        <td>{p.telephone}</td>

                        <td>{p.date_naissance}</td>

                        <td>
                          <button
                            className="btn-modifier"
                            onClick={() => {
                              setNewPatient(p);
                              setEditIndex(index);
                              setIsEditing(true);
                              setShowModal(true);
                            }}
                          >
                            {t("common.modify")}
                          </button>

                          <button
                            className="btn-valider"
                            style={{ marginLeft: "8px" }}
                            onClick={() => openNewExamModal(p)}
                          >
                            {t("patients.new_exam")}
                          </button>

                          <button
                            className="btn-delete"
                            style={{ marginLeft: "8px" }}
                            onClick={async () => {
                              if (
                                window.confirm(
                                  t("common.confirm_delete")
                                )
                              ) {
                                const token =
                                  localStorage.getItem("token");

                                await axios.delete(
                                  `${API_URL}/${p.id}`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`
                                    }
                                  }
                                );

                                toast.success(
                                  "Patient supprimé !"
                                );

                                fetchPatients(searchTerm);
                              }
                            }}
                          >
                            {t("common.delete")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= ANALYSES ================= */}
          {activeTab === "analyses" && (
            <div className="hl-table-container">
              {analysesLoading ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#94a3b8"
                  }}
                >
                  <p>{t("common.loading")}</p>
                </div>
              ) : analysesLyoum.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#94a3b8"
                  }}
                >
                  <p>{t("analyses.no_analyses")}</p>
                </div>
              ) : (
                <table className="hl-table">
                  <thead>
                    <tr>
                      <th>{t("analyses.reference")}</th>
                      <th>{t("analyses.patient")}</th>
                      <th>{t("analyses.exam")}</th>
                      <th>{t("common.status")}</th>
                      <th>{t("common.actions")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {analysesLyoum.map((ana) => (
                      <tr key={ana.id}>
                        <td className="font-bold">
                          {ana.reference}
                        </td>

                        <td>
                          {ana.patient?.nom}{" "}
                          {ana.patient?.prenom}
                        </td>

                        <td>
                          {ana.type_analyse?.libelle || "N/A"}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${ana.statut}`}
                          >
                            {ana.statut}
                          </span>
                        </td>

                        <td>
                          <button
                            className="btn-valider"
                            onClick={() =>
                              handleStatusChange(
                                ana.id,
                                "valide"
                              )
                            }
                          >
                            {t("common.validate")}
                          </button>

                          <button
                            className="btn-annuler"
                            style={{ marginLeft: "8px" }}
                            onClick={() =>
                              window.confirm(
                                t(
                                  "common.confirm_cancel_exam"
                                )
                              ) &&
                              handleStatusChange(
                                ana.id,
                                "annule"
                              )
                            }
                          >
                            {t("common.cancel")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ================= RDV ================= */}
          {activeTab === "rendezvous" && (
            <div
              style={{
                width: "100%",
                flex: 1,
                padding: "20px"
              }}
            >
              <DashboardRendezVous />
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {isNewExam
                  ? t("patients.new_exam")
                  : isEditing
                  ? t("common.modify")
                  : t("patients.new_patient")}
              </h3>

              <button
                onClick={closeAndReset}
                className="close-x"
              >
                <X size={22} />
              </button>
            </div>

            {!generatedCode ? (
              <form
                onSubmit={handleSavePatient}
                className="modal-form"
              >
                <div className="modal-form-row">
                  <div className="form-group">
                    <label>{t("appointment_form.nom")}</label>

                    <input
                      type="text"
                      value={newPatient.nom}
                      required
                      readOnly={isNewExam}
                      onChange={(e) =>
                        setNewPatient({
                          ...newPatient,
                          nom: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      {t("appointment_form.prenom")}
                    </label>

                    <input
                      type="text"
                      value={newPatient.prenom}
                      required
                      readOnly={isNewExam}
                      onChange={(e) =>
                        setNewPatient({
                          ...newPatient,
                          prenom: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div className="modal-form-row">
                  <div className="form-group">
                    <label>{t("patients.sexe")}</label>

                    <select
                      value={newPatient.sexe}
                      disabled={isNewExam}
                      onChange={(e) =>
                        setNewPatient({
                          ...newPatient,
                          sexe: e.target.value
                        })
                      }
                    >
                      <option value="M">
                        👨 {t("appointment_form.male")}
                      </option>

                      <option value="F">
                        👩 {t("appointment_form.female")}
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      {t("patients.birth_date")}
                    </label>

                    <input
                      type="date"
                      value={newPatient.date_naissance}
                      required
                      readOnly={isNewExam}
                      onChange={(e) =>
                        setNewPatient({
                          ...newPatient,
                          date_naissance:
                            e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t("patients.cin")}</label>

                  <input
                    type="text"
                    value={newPatient.cin}
                    required
                    readOnly={isNewExam}
                    onChange={(e) =>
                      setNewPatient({
                        ...newPatient,
                        cin: e.target.value
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>{t("patients.phone")}</label>

                  <input
                    type="tel"
                    value={newPatient.telephone}
                    maxLength={10}
                    required
                    readOnly={isNewExam}
                    onChange={(e) =>
                      setNewPatient({
                        ...newPatient,
                        telephone: e.target.value
                      })
                    }
                  />
                </div>

                {(isNewExam || !isEditing) && (
                  <div className="form-group">
                    <label>{t("analyses.exam")}</label>

                    <select
                      value={selectedExamen}
                      onChange={(e) =>
                        setSelectedExamen(e.target.value)
                      }
                      required
                    >
                      <option value="">
                        {t("common.choose")}
                      </option>

                      <option value="1">
                        Biochimie
                      </option>

                      <option value="2">
                        Hématologie
                      </option>
                    </select>
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={closeAndReset}
                  >
                    {t("common.cancel")}
                  </button>

                  <button
                    type="submit"
                    className="btn-save"
                  >
                    {isNewExam
                      ? t("patients.new_exam")
                      : isEditing
                      ? t("common.modify")
                      : t("common.save")}
                  </button>
                </div>
              </form>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px"
                }}
              >
                <ClipboardCheck
                  size={40}
                  color="#4f46e5"
                />

                <h4>
                  Examen créé avec succès !
                </h4>

                <h1
                  style={{
                    fontSize: "30px",
                    color: "#312e81"
                  }}
                >
                  {generatedCode}
                </h1>

                <button
                  className="btn-save"
                  style={{
                    width: "100%",
                    marginTop: "20px"
                  }}
                  onClick={closeAndReset}
                >
                  {t("common.finish")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPreleveur;