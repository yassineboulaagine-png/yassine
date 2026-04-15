import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Phone, Hash } from "lucide-react";
import { toast } from "sonner";
import axios from "axios"; 
import "./Login.css"; 
import { apiLogin } from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();
  const [isStaff, setIsStaff] = useState(true); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [reference, setReference] = useState("");
  const [telephone, setTelephone] = useState("");
  
  const [loading, setLoading] = useState(false);

  // حيدنا (e: React.FormEvent) حيت حنا دابا فـ JS
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isStaff) {
      try {
        const { token, user } = await apiLogin(email, password);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        // التوجيه على حساب الـ Role ديال Laravel
        if(user.role === 'admin') navigate("/dashboard/admin");
        else if(user.role === 'biologiste') navigate("/dashboard/biologiste");
        else navigate("/dashboard/preleveur");
      } catch (err) {
        toast.error("Email ou Mot de passe incorrect");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response = await axios.post("http://localhost:8000/api/patient/auth", {
          reference: reference,
          telephone: telephone
        });

        if (response.data.success) {
          localStorage.setItem("currentExamen", JSON.stringify(response.data.examen));
          toast.success("Accès réussi");
          navigate("/mes-resultats");
        }
      } catch (err) {
        toast.error("Référence ou Numéro de téléphone incorrect");
      } finally {
        setLoading(false);
      }
    }
  };

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