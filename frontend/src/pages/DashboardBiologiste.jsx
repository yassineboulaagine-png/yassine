import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Microscope, CheckCircle, ClipboardList, LogOut, UserCircle, X, AlertCircle, Settings, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import ResultDetailsModal from "@/components/ResultDetailsModal";
import "./Dashboard.css";
import { t } from "i18next";


const DashboardBiologiste = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analyses");
  const [analysesLyoum, setAnalysesLyoum] = useState([]);
  const [examenValidation, setExamenValidation] = useState([]);
  const [examenHistorique, setExamenHistorique] = useState([]);
  const [analysesLoading, setAnalysesLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [previousLength, setPreviousLength] = useState(0);
  const [showSaisieModal, setShowSaisieModal] = useState(false);
  const [selectedExamen, setSelectedExamen] = useState(null);
  const [results, setResults] = useState({});
  const [biologiste, setBiologiste] = useState(null);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [selectedGraphExamen, setSelectedGraphExamen] = useState(null);

  useEffect(() => {
  const fetchBiologiste = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://projet_pff.test/api/me",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setBiologiste(response.data);
    } catch (error) {
      console.error("Error fetching biologiste:", error);
    }
  };

  fetchBiologiste();
}, []);

  // قراءة بيانات المستخدم
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { name: "Biologiste", role: "biologiste" };

  // Helper: Calculate age from date_naissance
  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    
    // Handle different date formats
    const today = new Date();
    const birth = new Date(birthDate);
    
    // Check if date is valid
    if (isNaN(birth.getTime())) return '-';
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : '-';
  };

  // Helper: Check if value is abnormal for specific analyses
  const isAbnormalValue = (analysisName, value) => {
    if (!value) return false;
    const val = parseFloat(value);
    
    const ranges = {
      'Glycémie': { min: 0.70, max: 1.10 },
      'Hémoglobine': { min: 12, max: 17 },
      'Plaquettes': { min: 150, max: 400 },
      'Globules Rouges': { min: 4, max: 6 },
    };
    
    const range = Object.keys(ranges).find(key => analysisName?.includes(key));
    if (!range) return false;
    
    return val < ranges[range].min || val > ranges[range].max;
  };

  const fetchAnalysesLyoum = async (isInitial = false) => {
    try {
      if (isInitial) setAnalysesLoading(true);
      const response = await axios.get("http://projet_pff.test/api/examens-biologiste");
      
      // Toast notification if new exams arrived
      if (!isInitial && response.data.length > previousLength) {
        toast.success(`${response.data.length - previousLength} nouvelle(s) analyse(s)!`);
      }
      
      setAnalysesLyoum(response.data);
      setPreviousLength(response.data.length);
      
      if (isInitial) {
        setIsInitialLoad(false);
        setAnalysesLoading(false);
      }
    } catch (error) {
      console.error("Error fetching analyses:");
      console.log(error);
       console.log(error.response);
  console.log(error.response?.data);
  console.log(error.response?.data?.message);
      if (isInitial) setAnalysesLoading(false);
    }
  };

  const fetchValidation = async () => {
    try {
      const response = await axios.get("http://projet_pff.test/api/examens-validation");
      setExamenValidation(response.data);
    } catch (error) {
      console.error("Error fetching validation:", error);
    }
  };

  const fetchHistorique = async () => {
    try {
      const response = await axios.get("http://projet_pff.test/api/examens-historique");
      setExamenHistorique(response.data);
    } catch (error) {
      console.error("Error fetching historique:", error);
    }
  };

  useEffect(() => {
    fetchAnalysesLyoum(true);
    const interval = setInterval(() => {
      fetchAnalysesLyoum(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'validation') {
      fetchValidation();
    } else if (activeTab === 'historique') {
      fetchHistorique();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Déconnexion réussie !");
    navigate("/login");
  };

  const openSaisieModal = (examen) => {
    setSelectedExamen(examen);
    const initialResults = {};
    examen.lignes?.forEach(ligne => {
      initialResults[ligne.id] = {
        valeur: ligne.valeur_resultat || '',
        commentaire: ligne.commentaire || '',
      };
    });
    setResults(initialResults);
    setShowSaisieModal(true);
  };

  const closeSaisieModal = () => {
    setShowSaisieModal(false);
    setSelectedExamen(null);
    setResults({});
  };

  const handleSaveResults = async () => {
    if (!selectedExamen) return;

    const resultatsArray = Object.entries(results).map(([ligneId, data]) => ({
      ligne_id: parseInt(ligneId),
      valeur: data.valeur,
      commentaire: data.commentaire,
    }));

    console.log("Sending resultats:", resultatsArray);

    try {
      const response = await axios.post(
        `http://projet_pff.test/api/examens/${selectedExamen.id}/resultats`,
        { resultats: resultatsArray },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      console.log("Success response:", response.data);
      toast.success("Résultats saisis! en_cours de validation.");
      closeSaisieModal();
      fetchAnalysesLyoum(false);
      fetchValidation();
    } catch (error) {
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleFinalApprove = async (id) => {
    try {
      await axios.patch(
        `http://projet_pff.test/api/examens/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      toast.success("Examen approuvé!");
      fetchValidation();
      fetchHistorique();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'approbation");
    }
  };

  const handleReject = async (id) => {
  if (window.confirm("Voulez-vous renvoyer cet examen à la saisie pour modification ?")) {
    try {
      // Kat-sift l-statut 'en_cours' bach i-welli i-bane f "Mes Analyses"
      await axios.put(
        `http://projet_pff.test/api/examens/${id}/reject`,
        { statut: 'rejete' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      // Update local state bach i-t-7eyed mn l-Validation
      setExamenValidation(examenValidation.filter(ana => ana.id !== id));
      toast.info("Examen renvoyé pour modification");
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      toast.error("Erreur lors de la modification");
    }
  }
};

  const openGraphModal = (ana) => {
    setSelectedGraphExamen(ana);
    setShowGraphModal(true);
  };

  const closeGraphModal = () => {
    setShowGraphModal(false);
    setSelectedGraphExamen(null);
  };

  return (
    <div className="hl-dashboard-container">
      {/* Sidebar - اللون الأخضر كيكون بـ كلاس biologiste */}
      <aside className="hl-sidebar biologiste">
        <div className="hl-sidebar-header">
          <h1 className="hl-logo">Helix <span>Lab</span></h1>
        </div>
        <nav className="hl-nav">
          <button 
            className={`hl-nav-btn ${activeTab === 'analyses' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyses')}
          >
            <Microscope size={20} /> Mes Analyses
          </button>
          
          <button 
            className={`hl-nav-btn ${activeTab === 'validation' ? 'active' : ''}`}
            onClick={() => setActiveTab('validation')}
          >
            <CheckCircle size={20} /> Validation
          </button>
          
          <button 
            className={`hl-nav-btn ${activeTab === 'historique' ? 'active' : ''}`}
            onClick={() => setActiveTab('historique')}
          >
            <ClipboardList size={20} /> Historique
          </button>
        </nav>
        
        <div className="hl-logout-section">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-300 hover:bg-red-500/10" onClick={handleLogout}>
            <LogOut size={20} /> Déconnexion
          </Button>
        </div>
      </aside>

      <main className="hl-main">
        <header className="hl-header">
          <h2>Espace Biologiste</h2>
          <div className="hl-user-info">
            <div className="hl-user-text">
             <p className="hl-user-name">
  {biologiste ? biologiste.name : ""}
</p>

<p className="hl-user-role">
  {biologiste ? biologiste.role : ""}
</p>
            </div>
            <UserCircle 
  size={32} 
  color="#14532d"
  style={{ cursor: "pointer" }}
  onClick={() => navigate("/profil-biologiste")}
/>

<Settings 
  size={28} 
  color="#14532d"
  style={{ cursor: "pointer", marginLeft: "10px" }}
  onClick={() => navigate("/settings-biologiste")}
/>
          </div>
        </header>

        <div className="hl-content-body">
          {/* المحتوى يتغير حسب التاب */}
          {activeTab === 'analyses' && (
            <div className="hl-table-container">
              {analysesLoading ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}><p>Chargement...</p></div>
              ) : analysesLyoum.length === 0 ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}><p>Aucune analyse en_cours.</p></div>
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
                            : ana.type_analyse?.libelle || "N/A"}
                        </td>
                        <td><span className={`status-badge ${ana.statut}`}>{ana.statut}</span></td>
                        <td>
                          <button className="btn-valider" onClick={() => openSaisieModal(ana)}>Saisir</button>
                        </td>
                      </tr>


                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="hl-table-container">
              {examenValidation.length === 0 ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}><p>Aucune analyse en_cours de validation.</p></div>
              ) : (
                <table className="hl-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Patient</th>
                      <th>Examen</th>
                      <th>Résultats</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examenValidation.map((ana) => (
                      <tr key={ana.id}>
                        <td className="font-bold">{ana.reference}</td>
                        <td>{ana.patient?.nom} {ana.patient?.prenom}</td>
                        <td>
                          {ana.lignes && ana.lignes.length > 0 
                            ? ana.lignes.map((l, i) => <div key={i}>{l.analyse?.designation}</div>) 
                            : ana.type_analyse?.libelle || "N/A"}
                        </td>
                        <td>
                          {ana.lignes && ana.lignes.length > 0 
                            ? ana.lignes.map((l, i) => <div key={i} style={{fontSize: '0.9em'}}>{l.valeur_resultat || "-"}</div>) 
                            : "N/A"}
                        </td>
                        <td>
                          <button className="btn-valider" onClick={() => handleFinalApprove(ana.id)}>Approuver</button>
                          <button 
                            className="eye-icon-btn"
                            onClick={() => openGraphModal(ana)}
                            title="Voir le graphique"
                            style={{ 
                              backgroundColor: '#3b82f6', 
                              color: 'white', 
                              border: 'none', 
                              padding: '8px 12px', 
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              fontWeight: '600',
                              marginLeft: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Eye size={16} /> Voir
                          </button>
                          <button 
    onClick={() => handleReject(ana.id)} 
    style={{ 
      backgroundColor: '#efb044', 
      color: 'white', 
      border: 'none', 
      padding: '8px 15px', 
      borderRadius: '6px', 
      cursor: 'pointer',
      fontWeight: '600',
      marginLeft: '8px'
    }}
  >
    Modifier
  </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'historique' && (
            <div className="hl-table-container">
              {examenHistorique.length === 0 ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}><p>Aucun historique.</p></div>
              ) : (
                <table className="hl-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Patient</th>
                      <th>Examen</th>
                      <th>Résultats</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examenHistorique.map((ana) => (
                      <tr key={ana.id}>
                        <td className="font-bold">{ana.reference}</td>
                        <td>{ana.patient?.nom} {ana.patient?.prenom}</td>
                        <td>
                          {ana.lignes && ana.lignes.length > 0 
                            ? ana.lignes.map((l, i) => <div key={i}>{l.analyse?.designation}</div>) 
                            : ana.type_analyse?.libelle || "N/A"}
                        </td>
                        <td>
                          {ana.lignes && ana.lignes.length > 0 
                            ? ana.lignes.map((l, i) => <div key={i} style={{fontSize: '0.9em'}}>{l.valeur_resultat || "-"}</div>) 
                            : "N/A"}
                        </td>
                        <td><span className={`status-badge ${ana.statut}`}>{ana.statut}</span></td>
                        <td>
                          <button 
                            className="eye-icon-btn"
                            onClick={() => openGraphModal(ana)}
                            title="Voir le graphique"
                            style={{ 
                              backgroundColor: '#3b82f6', 
                              color: 'white', 
                              border: 'none', 
                              padding: '8px 12px', 
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Eye size={16} /> Voir
                          </button>
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

      {/* Saisie Modal Dynamique */}
{showSaisieModal && selectedExamen && (
  <div className="modal-overlay">
    <div className="modal-content" style={{ maxWidth: '600px', borderRadius: '15px' }}>
      <div className="modal-header">
        <h3 style={{ fontWeight: '700' }}>Saisie des Résultats</h3>
        <button onClick={closeSaisieModal} className="close-x"><X size={22} /></button>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Patient Header */}
        <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '10px', marginBottom: '20px', borderLeft: '5px solid #22c55e' }}>
          <p style={{ margin: 0 }}><strong>{selectedExamen.patient?.nom} {selectedExamen.patient?.prenom}</strong></p>
          <p style={{ fontSize: '0.85em', color: '#64748b', margin: '5px 0 0 0' }}>
            Âge: {calculateAge(selectedExamen.patient?.date_naissance)} ans | Sexe: {selectedExamen.patient?.sexe === 'M' ? '👨' : '👩'}
          </p>
        </div>

        {/* List des Analyses Dynamique */}
        <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
          {selectedExamen.lignes?.map((ligne) => {
            const ana = ligne.analyse; // Data mn image_3e90db.png
            const currentVal = results[ligne.id]?.valeur || '';
            
            // Logic dyal l-Alerte Pathologique
            const valNum = parseFloat(currentVal);
            const isPatho = valNum && (valNum < ana.norme_min || valNum > ana.norme_max);

            return (
              <div key={ligne.id} style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                  <label style={{ fontWeight: '600', color: '#1e1b4b' }}>{ana.designation}</label>
                  <span style={{ fontSize: '11px', backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '4px', color: '#64748b', border: '1px solid #e2e8f0' }}>
                    Norme: {ana.norme_min} - {ana.norme_max} {ana.unite_mesure}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="number"
                      step="0.01"
                     placeholder={`Valeur (${ana.unite_mesure || 'sisair valeur'})`}
                      value={currentVal}
                      onChange={(e) => setResults({
                        ...results,
                        [ligne.id]: { ...results[ligne.id], valeur: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        paddingRight: '45px',
                        borderRadius: '8px',
                        border: '2px solid',
                        borderColor: isPatho ? '#ef4444' : '#e2e8f0',
                        backgroundColor: isPatho ? '#fef2f2' : 'white',
                        transition: 'all 0.2s'
                      }}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85em', fontWeight: '500' }}>
                      {ana.unite_mesure||'sisair valeur'}
                    </span>
                  </div>

                  {isPatho && (
                    <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', fontSize: '0.75em', whiteSpace: 'nowrap' }}>
                      <AlertCircle size={16} /> <span>PATHOLOGIQUE</span>
                    </div>
                  )}
                </div>

                <textarea
                  placeholder={t(biologiste.modal.medicalComment)}
                  value={results[ligne.id]?.commentaire || ''}
                  onChange={(e) => setResults({
                    ...results,
                    [ligne.id]: { ...results[ligne.id], commentaire: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.9em',
                    minHeight: '50px',
                    resize: 'none'
                  }}
                />
              </div>
            );
          })}
        </div>

       <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="button" className="btn-cancel" onClick={closeSaisieModal} style={{ flex: 1 }}>Annuler</button>
                <button 
                  type="button" 
                  className="btn-save" 
                  onClick={handleSaveResults} 
                  style={{ flex: 1, backgroundColor: '#4f46e5' }}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Details Modal with Gauge */}
      <ResultDetailsModal 
        isOpen={showGraphModal} 
        onClose={closeGraphModal} 
        ana={selectedGraphExamen} 
      />
    </div>
  );
};

export default DashboardBiologiste;