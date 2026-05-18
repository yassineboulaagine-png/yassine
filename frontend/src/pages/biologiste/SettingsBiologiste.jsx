import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const SettingsBiologiste = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  
  const [profile, setProfile] = useState({
    nom_complet: userData.nom_complet || "",
    email: userData.email || ""
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`http://projet_pff.test/api/user/update-profile`, {
        user_id: userData.id,
        ...profile
      },
    {
        headers: { Authorization: `Bearer ${token}` } });

      if (response.status === 200) {
        // Kan-keep-iw dakchi li kan f localStorage (b7al plain_password) o n-zidou 3lih jdid
        const updatedUser = { ...userData, ...profile };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success(t('settings.profile_updated'));
      }
    } catch (error) {
      toast.error(t('settings.profile_update_error'));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error(t('settings.password_not_match'));
      return;
    }
    try {
      const token = localStorage.getItem("token");
      // T-aked dima mn l-URL anaho fih http:// o mafihch "/" f l-akhir bach t-fada error 405
      const response = await axios.post(`http://projet_pff.test/api/user/change-password`, {
        user_id: userData.id,
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      },
    {
        headers: { Authorization: `Bearer ${token}` } });

      if (response.status === 200) {
        // Hna l-muhim: Updati l-pass jdid bach l-3in t-welli t-affichi l-jdid
        const updatedUser = { ...userData, plain_password: passwords.newPassword };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        toast.success(t('settings.password_updated'));
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      // Ila kan error 400 (Bad Request) wala 405, ghadi i-t-afficha l-message dial l-backend
      const errorMsg = error.response?.data?.message || t('settings.old_password_incorrect');
      toast.error(errorMsg);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '500px', margin: '40px auto' }}>
      <button onClick={() => navigate(-1)} style={backBtnStyle}>
        <ArrowLeft size={18} /> {t('settings.back')}
      </button>

      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={iconBox}><User size={32} color="#10b981" /></div>
          <h2 style={titleStyle}>{t('settings.my_profile')}</h2>
        </div>

        <form onSubmit={handleUpdateProfile} style={{ marginBottom: '30px' }}>
          <div style={inputGroup}>
            <label style={labelStyle}>{t('settings.full_name')}</label>
            <input 
              type="text" 
              value={profile.nom_complet}
              onChange={(e) => setProfile({...profile, nom_complet: e.target.value})}
              style={inputStyle}
            />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>{t('settings.email')}</label>
            <input 
              type="email" 
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              style={inputStyle}
            />
          </div>
          <button type="submit" style={saveBtnStyle}>{t('settings.save_changes')}</button>
        </form>

        <div style={divider}></div>

        <div style={{ textAlign: 'center', marginBottom: '25px', marginTop: '20px' }}>
          <div style={iconBox}><ShieldCheck size={32} color="#10b981" /></div>
          <h2 style={titleStyle}>{t('settings.security')}</h2>
        </div>

        <form onSubmit={handleChangePassword}>
          <div style={inputGroup}>
            <label style={labelStyle}>{t('settings.old_password')}</label>
            <input 
              type="password" required 
              value={passwords.oldPassword}
              onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
              style={inputStyle}
            />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>{t('settings.new_password')}</label>
            <input 
              type="password" required 
              value={passwords.newPassword}
              onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              style={inputStyle}
            />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>{t('settings.confirm_password')}</label>
            <input 
              type="password" required 
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              style={inputStyle}
            />
          </div>
          <button type="submit" style={{ ...saveBtnStyle, background: '#1e293b' }}>
            {t('settings.update_password')}
          </button>
        </form>
      </div>
    </div>
  );
};

// Styles (khallithom nishan b7al li kanti bghiti) - Using Emerald/Green theme
const cardStyle = { background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' };
const iconBox = { width: '50px', height: '50px', background: '#d1fae5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' };
const titleStyle = { margin: '10px 0', color: '#1e293b', fontSize: '20px' };
const labelStyle = { fontSize: '14px', fontWeight: '500', color: '#64748b' };
const inputGroup = { marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px', outline: 'none', fontSize: '14px' };
const saveBtnStyle = { width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginTop: '10px', fontSize: '14px' };
const backBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '20px', fontWeight: '500' };
const divider = { height: '1px', background: '#f1f5f9', margin: '20px 0' };

export default SettingsBiologiste;
