import { useState } from "react"; // زدنا useState باش نعرفو شنو المينو اللي مسلكتي
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, TestTube2, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import "./Dashboard.css";

const DashboardAdmin = () => {
  const navigate = useNavigate();
  // الـ State باش نعرفو المينو اللي خدام (Active)
  const [activeTab, setActiveTab] = useState("dashboard");

  // كنقراو معلومات المستخدم
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { name: "Admin", role: "admin" };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Déconnexion réussie !");
    navigate("/login");
  };

  return (
    <div className="hl-dashboard-container">
      {/* Sidebar */}
      <aside className="hl-sidebar admin">
        <div className="hl-sidebar-header">
          <h1 className="hl-logo">Helix <span>Lab</span></h1>
        </div>
        
        <nav className="hl-nav">
          <button 
            className={`hl-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} /> Tableau de bord
          </button>
          
          <button 
            className={`hl-nav-btn ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => {
                setActiveTab('patients');
                // هنا تقدر تزيد navigate("/dashboard/admin/patients") يلا بغيتي
            }}
          >
            <Users size={20} /> Patients
          </button>
          
          <button 
            className={`hl-nav-btn ${activeTab === 'analyses' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyses')}
          >
            <TestTube2 size={20} /> Analyses
          </button>
        </nav>

        <div className="hl-logout-section">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-400" onClick={handleLogout}>
            <LogOut size={20} /> Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="hl-main">
        <header className="hl-header">
          <h2>Espace Administrateur</h2>
          <div className="hl-user-info">
            <div className="hl-user-text">
              <p className="hl-user-name">{user.name || user.prenom}</p>
              <p className="hl-user-role">{user.role}</p>
            </div>
            <UserCircle size={32} color="#94a3b8" />
          </div>
        </header>

        <div className="hl-content-body">
          {/* هنا غانبدلو المحتوى على حساب شنو كليكا Admin */}
          {activeTab === 'dashboard' && (
            <div className="hl-welcome-card fade-in">
              <h3>Bienvenue sur Helix Lab 🔬</h3>
              <p>Le système est prêt. Sélectionnez une option dans le menu pour commencer.</p>
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #2563eb' }}>
                  <p style={{ color: '#1e40af', fontWeight: 'bold' }}>Total Patients</p>
                  <span style={{ fontSize: '24px', fontWeight: '800' }}>124</span>
                </div>
                <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #16a34a' }}>
                  <p style={{ color: '#166534', fontWeight: 'bold' }}>Analyses Validées</p>
                  <span style={{ fontSize: '24px', fontWeight: '800' }}>85</span>
                </div>
                <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #ea580c' }}>
                  <p style={{ color: '#9a3412', fontWeight: 'bold' }}>En Attente</p>
                  <span style={{ fontSize: '24px', fontWeight: '800' }}>12</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="fade-in">
              <h3>Gestion des Patients</h3>
              <p>Ici vous pouvez ajouter ou modifier les patients.</p>
              {/* غانصاوبو الجدول هنا من بعد */}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;