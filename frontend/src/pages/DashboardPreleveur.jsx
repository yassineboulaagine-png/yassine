import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users, LogOut, UserCircle, X, ClipboardCheck,
  User, Settings, Search,Calendar
} from "lucide-react";
import { toast } from "sonner";
import "./Dashboard.css";
import { Link } from "react-router-dom";
import DashboardRendezVous from "./DashboardRendezVous";

const API_BASE   = "http://projet_pff.test/api";
const API_URL    = `${API_BASE}/patients`;
const EXAMEN_URL = `${API_BASE}/examens`;
const TODAY_URL  = `${API_BASE}/examens-today`;

const DashboardPreleveur = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]               = useState("patients");
  const [showModal, setShowModal]               = useState(false);
  const [generatedCode, setGeneratedCode]       = useState(null);
  const [isEditing, setIsEditing]               = useState(false);
  const [isNewExam, setIsNewExam]               = useState(false);
  const [editIndex, setEditIndex]               = useState(null);
  const [patients, setPatients]                 = useState([]);
  const [showUserMenu, setShowUserMenu]         = useState(false);
  const [searchTerm, setSearchTerm]             = useState("");
  const [selectedExamen, setSelectedExamen]     = useState("");
  const [analysesLyoum, setAnalysesLyoum]       = useState([]);
  const [analysesLoading, setAnalysesLoading]   = useState(true);
  const [currentPatientId, setCurrentPatientId] = useState(null);

  const [newPatient, setNewPatient] = useState({
    nom: "", prenom: "", cin: "", telephone: "", sexe: "M", date_naissance: ""
  });

  const userString = localStorage.getItem("user");
  const user = userString
    ? JSON.parse(userString)
    : { id: 1, name: "Ibrahim", role: "Prélèveur" };

  // ─── Fetch patients ───────────────────────────────────────
  const fetchPatients = async (query = "") => {
    try {
      const token = localStorage.getItem("token");
      
      // 🛡️ حماية إضافية إيلا ماكانش الـ token
      if (!token) return; 

      const response = await axios.get(`${API_URL}?search=${query}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Accept": "application/json" // زد هادي باش Laravel يجاوبك ديما بـ JSON
        }
      });
      
      setPatients(response.data);
    } catch (error) {
      console.error("API error:", error);
      // إيلا كان الـ error 401، غالباً الـ token مابقاش خدام
      if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
      }
      setPatients([]);
    }
};
  // ─── Fetch analyses du jour ───────────────────────────────
  const fetchAnalysesLyoum = async (isInitial = false) => {
    try {
      if (isInitial) setAnalysesLoading(true);
      const response = await axios.get(TODAY_URL);
      console.log("📊 Examens today:", JSON.stringify(response.data[0], null, 2)); 
      setAnalysesLyoum(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching analyses:", error);
    } finally {
      if (isInitial) setAnalysesLoading(false);
    }
  };

  // ─── Effects ─────────────────────────────────────────────
  useEffect(() => {
    const delay = setTimeout(() => fetchPatients(searchTerm), 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    fetchAnalysesLyoum(true);
    const interval = setInterval(() => fetchAnalysesLyoum(false), 4000);
    return () => clearInterval(interval);
  }, []);

  // ─── Save Patient / Exam ──────────────────────────────────
  const handleSavePatient = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      // ── CAS 1: Nouvel examen pour patient existant ──────────
      if (isNewExam && currentPatientId) {
        console.log("🔍 CAS 1 - selectedExamen:", selectedExamen);
        console.log("🔍 CAS 1 - currentPatientId:", currentPatientId);

        if (!selectedExamen || selectedExamen === "") {
          toast.error("Veuillez choisir un type d'analyse !");
          return;
        }

        // ─── ENSURE PROPER DATA TYPES ─────────────────────────
        const patientId = parseInt(currentPatientId, 10);
        const typeAnalyseId = parseInt(selectedExamen, 10);
        
        if (isNaN(patientId)) {
          console.error("❌ Invalid patient_id:", currentPatientId);
          toast.error("Patient invalide !");
          return;
        }

        if (isNaN(typeAnalyseId)) {
          console.error("❌ Invalid type_analyse_id:", selectedExamen);
          toast.error("Type d'analyse invalide !");
          return;
        }

        const examPayload = {
          patient_id:      patientId,
          type_analyse_id: typeAnalyseId,
        };

        console.log("📤 CAS 1 - Payload:", JSON.stringify(examPayload, null, 2));

        // ─── AXIOS WITH EXPLICIT HEADERS ──────────────────────
        const response = await axios.post(EXAMEN_URL, examPayload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });

        console.log("✅ CAS 1 - Full Response:", response.data);
        console.log("✅ CAS 1 - type_analyse_id in response:", 
          response.data?.data?.type_analyse_id
        );

        const ref = response.data?.data?.reference || response.data?.reference;
        if (ref) setGeneratedCode(ref);

        toast.success("Nouvel examen enregistré !");
        fetchAnalysesLyoum();
        closeAndReset();
        return;
      }

      // ── CAS 2: Modifier patient existant ───────────────────
      if (isEditing) {
        await axios.put(`${API_URL}/${patients[editIndex].id}`, newPatient, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Patient modifié !");
        fetchPatients(searchTerm);
        closeAndReset();
        return;
      }

      // ── CAS 3: Nouveau patient + examen ────────────────────
      const patientPayload = {
        nom:            newPatient.nom,
        prenom:         newPatient.prenom,
        cin:            newPatient.cin,
        telephone:      newPatient.telephone,
        sexe:           newPatient.sexe,
        date_naissance: newPatient.date_naissance,
      };

      console.log("1️⃣ CAS 3 - Patient payload:", patientPayload);

      const patientRes = await axios.post(API_URL, patientPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("2️⃣ CAS 3 - Patient response:", patientRes.data);

      const newPatientId = patientRes.data?.id || patientRes.data?.data?.id;
      
      console.log("3️⃣ CAS 3 - newPatientId:", newPatientId);
      console.log("4️⃣ CAS 3 - selectedExamen:", selectedExamen);
      console.log("5️⃣ CAS 3 - Condition check:", !!(newPatientId && selectedExamen));

      if (newPatientId && selectedExamen) {
        const typeAnalyseId = parseInt(selectedExamen, 10);
        
        if (isNaN(typeAnalyseId)) {
          console.error("❌ Invalid type_analyse_id in CAS 3:", selectedExamen);
          toast.error("Type d'analyse invalide !");
          return;
        }

        const examPayload = {
          patient_id:      newPatientId,
          type_analyse_id: typeAnalyseId,
        };

        console.log("6️⃣ CAS 3 - Exam payload:", JSON.stringify(examPayload, null, 2));

        const examRes = await axios.post(EXAMEN_URL, examPayload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });

        console.log("✅ CAS 3 - Exam response:", examRes.data);
        console.log("✅ CAS 3 - type_analyse_id in response:", 
          examRes.data?.data?.type_analyse_id
        );

        const ref = examRes.data?.data?.reference || examRes.data?.reference;
        if (ref) setGeneratedCode(ref);
      } else {
        console.warn("⚠️ CAS 3 - Condition failed:", { newPatientId, selectedExamen });
      }

      toast.success("Patient et examen enregistrés !");
      fetchPatients(searchTerm);
      fetchAnalysesLyoum();

    } catch (error) {
      console.error("❌ Full Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const msg = error.response?.data?.message
        || error.response?.data?.errors
        || "Erreur d'enregistrement";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  // ─── Status change ────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    try {
      const endpoint = newStatus === "valide"
        ? `${EXAMEN_URL}/${id}/valider`
        : `${EXAMEN_URL}/${id}/annuler`;

      await axios.patch(endpoint, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      toast.success(newStatus === "valide" ? "Examen validé !" : "Examen annulé !");
      fetchAnalysesLyoum();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  

  // ─── Modal helpers ────────────────────────────────────────
  const closeAndReset = () => {
    setShowModal(false);
    setGeneratedCode(null);
    setIsEditing(false);
    setIsNewExam(false);
    setCurrentPatientId(null);
    setSelectedExamen("");
    setNewPatient({ nom: "", prenom: "", cin: "", telephone: "", sexe: "M", date_naissance: "" });
  };

  const openNewExamModal = (patient) => {
    setNewPatient({
      nom:            patient.nom,
      prenom:         patient.prenom,
      cin:            patient.cin,
      telephone:      patient.telephone,
      sexe:           patient.sexe,
      date_naissance: patient.date_naissance
    });
    setCurrentPatientId(patient.id);
    setIsNewExam(true);
    setSelectedExamen("");
    setShowModal(true);
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="hl-dashboard-container">
      <aside className="hl-sidebar preleveur">
        <div className="hl-sidebar-header">
          <h1 className="hl-logo">Helix <span>Lab</span></h1>
        </div>
        <nav className="hl-nav">
          <button
            className={`hl-nav-btn ${activeTab === "patients" ? "active" : ""}`}
            onClick={() => setActiveTab("patients")}
          >
            <Users size={20} /> Liste Patients
          </button>
          <button
            className={`hl-nav-btn ${activeTab === "analyses" ? "active" : ""}`}
            onClick={() => setActiveTab("analyses")}
          >
            <ClipboardCheck size={20} /> Analyses du jour
          </button>

         <button
    className={`hl-nav-btn ${activeTab === "rendezvous" ? "active" : ""}`}
    onClick={() => setActiveTab("rendezvous")}
>
    
    <Calendar size={20} /> 
    Gestion des Rendez-vous
</button>
        </nav>
        <div className="hl-logout-section">
          <button onClick={() => { localStorage.clear(); navigate("/login"); }}>
            <LogOut size={20} /> Déconnexion
          </button>

         
        </div>

      </aside>

      
{activeTab === "rendezvous" && (
    <div style={{ width: '100%', flex: 1, padding: '20px' }}>
        <DashboardRendezVous />
    </div>
)}

      <main className="hl-main">
        <header className="hl-header">
          <h2>Espace {user.role}</h2>
          <div className="hl-user-info" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="hl-user-text">
              <p className="hl-user-name">{user.nom || user.name || "Ibrahim"}</p>
              <p className="hl-user-role">{user.role}</p>
            </div>
            <UserCircle size={38} color="#312e81" />
            {showUserMenu && (
              <div className="user-dropdown-menu">
                <button className="dropdown-item" onClick={() => navigate("/profil-preleveur")}>
                  <User size={16} /> Mon Profil
                </button>
                <button className="dropdown-item" onClick={() => navigate("/settings-preleveur")}>
                  <Settings size={16} /> Paramètres
                </button>
                <hr />
                <button
                  className="dropdown-item logout-item"
                  onClick={() => { localStorage.clear(); navigate("/login"); }}
                >
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="hl-content-body">

          {/* ── Tab: Liste Patients ── */}
          {activeTab === "patients" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px", alignItems: "center" }}>
                <div className="search-wrapper">
                  <div className="search-input-container">
                    <Search style={{ position: "absolute", left: "12px", top: "12px" }} size={18} color="#94a3b8" />
                    <input
                      className="hl-search-input"
                      type="text"
                      placeholder="Rechercher par CIN ou Nom..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <button className="btn-new-patient" onClick={() => setShowModal(true)}>
                  <Users size={18} /> Nouveau Patient
                </button>
              </div>

              <div className="hl-table-container">
                <table className="hl-table">
                  <thead>
                    <tr>
                      <th>Nom & Prénom</th>
                      <th>Sexe</th>
                      <th>CIN</th>
                      <th>Téléphone</th>
                      <th>Date Naissance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p, index) => (
                      <tr key={p.id}>
                        <td className="font-bold">{p.nom} {p.prenom}</td>
                        <td>{p.sexe === "M" ? "👨 M" : "👩 F"}</td>
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
                            Modifier
                          </button>
                          <button
                            className="btn-valider"
                            style={{ marginLeft: "8px" }}
                            onClick={() => openNewExamModal(p)}
                          >
                            Nouvel Examen
                          </button>
                          <button
                            className="btn-delete"
                            style={{ marginLeft: "8px" }}
                            onClick={async () => {
                              if (window.confirm("Supprimer ce patient ?")) {
                                const token = localStorage.getItem("token");
                                await axios.delete(`${API_URL}/${p.id}`, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                toast.success("Patient supprimé !");
                                fetchPatients(searchTerm);
                                notifyPatientCountUpdate();
                              }
                            }}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── Tab: Analyses du jour ── */}
          {activeTab === "analyses" && (
            <div className="hl-table-container">
              {analysesLoading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                  <p>Chargement...</p>
                </div>
              ) : analysesLyoum.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                  <p>Aucune analyse.</p>
                </div>
              ) : (
                <table className="hl-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Patient</th>
                      <th>Examen</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysesLyoum.map((ana) => (
                      <tr key={ana.id}>
                        <td className="font-bold">{ana.reference}</td>
                        <td>{ana.patient?.nom} {ana.patient?.prenom}</td>
                        <td>
                          {ana.lignes && ana.lignes.length > 0
                            ? ana.lignes.map((l, i) => (
                                <div key={i}>{l.analyse?.designation || "Examen"}</div>
                              ))
                            : ana.type_analyse?.libelle || "N/A"  /* FIX: libelle machi nom */
                          }
                        </td>
                        <td>
                          <span className={`status-badge ${ana.statut}`}>{ana.statut}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btn-valider"
                              onClick={() => handleStatusChange(ana.id, "valide")}
                            >
                              Valider
                            </button>
                            <button
                              className="btn-annuler"
                              style={{ marginLeft: "8px" }}
                              onClick={() =>
                                window.confirm("Annuler cet examen ?") &&
                                handleStatusChange(ana.id, "annule")
                              }
                            >
                              Annuler
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {isNewExam ? "Nouvel Examen" : isEditing ? "Modifier Patient" : "Inscription Patient"}
              </h3>
              <button onClick={closeAndReset} className="close-x"><X size={22} /></button>
            </div>

            {!generatedCode ? (
              <form onSubmit={handleSavePatient} className="modal-form">
                <div className="modal-form-row">
                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      type="text" value={newPatient.nom} required
                      readOnly={isNewExam}
                      onChange={(e) => setNewPatient({ ...newPatient, nom: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Prénom</label>
                    <input
                      type="text" value={newPatient.prenom} required
                      readOnly={isNewExam}
                      onChange={(e) => setNewPatient({ ...newPatient, prenom: e.target.value })}
                    />
                  </div>
                </div>

                

                <div className="modal-form-row">
                  <div className="form-group">
                    <label>Sexe</label>
                    <select
                      value={newPatient.sexe}
                      disabled={isNewExam}
                      onChange={(e) => setNewPatient({ ...newPatient, sexe: e.target.value })}
                    >
                      <option value="M">👨 Masculin</option>
                      <option value="F">👩 Féminin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date de Naissance</label>
                    <input
                      type="date" value={newPatient.date_naissance} required
                      readOnly={isNewExam}
                      onChange={(e) => setNewPatient({ ...newPatient, date_naissance: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>CIN</label>
                  <input
                    type="text" value={newPatient.cin} required
                    readOnly={isNewExam}
                    onChange={(e) => setNewPatient({ ...newPatient, cin: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel" value={newPatient.telephone} maxLength={10} required
                    readOnly={isNewExam}
                    onChange={(e) => setNewPatient({ ...newPatient, telephone: e.target.value })}
                  />
                </div>

                {(isNewExam || !isEditing) && (
                  <div className="form-group">
                    <label>Type d'Analyse</label>
                    {/* IDs réels depuis table type_analyses en DB */}
                    <select
                      value={selectedExamen}
                      onChange={(e) => setSelectedExamen(e.target.value)}
                      required
                    >
                      <option value="">-- Choisir --</option>
                      <option value="1">Biochimie</option>
                      <option value="2">Hématologie</option>
                    </select>
                  </div>
                )}

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeAndReset}>Annuler</button>
                  <button type="submit" className="btn-save">
                    {isNewExam ? "Créer Examen" : isEditing ? "Modifier" : "Enregistrer"}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <ClipboardCheck size={40} color="#4f46e5" />
                <h4>{isNewExam ? "Examen créé avec succès !" : "Code d'examen:"}</h4>
                <h1 style={{ fontSize: "30px", color: "#312e81" }}>{generatedCode}</h1>
                <button
                  className="btn-save"
                  style={{ width: "100%", marginTop: "20px" }}
                  onClick={closeAndReset}
                >
                  Terminer
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