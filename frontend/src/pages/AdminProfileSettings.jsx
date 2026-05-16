import React, { useState,useEffect } from 'react';
import { User, Lock, Save, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminProfileSettings = ({ userData, setUserData }) => {
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
      toast.success("Informations mises à jour !");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
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
      return toast.error("Les mots de passe ne correspondent pas");
    }
    try {
        const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.post('http://projet_pff.test/api/user/change-password', passwords, config);
      toast.success("Mot de passe modifié !");
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur mot de passe");
    }
  };

  return (
    <div className="hl-admin-profile-container">
      <div className="hl-profile-header">
        <h2>Paramètres du Compte Administrateur</h2>
        <p>Gérez vos informations personnelles et la sécurité de votre accès.</p>
      </div>

      <div className="hl-profile-grid">
        {/* Section Informations */}
        <div className="hl-card">
          <div className="card-title">
            <User size={20} /> <h3>Informations Personnelles</h3>
          </div>
          <form onSubmit={handleUpdateInfo}>
            <div className="form-group">
              <label>Nom Complet</label>
              <input 
                type="text" 
                value={profile.nom_complet}
                onChange={(e) => setProfile({...profile, nom_complet: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
            <button type="submit" className="hl-btn-primary">
              <Save size={18} /> Enregistrer
            </button>
          </form>
        </div>

        {/* Section Sécurité */}
        <div className="hl-card">
          <div className="card-title">
            <ShieldCheck size={20} /> <h3>Sécurité du compte</h3>
          </div>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Ancien mot de passe</label>
              <input 
                type="password" 
                value={passwords.oldPassword}
                onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input 
                type="password" 
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Confirmer le nouveau</label>
              <input 
                type="password" 
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              />
            </div>
            <button type="submit" className="hl-btn-secondary">
              <Lock size={18} /> Changer le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileSettings;