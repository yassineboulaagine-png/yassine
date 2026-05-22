import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, TestTube2, LogOut, UserCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios"; // 👈 زدنا axios باش نجيبو الداتا
// 👈 زدنا الـ مكونات ديال Recharts للـ مبيانات بجوج
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend 
} from 'recharts';

import PatientsManagement from "./PatientsManagement";
import AnalysesManagement from "./AnalysesManagement";
import "./Dashboard.css";
import AdminProfileSettings from "./AdminProfileSettings";
import StaffManagement from "./StaffManagement";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const changeLanguage = (e) => {
    const selectedLanguage = e.target.value;
    i18n.changeLanguage(selectedLanguage);
    document.body.dir = selectedLanguage === "ar" ? "rtl" : "ltr";
  };

  // 📊 الـ State فين غانحطو الإحصائيات الحقيقية
  const [stats, setStats] = useState({
    cards: { total_patients: 0, analyses_validees: 0, en_cours: 0 },
    graph: []
  });
  const [loading, setLoading] = useState(true);

  // قراءة معلومات المستخدم
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { name: "Admin", role: "admin" };

  // 🔄 جلب البيانات من الـ API أول ما يتحل الـ Dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (activeTab !== "dashboard") return; // جيب الداتا غير فاش تكون فـ الـ تابلوديبور
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const response = await axios.get('http://projet_pff.test/api/admin/stats', config);
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success(t("adminDashboard.logoutSuccess"));
    navigate("/login");
  };

  // 🎨 ألوان الـ Pie Chart (أخضر للـ Validées، ليموني للـ En cours)
  const COLORS = ['#16a34a', '#ea580c'];
  const pieData = [
    { name: t("status.validee"), value: stats.cards.analyses_validees },
    { name: t("status.en_cours"), value: stats.cards.en_cours },
  ];

  return (
    <div className="hl-dashboard-container">
      {/* Sidebar */}
      <aside className={`hl-sidebar admin ${isSidebarOpen ? "open" : ""}`}>
        <div className="hl-sidebar-header">
          <h1 className="hl-logo">Helix <span>Lab</span></h1>
        </div>
        
        <nav className="hl-nav">
          <button 
            className={`hl-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            <LayoutDashboard size={20} /> {t("adminDashboard.sidebar.dashboard")}
          </button>
          
          <button 
            className={`hl-nav-btn ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => handleTabChange('patients')}
          >
            <Users size={20} /> {t("adminDashboard.sidebar.patients")}
          </button>
          
          <button 
            className={`hl-nav-btn ${activeTab === 'analyses' ? 'active' : ''}`}
            onClick={() => handleTabChange('analyses')}
          >
            <TestTube2 size={20} /> {t("adminDashboard.sidebar.analyses")}
          </button>

          <button 
        className={`hl-nav-btn ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => handleTabChange('staff')}
        >
           <ShieldAlert size={20} /> {t("adminDashboard.sidebar.staff")}
        </button>
        </nav>

        <div className="hl-logout-section">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-400" onClick={handleLogout}>
            <LogOut size={20} /> {t("adminDashboard.sidebar.logout")}
          </Button>
        </div>
      </aside>
      {isSidebarOpen && (
        <button
          type="button"
          className="hl-sidebar-backdrop"
          aria-label="Fermer le menu"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="hl-main">
        <header className="hl-header">
          <button
            type="button"
            className="hl-mobile-menu-toggle"
            aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setIsSidebarOpen((open) => !open)}
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h2>{t("adminDashboard.headerTitle")}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <select
              onChange={changeLanguage}
              value={i18n.language?.startsWith("ar") ? "ar" : "fr"}
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="fr">FR</option>
              <option value="ar">AR</option>
            </select>
            <div className="hl-user-info" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
              <div className="hl-user-text">
                <p className="hl-user-name">{user.name || user.prenom}</p>
                <p className="hl-user-role">{user.role}</p>
              </div>
              <UserCircle size={32} color="#94a3b8" />
            </div>
          </div>
        </header>

        <div className="hl-content-body">
          {activeTab === 'dashboard' && (
            <div className="hl-welcome-card fade-in" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
              <div style={{ background: '#white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: '#fff', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{t("adminDashboard.welcomeTitle")}</h3>
                <p style={{ color: '#64748b', marginTop: '4px' }}>{t("adminDashboard.welcomeSubtitle")}</p>
              </div>

              {/* 1. الـ Cards الإحصائية الديناميكية من الـ DB */}
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #2563eb' }}>
                  <p style={{ color: '#1e40af', fontWeight: 'bold' }}>{t("adminDashboard.totalPatients")}</p>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>
                    {loading ? '...' : stats.cards.total_patients}
                  </span>
                </div>
                
                <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #16a34a' }}>
                  <p style={{ color: '#166534', fontWeight: 'bold' }}>{t("adminDashboard.validatedAnalyses")}</p>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>
                    {loading ? '...' : stats.cards.analyses_validees}
                  </span>
                </div>
                
                <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #ea580c' }}>
                  <p style={{ color: '#9a3412', fontWeight: 'bold' }}>{t("adminDashboard.inProgress")}</p>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>
                    {loading ? '...' : stats.cards.en_cours}
                  </span>
                </div>
              </div>

              {/* 2. مبيانات الـ Synthèse (جنب لجنب) اللي طالبين فـ الـ OFPPT */}
              {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginTop: '24px' }}>
                  
                  {/* Histogramme (الأعمدة) */}
                  <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#334155', marginBottom: '16px' }}>{t("adminDashboard.analysesEvolution")}</h4>
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <BarChart data={stats.graph}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip />
                          <Bar dataKey="analyses" fill="#16a34a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Secteur (الدائري) */}
                  <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#334155', marginBottom: '16px' }}>{t("adminDashboard.analysesDistribution")}</h4>
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="40%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {activeTab === 'patients' && <PatientsManagement />}
          {activeTab === 'analyses' && <AnalysesManagement />}
          {activeTab === 'staff' && <StaffManagement />}
          
          {activeTab === 'profile' && (
            <AdminProfileSettings 
              userData={user} 
              setUserData={(updated) => {
                localStorage.setItem("user", JSON.stringify(updated));
              }} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
