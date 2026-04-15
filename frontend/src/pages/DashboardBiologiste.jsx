import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Microscope, CheckCircle, ClipboardList, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import "./Dashboard.css";

const DashboardBiologiste = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analyses"); // المينو الافتراضي

  // قراءة بيانات المستخدم
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { name: "Biologiste", role: "biologiste" };

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
            <div className="hl-welcome-card bio-border fade-in">
              <h3 className="bio-text">Espace Laboratoire 🔬</h3>
              <p>Vous avez <strong>5</strong> nouvelles analyses en attente de traitement aujourd'hui.</p>
              
              {/* قوالب إحصائيات خفيفة للبيولوجي */}
              <div className="stats-grid">
                <div className="stat-item bio-light">
                  <p>À Analyser</p>
                  <span>05</span>
                </div>
                <div className="stat-item bio-light">
                  <p>En Attente Validation</p>
                  <span>03</span>
                </div>
              </div>
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