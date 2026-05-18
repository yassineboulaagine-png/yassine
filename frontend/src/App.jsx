import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import i18n from "./pages/i18n"; // Import the i18n configuration

// Pages
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardBiologiste from "./pages/DashboardBiologiste";
import DashboardPreleveur from "./pages/DashboardPreleveur";
import NotFound from "./pages/NotFound";
import MesResultats from "./pages/MesResultats";
import PatientResults from "./pages/PatientResults";
import PrendreRendezVous from "./pages/PrendreRendezVous";
import DashboardRendezVous from "./pages/DashboardRendezVous";

// Preleveur
import ProfilePreleveur from "./pages/ProfilePreleveur";
import SettingsPreleveur from "./pages/SettingsPreleveur";

// Biologiste
import ProfileBiologiste from "./pages/biologiste/ProfileBiologiste";
import SettingsBiologiste from "./pages/biologiste/SettingsBiologiste";

// Auth
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

/* =========================
   ROLE GUARDS (Using useAuth Hook)
========================= */
const BiologisteRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: "20px", textAlign: "center" }}>Chargement...</div>;
  if (!user || user.role !== "biologiste") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PreleveurRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: "20px", textAlign: "center" }}>Chargement...</div>;
  if (!user || user.role !== "preleveur") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: "20px", textAlign: "center" }}>Chargement...</div>;
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/* =========================
   APP ROUTES
========================= */
const AppRoutes = () => (
  <Routes>
    {/* ================= LOGIN ================= */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />

    {/* ================= ADMIN ================= */}
    <Route
      path="/dashboard/admin"
      element={
        <AdminRoute>
          <DashboardAdmin />
        </AdminRoute>
      }
    />

    {/* ================= BIOLOGISTE ================= */}
    <Route
      path="/dashboard/biologiste"
      element={
        <BiologisteRoute>
          <DashboardBiologiste />
        </BiologisteRoute>
      }
    />

    <Route
      path="/profil-biologiste"
      element={
        <BiologisteRoute>
          <ProfileBiologiste />
        </BiologisteRoute>
      }
    />

    <Route
      path="/settings-biologiste"
      element={
        <BiologisteRoute>
          <SettingsBiologiste />
        </BiologisteRoute>
      }
    />

    {/* ================= PRELEVEUR ================= */}
    <Route
      path="/dashboard/preleveur"
      element={
        <PreleveurRoute>
          <DashboardPreleveur />
        </PreleveurRoute>
      }
    />

    <Route
      path="/profil-preleveur"
      element={
        <PreleveurRoute>
          <ProfilePreleveur />
        </PreleveurRoute>
      }
    />

    <Route
      path="/settings-preleveur"
      element={
        <PreleveurRoute>
          <SettingsPreleveur />
        </PreleveurRoute>
      }
    />

    {/* ================= OTHERS ================= */}
    <Route path="/mes-resultats" element={<MesResultats />} />

    {/* fallback */}
    <Route path="*" element={<NotFound />} />

    <Route path="/patient/results" element={<PatientResults />} />


    <Route path="/prendre-rendez-vous" element={<PrendreRendezVous />} />
    <Route path="/dashboard/rendez-vous" element={<DashboardRendezVous />} />
  </Routes>
);

/* =========================
   APP
========================= */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;