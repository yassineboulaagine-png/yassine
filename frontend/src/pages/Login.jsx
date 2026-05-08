import { useState, useEffect } from "react";
import { Mail, Lock, Phone, Hash } from "lucide-react";
import { toast } from "sonner";
import axios from "axios"; 
import "./Login.css"; 
import { apiLogin } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const { user } = useAuth();
  const [isStaff, setIsStaff] = useState(true); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reference, setReference] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      console.log("✅ User already logged in as:", user.role);
    }
  }, [user]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;
  setLoading(true);

  if (isStaff) {
    // حالة دخول Staff (Admin, Biologiste, etc.)
    try {
      const data = await apiLogin(email, password);
      console.log("✅ STAFF LOGIN SUCCESS:", data);
      console.log("📝 Token to store:", data.token);
      console.log("📝 User to store:", data.user);

      if (!data.token) {
        console.error("❌ ERROR: Token is missing or undefined!");
        throw new Error("Token not received from server");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("✅ Token stored:", localStorage.getItem("token"));

      const role = data.user.role.toLowerCase();
      if (role === "admin") {
        window.location.href = "/dashboard/admin";
      } else if (role === "biologiste") {
        window.location.href = "/dashboard/biologiste";
      } else if (role === "preleveur") {
        window.location.href = "/dashboard/preleveur";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("❌ STAFF LOGIN ERROR:", err);
      toast.error("Email ou Mot de passe incorrect");
      setLoading(false);
    }
  } else {
  // حالة دخول المريض (الـ else اللي فيها api/patient/auth)
  try {
    const response = await axios.post("http://localhost:8000/api/patient/auth", {
      reference: reference,
      telephone: telephone
    });

    if (response.data.success) {
      // 1. أهم سطر: شد الـ Token اللي صيفطنا من Laravel وحطو فـ localStorage
      // نتا فـ Laravel صيفطتيه بسميت 'token'
      localStorage.setItem("token", response.data.token);

      // 2. سجل معلومات المريض (باش الـ Dashboard يعرفو بلي راه Patient)
      localStorage.setItem("user", JSON.stringify({ role: 'patient' }));

      // 3. سجل معلومات الامتحان (باش يطلعو لينا فـ Mes Résultats)
      // استعملنا response.data.examen حيت زدناها فـ Laravel
      localStorage.setItem("currentExamen", JSON.stringify(response.data.examen));

      toast.success("Accès réussi");

      // 4. توجيه المريض لصفحة النتائج
      window.location.href = "/mes-resultats"; 
    }
  } catch (err) {
    console.error("❌ PATIENT LOGIN ERROR:", err);
    toast.error("Référence ou Numéro de téléphone incorrect");
    setLoading(false);
  }
};};
     
    
  


  return (
    <div className="helix-login-page">
      <div className="login-left">
        <div className="login-form-box">
          <h1 className="login-logo">Helix <span>Lab</span></h1>
          
          <div className="simple-tabs">
            <button type="button" onClick={() => setIsStaff(true)} className={isStaff ? "active" : ""}>Personnel</button>
            <button type="button" onClick={() => setIsStaff(false)} className={!isStaff ? "active" : ""}>Patient</button>
          </div>

          <form onSubmit={handleSubmit}>
            {isStaff ? (
              <div className="fade-in">
                <div className="field-container">
                  <label className="field-label">Email</label>
                  <div className="input-icon-wrapper">
                    <Mail size={18} />
                    <input type="email" className="helix-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="field-container">
                  <label className="field-label">Mot de passe</label>
                  <div className="input-icon-wrapper">
                    <Lock size={18} />
                    <input type="password" className="helix-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
              </div>
            ) : (
              <div className="fade-in">
                <div className="field-container">
                  <label className="field-label">N° de Téléphone</label>
                  <div className="input-icon-wrapper">
                    <Phone size={18} />
                    <input 
                        type="tel" 
                        className="helix-input" 
                        placeholder="06XXXXXXXX" 
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        required 
                    />
                  </div>
                </div>
                <div className="field-container">
                  <label className="field-label">Référence d'examen</label>
                  <div className="input-icon-wrapper">
                    <Hash size={18} />
                    <input 
                        type="text" 
                        className="helix-input" 
                        placeholder="Ex: EX-2026-0001" 
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        required 
                    />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="helix-login-btn" disabled={loading}>
              {loading ? "Chargement..." : (isStaff ? "Se Connecter" : "Voir mes Résultats")}
            </button>
          </form>
        </div>
      </div>

      <div className="login-right-visual"></div>
    </div>
  );
};

export default Login;