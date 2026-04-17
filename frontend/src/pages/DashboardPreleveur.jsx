import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import { 
  Users, LogOut, UserCircle, X, ClipboardCheck, 
  Trash2, ChevronDown, User, Settings 
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
  
  const [newPatient, setNewPatient] = useState({ 
    nom: "", 
    prenom: "", 
    cin: "", 
    telephone: "",
    sexe: "M", 
    date_naissance: "" 
  });

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { id: 1, name: "Yassine", role: "Prélèveur" };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(API_URL);
      setPatients(response.data);
    } catch (error) {
      console.error("API error:", error);
      setPatients([]);
    }
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    if (newPatient.telephone.length !== 10) {
      toast.error("Le numéro de téléphone doit contenir 10 chiffres");
      return;
    }

    const payload = { ...newPatient, utilisateur_id: user.id, medecin_id: 1 };

    try {
      if (isEditing) {
        const patientId = patients[editIndex].id;
        await axios.put(`${API_URL}/${patientId}`, payload);
        toast.success("Patient modifié !");
        await fetchPatients();
        closeAndReset();
      } else {
        const response = await axios.post(API_URL, payload);
        if (response.status === 201 || response.status === 200) {
          if (response.data && response.data.reference) {
            setGeneratedCode(response.data.reference);
            toast.success("Patient et Examen enregistrés !");
          } else {
            toast.success("Patient enregistré !");
            closeAndReset();
          }
          await fetchPatients();
        }
      }
    } catch (error) {
      if (error.response?.status === 201 || error.response?.status === 200) {
        await fetchPatients();
        closeAndReset();
      } else {
        toast.error("Erreur d'enregistrement");
      }
    }
  };

  const handleDelete = async (index) => {
    if (window.confirm("Supprimer ce patient ?")) {
      try {
        const patientId = patients[index].id;
        await axios.delete(`${API_URL}/${patientId}`);
        toast.error("Patient supprimé !");
        fetchPatients();
      } catch (error) {
        toast.error("Erreur de suppression");
      }
    }
  };

  const handleEditClick = (index) => {
    setNewPatient(patients[index]);
    setEditIndex(index);
    setIsEditing(true);
    setShowModal(true);
  };

  const closeAndReset = () => {
    setShowModal(false);
    setGeneratedCode(null);
    setIsEditing(false);
    setNewPatient({ nom: "", prenom: "", cin: "", telephone: "", sexe: "M", date_naissance: "" });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="hl-dashboard-container">
      <aside className="hl-sidebar preleveur">
        <div className="hl-sidebar-header"><h1 className="hl-logo">Helix <span>Lab</span></h1></div>
        <nav className="hl-nav">
          <button className={`hl-nav-btn ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}><Users size={20} /> Liste Patients</button>
        </nav>
        <div className="hl-logout-section">
          <button onClick={handleLogout}><LogOut size={20} /> Déconnexion</button>
        </div>
      </aside>

      <main className="hl-main">
        <header className="hl-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          <h2>Espace {user.role}</h2>
          
          <div className="hl-user-container" style={{ position: 'relative' }}>
            <div 
              className="hl-user-info" 
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <div className="hl-user-text" style={{ textAlign: 'right' }}>
                <p className="hl-user-name" style={{ fontWeight: 'bold', margin: 0 }}>{user.nom || user.name}</p>
                <p className="hl-user-role" style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{user.role}</p>
              </div>
              <div style={{ position: 'relative' }}>
                <UserCircle size={38} color="#312e81" />
                <div style={{ position: 'absolute', bottom: -2, right: -2, background: 'white', borderRadius: '50%', border: '1px solid #e2e8f0' }}>
                  <ChevronDown size={14} color="#64748b" />
                </div>
              </div>
            </div>

            {showUserMenu && (
              <div className="hl-dropdown-menu fade-in" style={{
                position: 'absolute', top: '110%', right: 0, 
                background: 'white', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                width: '200px', zIndex: 1000, border: '1px solid #f1f5f9'
              }}>
                <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{user.email || "Compte"}</p>
                </div>
                {/* دابا هادو غادي يخدمو بالـ navigate */}
                <button className="dropdown-item" style={dropdownItemStyle} onClick={() => navigate("/profil")}>
                  <User size={16} /> Mon Profil
                </button>
                <button className="dropdown-item" style={dropdownItemStyle} onClick={() => navigate("/settings")}>
                  <Settings size={16} /> Paramètres
                </button>
                <button className="dropdown-item" onClick={handleLogout} style={{ ...dropdownItemStyle, color: '#ef4444' }}>
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="hl-content-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
            <h3 style={{ fontSize: '20px' }}>Gestion des Patients</h3>
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
                  <tr key={p.id || index}>
                    <td className="font-bold">{p.nom} {p.prenom}</td>
                    <td>{p.sexe === 'M' ? '👨 M' : '👩 F'}</td>
                    <td>{p.cin}</td>
                    <td>{p.telephone}</td>
                    <td>{p.date_naissance}</td>
                    <td>
                      <button className="btn-modifier" onClick={() => handleEditClick(index)}>Modifier</button>
                      <button className="btn-delete" onClick={() => handleDelete(index)} style={{marginLeft: '8px'}}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>{isEditing ? "Modifier Patient" : "Inscription Patient"}</h3>
              <button onClick={closeAndReset} className="close-x"><X size={22} /></button>
            </div>
            {!generatedCode ? (
              <form onSubmit={handleSavePatient} className="modal-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                  <div className="form-group"><label>Nom</label><input type="text" value={newPatient.nom} required onChange={(e) => setNewPatient({...newPatient, nom: e.target.value})} /></div>
                  <div className="form-group"><label>Prénom</label><input type="text" value={newPatient.prenom} required onChange={(e) => setNewPatient({...newPatient, prenom: e.target.value})} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                  <div className="form-group">
                    <label>Sexe</label>
                    <select value={newPatient.sexe} onChange={(e) => setNewPatient({...newPatient, sexe: e.target.value})}>
                      <option value="M">👨 Masculin (M)</option>
                      <option value="F">👩 Féminin (F)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date de Naissance</label>
                    <input type="date" value={newPatient.date_naissance} required onChange={(e) => setNewPatient({...newPatient, date_naissance: e.target.value})} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}><label>CIN</label><input type="text" value={newPatient.cin} required onChange={(e) => setNewPatient({...newPatient, cin: e.target.value})} /></div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Téléphone</label>
                  <input type="tel" value={newPatient.telephone} maxLength={10} required onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*$/.test(v)) setNewPatient({...newPatient, telephone: v});
                  }} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeAndReset}>Annuler</button>
                  <button type="submit" className="btn-save">{isEditing ? "Modifier" : "Enregistrer"}</button>
                </div>
              </form>
            ) : (
              <div className="code-display fade-in">
                <div style={{ textAlign: 'center', background: '#f0f9ff', padding: '25px', borderRadius: '15px' }}>
                  <ClipboardCheck size={35} color="#4f46e5" />
                  <h4 style={{ color: '#0369a1' }}>Patient enregistré !</h4>
                  <div style={{ background: 'white', padding: '15px', borderRadius: '10px', marginTop: '15px' }}>
                    <h1 style={{ fontSize: '32px', color: '#312e81', letterSpacing: '2px' }}>{generatedCode}</h1>
                  </div>
                </div>
                <button className="btn-save" style={{ width: '100%', marginTop: '20px' }} onClick={closeAndReset}>Terminer</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const dropdownItemStyle = {
  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
  padding: '12px 15px', border: 'none', background: 'none',
  textAlign: 'left', fontSize: '14px', cursor: 'pointer', color: '#475569',
  transition: 'background 0.2s'
};

export default DashboardPreleveur;