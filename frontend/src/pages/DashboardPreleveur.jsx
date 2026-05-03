import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import { 
  Users, LogOut, UserCircle, X, ClipboardCheck, 
  Trash2, ChevronDown, User, Settings, Search 
} from "lucide-react";
import { toast } from "sonner";
import "./Dashboard.css";

const API_URL = "http://localhost:8000/api/patients";

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  
  const [newPatient, setNewPatient] = useState({ 
    nom: "", prenom: "", cin: "", telephone: "", sexe: "M", date_naissance: "" 
  });

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { id: 1, name: "Ibrahim", role: "Prélèveur" };

  const fetchPatients = async (query = "") => {
    try {
      const response = await axios.get(`${API_URL}?search=${query}`);
      setPatients(response.data);
    } catch (error) {
      console.error("API error:", error);
      setPatients([]);
    }
  };

  const fetchAnalysesLyoum = async (isInitial = false) => {
    try {
      if (isInitial) setAnalysesLoading(true);
      const response = await axios.get("http://localhost:8000/api/examens-today");
      setAnalysesLyoum(response.data);
      if (isInitial) {
        setIsInitialLoad(false);
        setAnalysesLoading(false);
      }
    } catch (error) {
      console.error("Error fetching analyses:", error);
      if (isInitial) setAnalysesLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPatients(searchTerm);
    }, 400); 
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    fetchAnalysesLyoum(true);
    const interval = setInterval(() => {
      fetchAnalysesLyoum(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSavePatient = async (e) => {
    e.preventDefault();
    const payload = { 
      ...newPatient, 
      utilisateur_id: user.id, 
      medecin_id: 1,
      nom_analyse: selectedExamen
    };
    
    // If creating a new exam for an existing patient, include patient_id
    if (isNewExam && currentPatientId) {
      payload.patient_id = currentPatientId;
    }
    
    console.log("📤 Sending payload:", payload);
    try {
      if (isEditing && !isNewExam) {
        await axios.put(`${API_URL}/${patients[editIndex].id}`, payload);
        toast.success("Patient modifié !");
      } else {
        const response = await axios.post(API_URL, payload);
        if (response.data?.reference) setGeneratedCode(response.data.reference);
        toast.success(isNewExam ? "Nouvel examen enregistré !" : "Patient enregistré !");
        fetchAnalysesLyoum();
      }
      fetchPatients(searchTerm);
      if (isEditing && !isNewExam) closeAndReset();
    } catch (error) {
      console.error("❌ Error details:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.response?.data?.errors || "Erreur d'enregistrement";
      toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const endpoint = newStatus === 'valide' 
        ? `http://localhost:8000/api/examens/${id}/valider`
        : `http://localhost:8000/api/examens/${id}/annuler`;
      
      await axios.patch(endpoint);
      toast.success(newStatus === 'valide' ? "Examen validé !" : "Examen annulé !");
      fetchAnalysesLyoum();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

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
    // Pre-fill patient info for new exam
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
    setSelectedExamen(""); // Clear analysis selection
    setShowModal(true);
  };

  return (
    <div className="hl-dashboard-container">
      <aside className="hl-sidebar preleveur">
        <div className="hl-sidebar-header"><h1 className="hl-logo">Helix <span>Lab</span></h1></div>
        <nav className="hl-nav">
          <button className={`hl-nav-btn ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
            <Users size={20} /> Liste Patients
          </button>
          <button className={`hl-nav-btn ${activeTab === 'analyses' ? 'active' : ''}`} onClick={() => setActiveTab('analyses')}>
            <ClipboardCheck size={20} /> Analyses du jour
          </button>
        </nav>
        <div className="hl-logout-section">
          <button onClick={() => { localStorage.clear(); navigate("/login"); }}><LogOut size={20} /> Déconnexion</button>
        </div>
      </aside>

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
                <button className="dropdown-item" onClick={() => navigate("/profil-preleveur")}><User size={16} /> Mon Profil</button>
                <button className="dropdown-item" onClick={() => navigate("/settings-preleveur")}><Settings size={16} /> Paramètres</button>
                <hr />
                <button className="dropdown-item logout-item" onClick={() => { localStorage.clear(); navigate("/login"); }}><LogOut size={16} /> Déconnexion</button>
              </div>
            )}
          </div>
        </header>

        <div className="hl-content-body">
          {activeTab === "patients" && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
                <div className="search-wrapper">
                  <div className="search-input-container">
                    <Search style={{ position: 'absolute', left: '12px', top: '12px' }} size={18} color="#94a3b8" />
                    <input 
                      className="hl-search-input"
                      type="text" 
                      placeholder="Rechercher par CIN ou Nom..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <button className="btn-new-patient" onClick={() => setShowModal(true)}><Users size={18} /> Nouveau Patient</button>
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
                        <td>{p.sexe === 'M' ? '👨 M' : '👩 F'}</td>
                        <td>{p.cin}</td>
                        <td>{p.telephone}</td>
                        <td>{p.date_naissance}</td>
                        <td>
                          <button className="btn-modifier" onClick={() => { setNewPatient(p); setEditIndex(index); setIsEditing(true); setShowModal(true); }}>Modifier</button>
                          <button className="btn-valider" style={{ marginLeft: '8px' }} onClick={() => openNewExamModal(p)}>Nouvel Examen</button>
                          <button className="btn-delete" style={{ marginLeft: '8px' }} onClick={async () => { if(window.confirm("Supprimer?")) { await axios.delete(`${API_URL}/${p.id}`); fetchPatients(searchTerm); } }}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "analyses" && (
            <div className="hl-table-container">
              {analysesLoading ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}><p>Chargement...</p></div>
              ) : analysesLyoum.length === 0 ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}><p>Aucune analyse.</p></div>
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
                            ? ana.lignes.map((l, i) => <div key={i}>{l.analyse?.designation || "Examen"}</div>) 
                            : "N/A"}
                        </td>
                        <td><span className={`status-badge ${ana.statut}`}>{ana.statut}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-valider" onClick={() => handleStatusChange(ana.id, 'valide')}>Valider</button>
                            <button className="btn-annuler" onClick={() => window.confirm("Annuler?") && handleStatusChange(ana.id, 'annule')} style={{ marginLeft: '8px' }}>Annuler</button>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isNewExam ? "Nouvel Examen" : isEditing ? "Modifier Patient" : "Inscription Patient"}</h3>
              <button onClick={closeAndReset} className="close-x"><X size={22} /></button>
            </div>
            {!generatedCode ? (
              <form onSubmit={handleSavePatient} className="modal-form">
                <div className="modal-form-row">
                  <div className="form-group"><label>Nom</label><input type="text" value={newPatient.nom} required readOnly={isNewExam} onChange={(e) => setNewPatient({...newPatient, nom: e.target.value})} /></div>
                  <div className="form-group"><label>Prénom</label><input type="text" value={newPatient.prenom} required readOnly={isNewExam} onChange={(e) => setNewPatient({...newPatient, prenom: e.target.value})} /></div>
                </div>
                <div className="modal-form-row">
                  <div className="form-group">
                    <label>Sexe</label>
                    <select value={newPatient.sexe} disabled={isNewExam} onChange={(e) => setNewPatient({...newPatient, sexe: e.target.value})}>
                      <option value="M">👨 Masculin</option>
                      <option value="F">👩 Féminin</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Date de Naissance</label><input type="date" value={newPatient.date_naissance} required readOnly={isNewExam} onChange={(e) => setNewPatient({...newPatient, date_naissance: e.target.value})} /></div>
                </div>
                <div className="form-group"><label>CIN</label><input type="text" value={newPatient.cin} required readOnly={isNewExam} onChange={(e) => setNewPatient({...newPatient, cin: e.target.value})} /></div>
                <div className="form-group"><label>Téléphone</label><input type="tel" value={newPatient.telephone} maxLength={10} required readOnly={isNewExam} onChange={(e) => setNewPatient({...newPatient, telephone: e.target.value})} /></div>
                {(isNewExam || !isEditing) && (
                  <div className="form-group">
                    <label>Type d'Analyse</label>
                    <select value={selectedExamen} onChange={(e) => setSelectedExamen(e.target.value)} required>
                      <option value="">-- Choisir --</option>
                      <option value="NFS (Hémogramme)">NFS (Hémogramme)</option>
                      <option value="Glycémie à jeun">Glycémie à jeun</option>
                      <option value="Bilan Lipidique">Bilan Lipidique</option>
                    </select>
                  </div>
                )}
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeAndReset}>Annuler</button>
                  <button type="submit" className="btn-save">{isNewExam ? "Créer Examen" : isEditing ? "Modifier" : "Enregistrer"}</button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <ClipboardCheck size={40} color="#4f46e5" />
                <h4>{isNewExam ? "Examen créé avec succès !" : "Code d'examen:"}</h4>
                <h1 style={{ fontSize: '30px', color: '#312e81' }}>{generatedCode}</h1>
                <button className="btn-save" style={{ width: '100%', marginTop: '20px' }} onClick={closeAndReset}>Terminer</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPreleveur;