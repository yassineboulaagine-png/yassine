import { useState, useEffect } from "react";
import { Mail, Lock, Phone, Hash } from "lucide-react";
import { toast } from "sonner";
import axios from "axios"; 
import "./Login.css"; 
import { apiLogin } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import {Link} from "react-router-dom";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { user } = useAuth();
  const [isStaff, setIsStaff] = useState(true); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reference, setReference] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  const {t,i18n} = useTranslation();

  const changeLanguage = (e) => {
    const selectedLanguage = e.target.value;
    i18n.changeLanguage(selectedLanguage);
    
    // 💡 بلان إضافي: باش تقلب الاتجاه د الصفحة (RTL) إلى تختار العَرَبية
    if (selectedLanguage === 'ar') {
      document.body.dir = 'rtl';
    } else {
      document.body.dir = 'ltr';
    }
  };

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
      toast.error(t('login.staff_error'));
      setLoading(false);
    }
  } else {
  // حالة دخول المريض (الـ else اللي فيها api/patient/auth)
  try {
    const response = await axios.post("http://Projet_PFF.test/api/patient/auth", {
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

      toast.success(t('login.patient_success'));

      // 4. توجيه المريض لصفحة النتائج
      window.location.href = "/mes-resultats"; 
    }
  } catch (err) {
    console.error("❌ PATIENT LOGIN ERROR:", err);
    toast.error(t('login.patient_error'));
    setLoading(false);
  }
};};
     
    
  


  return (
    <div className="helix-login-page">
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
  <select onChange={changeLanguage} value={i18n.language?.startsWith('ar') ? 'ar' : 'fr'} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}>
    <option value="fr">FR</option>
    <option value="ar">AR</option>
  </select>
</div>
      <div className="login-left">
        <div className="login-form-box">
          <h1 className="login-logo">Helix <span>Lab</span></h1>
          
          <div className="simple-tabs">
            <button type="button" onClick={() => setIsStaff(true)} className={isStaff ? "active" : ""}>{t('login.tab_personnel')}</button>
            <button type="button" onClick={() => setIsStaff(false)} className={!isStaff ? "active" : ""}>{t('login.tab_patient')}</button>
          </div>

          <form onSubmit={handleSubmit}>
            {isStaff ? (
              <div className="fade-in">
                <div className="field-container">
                  <label className="field-label">{t('login.email_label')}</label>
                  <div className="input-icon-wrapper">
                    <Mail size={18} />
                    <input type="email" className="helix-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="field-container">
                  <label className="field-label">{t('login.password_label')}</label>
                  <div className="input-icon-wrapper">
                    <Lock size={18} />
                    <input type="password" className="helix-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  {/* 🚀 زيد هاد البارتي تحت الخانة د Mot de passe وقبل السدّة د الـ </form> */}

                </div>
              </div>
            ) : (
              <div className="fade-in">
                <div className="field-container">
                  <label className="field-label">{t('login.phone_label')}</label>
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
                  <label className="field-label">{t('login.reference_label')}</label>
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
              {loading ? t('login.charger') : (isStaff ? t('login.submit_btn') : t('login.btn_results'))}
            </button>
            
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
    <span style={{ color: '#64748b' }}>{t('login.no_appointment')}</span>
    <Link to="/prendre-rendez-vous" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none', marginLeft: '5px' }}>
       {t('login.take_appointment')}
    </Link>
</div>
        </div>
        
      </div>
      

      <div className="login-right-visual"></div>
    </div>
  );
};

export default Login;
