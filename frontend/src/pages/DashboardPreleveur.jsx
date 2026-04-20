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
  const [editIndex, setEditIndex] = useState(null);
  const [patients, setPatients] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newPatient, setNewPatient] = useState({ 
    nom: "", prenom: "", cin: "", telephone: "", sexe: "M", date_naissance: "" 
  });

  // Hada ghir data tajribiya (Static) bach t-ban lik l-table dial l-analyses lyoum
  const [analysesLyoum] = useState([
    { id: 1, patient: "Anas Mterem", examen: "NFS (Hémogramme)", statut: "En attente" }
  ]);

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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPatients(searchTerm);
    }, 400); 
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSavePatient = async (e) => {
    e.preventDefault();
    const payload = { ...newPatient, utilisateur_id: user.id, medecin_id: 1 };
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${patients[editIndex].id}`, payload);
        toast.success("Patient modifié !");
      } else {
        const response = await axios.post(API_URL, payload);
        if (response.data?.reference) setGeneratedCode(response.data.reference);
        toast.success("Patient enregistré !");
      }
      fetchPatients(searchTerm);
      if (!isEditing && !generatedCode) closeAndReset();
      if (isEditing) closeAndReset();
    } catch (error) {
      toast.error("Erreur d'enregistrement");
    }
  };

  const closeAndReset = () => {
    setShowModal(false);
    setGeneratedCode(null);
    setIsEditing(false);
    setNewPatient({ nom: "", prenom: "", cin: "", telephone: "", sexe: "M", date_naissance: "" });
  };

  return (
    <div className="hl-dashboard-container">
      <aside className="hl-sidebar preleveur">
        <div className="hl-sidebar-header"><h1 className="hl-logo">Helix <span>Lab</span></h1></div>
        <nav className="hl-nav">
          <button className={`hl-nav-btn ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
            <Users size={20} /> Liste Patients
          </button>
          
          {/* BOUTON JDID DYAL ANALYSES */}
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
                <button className="dropdown-item" onClick={() => navigate("/profil")}><User size={16} /> Mon Profil</button>
                <button className="dropdown-item" onClick={() => navigate("/settings")}><Settings size={16} /> Paramètres</button>
                <hr />
                <button className="dropdown-item logout-item" onClick={() => { localStorage.clear(); navigate("/login"); }}><LogOut size={16} /> Déconnexion</button>
              </div>
            )}
          </div>
        </header>

        <div className="hl-content-body">
          
          {/* --- VIEW 1: PATIENTS --- */}
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
                          <button className="btn-delete" style={{ marginLeft: '8px' }} onClick={async () => { if(window.confirm("Supprimer?")) { await axios.delete(`${API_URL}/${p.id}`); fetchPatients(searchTerm); } }}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* --- VIEW 2: ANALYSES (L-JDID) --- */}
          {activeTab === "analyses" && (
            <div className="hl-table-container">
              <table className="hl-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Examen</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analysesLyoum.map((ana) => (
                    <tr key={ana.id}>
                      <td className="font-bold">{ana.patient}</td>
                      <td>{ana.examen}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          backgroundColor: '#fef3c7', 
                          color: '#d97706' 
                        }}>
                          {ana.statut}
                        </span>
                      </td>
                      <td>
                        <button className="btn-save" onClick={() => toast.success("Prélèvement validé !")}>
                          Valider
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

      {/* MODAL (B9a kima houwa) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? "Modifier Patient" : "Inscription Patient"}</h3>
              <button onClick={closeAndReset} className="close-x"><X size={22} /></button>
            </div>
            
            {!generatedCode ? (
              <form onSubmit={handleSavePatient} className="modal-form">
                <div className="modal-form-row">
                  <div className="form-group"><label>Nom</label><input type="text" value={newPatient.nom} required onChange={(e) => setNewPatient({...newPatient, nom: e.target.value})} /></div>
                  <div className="form-group"><label>Prénom</label><input type="text" value={newPatient.prenom} required onChange={(e) => setNewPatient({...newPatient, prenom: e.target.value})} /></div>
                </div>
                <div className="modal-form-row">
                  <div className="form-group">
                    <label>Sexe</label>
                    <select value={newPatient.sexe} onChange={(e) => setNewPatient({...newPatient, sexe: e.target.value})}>
                      <option value="M">👨 Masculin (M)</option>
                      <option value="F">👩 Féminin (F)</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Date de Naissance</label><input type="date" value={newPatient.date_naissance} required onChange={(e) => setNewPatient({...newPatient, date_naissance: e.target.value})} /></div>
                </div>
                <div className="form-group"><label>CIN</label><input type="text" value={newPatient.cin} required onChange={(e) => setNewPatient({...newPatient, cin: e.target.value})} /></div>
                <div className="form-group"><label>Téléphone</label><input type="tel" value={newPatient.telephone} maxLength={10} required onChange={(e) => setNewPatient({...newPatient, telephone: e.target.value})} /></div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeAndReset}>Annuler</button>
                  <button type="submit" className="btn-save">{isEditing ? "Modifier" : "Enregistrer"}</button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <ClipboardCheck size={40} color="#4f46e5" />
                <h4>Code d'examen:</h4>
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