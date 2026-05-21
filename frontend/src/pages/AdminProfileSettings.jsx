import React, { useState,useEffect } from 'react';
import { User, Lock, Save, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const AdminProfileSettings = ({ userData, setUserData }) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    nom_complet: userData.nom_complet || '',
    email: userData.email || ''
  });

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const dataToSend = {
        ...profile,
        _method: 'PUT' 
      };
      const response = await axios.put('http://projet_pff.test/api/user/update-profile', profile, config);
      const updatedUser = { ...userData, ...profile };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUserData(updatedUser);
      toast.success(t('adminProfile.updateSuccess'));
    } catch (error) {
      toast.error(t('adminProfile.updateError'));
    }
  };

  // وسط AdminProfileSettings.jsx
useEffect(() => {
  if (userData) {
    setProfile({
      nom_complet: userData.nom_complet || userData.name || '',
      email: userData.email || ''
    });
  }
}, [userData]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error(t('adminProfile.passwordMismatch'));
    }
    try {
        const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.post('http://projet_pff.test/api/user/change-password', passwords, config);
      toast.success(t('adminProfile.passwordSuccess'));
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || t('adminProfile.passwordError'));
    }
  };

  return (
    <div className="hl-admin-profile-container">
      <div className="hl-profile-header">
        <h2>{t('adminProfile.title')}</h2>
        <p>{t('adminProfile.subtitle')}</p>
      </div>

      <div className="hl-profile-grid">
        {/* Section Informations */}
        <div className="hl-card">
          <div className="card-title">
            <User size={20} /> <h3>{t('adminProfile.personalInfo')}</h3>
          </div>
          <form onSubmit={handleUpdateInfo}>
            <div className="form-group">
              <label>{t('adminProfile.fullName')}</label>
              <input 
                type="text" 
                value={profile.nom_complet}
                onChange={(e) => setProfile({...profile, nom_complet: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>{t('adminProfile.email')}</label>
              <input 
                type="email" 
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
            <button type="submit" className="hl-btn-primary">
              <Save size={18} /> {t('adminProfile.save')}
            </button>
          </form>
        </div>

        {/* Section Sécurité */}
        <div className="hl-card">
          <div className="card-title">
            <ShieldCheck size={20} /> <h3>{t('adminProfile.security')}</h3>
          </div>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>{t('adminProfile.oldPassword')}</label>
              <input 
                type="password" 
                value={passwords.oldPassword}
                onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>{t('adminProfile.newPassword')}</label>
              <input 
                type="password" 
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>{t('adminProfile.confirmPassword')}</label>
              <input 
                type="password" 
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              />
            </div>
            <button type="submit" className="hl-btn-secondary">
              <Lock size={18} /> {t('adminProfile.changePassword')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileSettings;
