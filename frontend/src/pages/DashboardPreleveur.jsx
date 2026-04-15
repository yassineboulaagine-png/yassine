import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Syringe, Users, CalendarClock, LogOut, UserCircle, X, ClipboardCheck, Search, Trash2, Settings, Mail, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import "./Dashboard.css";

const DashboardPreleveur = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("patients"); // patients, profil, rdv, prelevements
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // الداتا ديال المستخدم (كتجي من localStorage)
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { 
    name: "Yassine", 
    prenom: "Boulaagine", 
    email: "yassine@helixlab.ma", 
    cin: "AB12345", 
    role: "préleveur" 
  };

  const [patients, setPatients] = useState([
    { nom: "Yassine", prenom: "Boulaagine", cin: "AB12345", telephone: "0611223344", reference: "HL-26-GT54R" }
  ]);

  const [newPatient, setNewPatient] = useState({ nom: "", prenom: "", cin: "", telephone: "" });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Déconnexion réussie !");
    navigate("/login");
  };

  const handleSavePatient = (e) => {
    e.preventDefault();
    if (isEditing) {
      const updatedPatients = [...patients];
      updatedPatients[editIndex] = { ...newPatient, reference: patients[editIndex].reference };
      setPatients(updatedPatients);
      toast.success("Patient modifié !");
      closeAndReset();
    } else {
      const code = "HL-" + new Date().getFullYear().toString().slice(-2) + "-" + Math.random().toString(36).substr(2, 5).toUpperCase();
      setPatients([{ ...newPatient, reference: code }, ...patients]);
      setGeneratedCode(code);
      toast.success("Patient enregistré !");
    }
  };

  const handleDelete = (index) => {
    if (window.confirm("Supprimer ce patient ?")) {
      setPatients(patients.filter((_, i) => i !== index));
      toast.error("Patient supprimé !");
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
    setNewPatient({ nom: "", prenom: "", cin: "", telephone: "" });
  };

  return (
    <div className="hl-dashboard-container">
      {/* Sidebar */}
      <aside className="hl-sidebar preleveur">
        <div className="hl-sidebar-header">
          <h1 className="hl-logo">Helix <span>Lab</span></h1>
        </div>
        <nav className="hl-nav">
          <button className={`hl-nav-btn ${activeTab === 'prelevements' ? 'active' : ''}`} onClick={() => setActiveTab('prelevements')}>
            <Syringe size={20} /> Prélèvements
          </button>
          <button className={`hl-nav-btn ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
            <Users size={20} /> Liste Patients
          </button>
          <button className={`hl-nav-btn ${activeTab === 'rdv' ? 'active' : ''}`} onClick={() => setActiveTab('rdv')}>
            <CalendarClock size={20} /> Rendez-vous
          </button>
        </nav>
        <div className="hl-logout-section">
          <button onClick={handleLogout}><LogOut size={20} /> Déconnexion</button>
        </div>
      </aside>

      <main className="hl-main">
        {/* Header */}
        <header className="hl-header">
          <h2>Espace {user.role}</h2>
          <div className="hl-user-info">
            <div className="hl-user-text">
              <p className="hl-user-name">{user.nom || user.name} {user.prenom}</p>
              <p className="hl-user-role">{user.role}</p>
            </div>
            <div className="profile-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
              <UserCircle size={32} color="#312e81" />
            </div>

            {showUserMenu && (
              <div className="user-dropdown-menu fade-in">
                <div className="dropdown-item" onClick={() => { setActiveTab('profil'); setShowUserMenu(false); }}>
                  <UserCircle size={16} /> <span>Mon Profil</span>
                </div>
                <div className="dropdown-item" onClick={() => { setActiveTab('settings'); setShowUserMenu(false); }}>
                  <Settings size={16} /> <span>Paramètres</span>
                </div>
                <hr />
                <div className="dropdown-item logout-item" onClick={handleLogout}>
                  <LogOut size={16} /> <span>Déconnexion</span>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="hl-content-body">
          {/* View: Liste Patients */}
          {activeTab === 'patients' && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3>Gestion des Patients</h3>
                <button className="btn-new-patient" onClick={() => setShowModal(true)}>
                  <Users size={18} /> Nouveau Patient
                </button>
              </div>
              <div className="search-wrapper">
                <div className="search-input-container">
                  <Search size={18} className="search-icon" />
                  <input type="text" placeholder="Rechercher par CIN..." className="hl-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="hl-table-container">
                <table className="hl-table">
                  <thead>
                    <tr><th>Nom & Prénom</th><th>CIN</th><th>Téléphone</th><th>Référence</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {patients.filter(p => p.cin.toLowerCase().includes(searchTerm.toLowerCase())).map((p, index) => (
                      <tr key={index}>
                        <td className="font-bold">{p.nom} {p.prenom}</td>
                        <td>{p.cin}</td>
                        <td>{p.telephone}</td>
                        <td style={{color: '#4f46e5', fontWeight: '700'}}>{p.reference}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-modifier" onClick={() => handleEditClick(index)}>Modifier</button>
                            <button className="btn-delete" onClick={() => handleDelete(index)}>Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View: Mon Profil (الجديدة) */}
          {activeTab === 'profil' && (
            <div className="fade-in">
              <div style={{ marginBottom: '20px' }}>
                <h3>Mon Profil</h3>
              </div>
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar-large">
                    <UserCircle size={48} />
                  </div>
                  <div>
                    <h4 style={{margin: 0, fontSize: '20px'}}>{user.nom || user.name} {user.prenom}</h4>
                    <p style={{margin: 0, color: '#64748b'}}>{user.role} Helix Lab</p>
                  </div>
                </div>

                <div className="info-grid">
                  <div className="info-item">
                    <label>Nom Complet</label>
                    <p>{user.nom || user.name} {user.prenom}</p>
                  </div>
                  <div className="info-item">
                    <label>CIN</label>
                    <p>{user.cin}</p>
                  </div>
                  <div className="info-item">
                    <label>Email Professionnel</label>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Mail size={14} color="#64748b" />
                      <p>{user.email}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Statut du compte</label>
                    <div style={{display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981'}}>
                      <ShieldCheck size={14} />
                      <p style={{color: '#10b981'}}>Actif</p>
                    </div>
                  </div>
                </div>

                <button className="btn-change-password" onClick={() => toast.info("Fonctionnalité bientôt disponible")}>
                  <KeyRound size={18} /> Changer le mot de passe
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal - نفس الكود ديالك بلا تغيير */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>{isEditing ? "Modifier Patient" : "Inscription Patient"}</h3>
              <button onClick={closeAndReset} className="close-x"><X size={20} /></button>
            </div>
            <hr style={{ margin: '15px 0', opacity: 0.1 }} />
            {!generatedCode ? (
              <form onSubmit={handleSavePatient} className="modal-form">
                <div className="form-group"><label>Nom</label><input type="text" value={newPatient.nom} required onChange={(e) => setNewPatient({...newPatient, nom: e.target.value})} /></div>
                <div className="form-group"><label>Prénom</label><input type="text" value={newPatient.prenom} required onChange={(e) => setNewPatient({...newPatient, prenom: e.target.value})} /></div>
                <div className="form-group"><label>CIN</label><input type="text" value={newPatient.cin} required onChange={(e) => setNewPatient({...newPatient, cin: e.target.value})} /></div>
                <div className="form-group"><label>Téléphone</label><input type="tel" value={newPatient.telephone} maxLength={10} required onChange={(e) => {const v=e.target.value; if(/^\d*$/.test(v))setNewPatient({...newPatient, telephone:v})}} /></div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeAndReset}>Annuler</button>
                  <button type="submit" className="btn-save">{isEditing ? "Mettre à jour" : "Enregistrer"}</button>
                </div>
              </form>
            ) : (
              <div className="code-display fade-in">
                <div style={{textAlign: 'center', background: '#f8fafc', padding: '20px', borderRadius: '12px'}}>
                  <ClipboardCheck size={40} color="#4f46e5" />
                  <p>Patient enregistré !</p>
                  <h1 style={{fontSize: '28px', color: '#312e81'}}>{generatedCode}</h1>
                </div>
                <button className="btn-save" style={{width: '100%', marginTop: '15px'}} onClick={closeAndReset}>Terminer</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPreleveur;