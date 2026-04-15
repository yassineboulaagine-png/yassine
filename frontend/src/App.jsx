import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// استيراد الصفحات بـ JavaScript نقي (حيدنا .tsx)
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardBiologiste from "./pages/DashboardBiologiste";
import DashboardPreleveur from "./pages/DashboardPreleveur";
import NotFound from "./pages/NotFound";
import MesResultats from "./pages/MesResultats";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* هاد التويشيات ديال Toaster خليهم باش يبانو الميساجات زوينين */}
      <Toaster />
      <Sonner />
      
      <BrowserRouter>
        <Routes>
          {/* التوجيه الأساسي لصفحة Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* صفحات لوحات التحكم (Dashboards) */}
          <Route path="/dashboard/admin" element={<DashboardAdmin />} />
          <Route path="/dashboard/biologiste" element={<DashboardBiologiste />} />
          <Route path="/dashboard/preleveur" element={<DashboardPreleveur />} />
          
          {/* صفحة نتائج المريض */}
          <Route path="/mes-resultats" element={<MesResultats />} />
          
          {/* صفحة 404 إلا دخل لشي رابط ما كاينش */}
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;