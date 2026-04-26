import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Microscope, CheckCircle, ClipboardList, LogOut, UserCircle, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import "./Dashboard.css";

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
      const response = await axios.get("http://localhost:8000/api/examens-biologiste");
      
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
      console.error("Error fetching analyses:", error);
      if (isInitial) setAnalysesLoading(false);
    }
  };

  const fetchValidation = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/examens-validation");
      setExamenValidation(response.data);
    } catch (error) {
      console.error("Error fetching validation:", error);
    }
  };

  const fetchHistorique = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/examens-historique");
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
      const response = await axios.post(`http://localhost:8000/api/examens/${selectedExamen.id}/resultats`, {
        resultats: resultatsArray
      });
      console.log("Success response:", response.data);
      toast.success("Résultats saisis! En attente de validation.");
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
      await axios.patch(`http://localhost:8000/api/examens/${id}/approve`);
      toast.success("Examen approuvé!");
      fetchValidation();
      fetchHistorique();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'approbation");
    }
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
              <p className="hl-user-name">{user.name || user.prenom}</p>
              <p className="hl-user-role">{user.role}</p>
            </div>
            <UserCircle size={32} color="#14532d" />
          </div>
        </header>

        <div className="hl-content-body">
          {/* المحتوى يتغير حسب التاب */}
          {activeTab === 'analyses' && (
            <div className="hl-table-container">
              {analysesLoading ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}><p>Chargement...</p></div>
              ) : analysesLyoum.length === 0 ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}><p>Aucune analyse en attente.</p></div>
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
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}><p>Aucune analyse en attente de validation.</p></div>
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
                            : "N/A"}
                        </td>
                        <td>
                          {ana.lignes && ana.lignes.length > 0 
                            ? ana.lignes.map((l, i) => <div key={i} style={{fontSize: '0.9em'}}>{l.valeur_resultat || "-"}</div>) 
                            : "N/A"}
                        </td>
                        <td>
                          <button className="btn-valider" onClick={() => handleFinalApprove(ana.id)}>Approuver</button>
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
                            : "N/A"}
                        </td>
                        <td>
                          {ana.lignes && ana.lignes.length > 0 
                            ? ana.lignes.map((l, i) => <div key={i} style={{fontSize: '0.9em'}}>{l.valeur_resultat || "-"}</div>) 
                            : "N/A"}
                        </td>
                        <td><span className={`status-badge ${ana.statut}`}>{ana.statut}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Saisie Modal */}
      {showSaisieModal && selectedExamen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Saisie des Résultats</h3>
              <button onClick={closeSaisieModal} className="close-x"><X size={22} /></button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Patient Info */}
              <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #22c55e' }}>
                <p><strong>{selectedExamen.patient?.nom} {selectedExamen.patient?.prenom}</strong></p>
                <p style={{fontSize: '0.9em', color: '#666'}}>
                  Âge: {calculateAge(selectedExamen.patient?.date_naissance)} ans | Sexe: {selectedExamen.patient?.sexe === 'M' ? '👨' : '👩'}
                </p>
              </div>

              {/* Results Input */}
              {selectedExamen.lignes?.map((ligne) => {
                const analysisName = ligne.analyse?.designation || "Analyse";
                const value = results[ligne.id]?.valeur || '';
                const isAbnormal = isAbnormalValue(analysisName, value);

                return (
                  <div key={ligne.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.95em' }}>
                      {analysisName}
                    </label>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input
                        type="text"
                        placeholder="Valeur"
                        value={value}
                        onChange={(e) => setResults({
                          ...results,
                          [ligne.id]: { ...results[ligne.id], valeur: e.target.value }
                        })}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: isAbnormal ? '2px solid #ef4444' : '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '0.95em'
                        }}
                      />
                      {isAbnormal && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontSize: '0.85em' }}>
                          <AlertCircle size={16} />
                          <span>Pathologique</span>
                        </div>
                      )}
                    </div>

                    <textarea
                      placeholder="Commentaire (optionnel)"
                      value={results[ligne.id]?.commentaire || ''}
                      onChange={(e) => setResults({
                        ...results,
                        [ligne.id]: { ...results[ligne.id], commentaire: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        marginTop: '8px',
                        padding: '8px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.9em',
                        minHeight: '60px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                );
              })}

              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-cancel" onClick={closeSaisieModal}>Annuler</button>
                <button type="button" className="btn-save" onClick={handleSaveResults}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBiologiste;