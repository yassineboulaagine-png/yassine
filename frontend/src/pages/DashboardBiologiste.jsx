import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Microscope, CheckCircle, ClipboardList, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import "./Dashboard.css";

const DashboardBiologiste = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analyses");
  const [analysesLyoum, setAnalysesLyoum] = useState([]);
  const [analysesLoading, setAnalysesLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // قراءة بيانات المستخدم
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { name: "Biologiste", role: "biologiste" };

  const fetchAnalysesLyoum = async (isInitial = false) => {
    try {
      if (isInitial) setAnalysesLoading(true);
      const response = await axios.get("http://localhost:8000/api/examens-biologiste");
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
    fetchAnalysesLyoum(true);
    const interval = setInterval(() => {
      fetchAnalysesLyoum(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Déconnexion réussie !");
    navigate("/login");
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="fade-in">
              <h3>Validation des Résultats</h3>
              <p>Liste des analyses terminées qui attendent votre signature.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardBiologiste;