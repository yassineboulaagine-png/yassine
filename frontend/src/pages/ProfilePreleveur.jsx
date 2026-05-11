import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Users, ArrowLeft, Camera, Eye, EyeOff, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // State initialization - user data and avatar
  const [user, setUser] = useState({});
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  
  const [stats, setStats] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch user profile data from backend on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch user data including avatar URL
        const response = await axios.get(
          "http://projet_pff.test/Back-end/public/api/user/profile",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setUser(response.data);
        
        // Set avatar URL from backend if exists
        if (response.data.avatar) {
          setAvatarUrl(`http://localhost:8000/avatars/${response.data.avatar}`);
        }

        // Fetch patient count for this user
        try {
          const patientCountResponse = await axios.get(
            `http://projet_pff.test/Back-end/public/api/patients/user-patient-count/${response.data.id}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setStats(patientCountResponse.data.patient_count);
        } catch (error) {
          console.error("Error fetching patient count:", error);
          setStats(0);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Erreur lors du chargement du profil");
      }
    };

    fetchUserProfile();

    // Listen for patient count updates from DashboardPreleveur
    const handlePatientCountUpdate = async () => {
      try {
        const token = localStorage.getItem("token");
        const userResponse = await axios.get(
          "http://projet_pff.test/Back-end/public/api/user/profile",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        const patientCountResponse = await axios.get(
          `http://projet_pff.test/Back-end/public/api/patients/user-patient-count/${userResponse.data.id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setStats(patientCountResponse.data.patient_count);
      } catch (error) {
        console.error("Error refreshing patient count:", error);
      }
    };

    window.addEventListener('patientCountUpdated', handlePatientCountUpdate);
    return () => window.removeEventListener('patientCountUpdated', handlePatientCountUpdate);
  }, []);

  // Handle image change and upload to backend
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to backend using FormData
    try {
      setIsLoadingAvatar(true);
      const token = localStorage.getItem("token");
      
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('nom_complet', user.nom_complet);
      formData.append('email', user.email);

      // Send to backend with proper headers
      const response = await axios.post(
        "http://projet_pff.test/Back-end/public/api/profile/update-avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update user data and avatar URL from backend response
      setUser(response.data.user);
      setAvatarUrl(response.data.avatar_url);
      
      // Update localStorage for fallback
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      toast.success("Avatar mis à jour avec succès!");
      setPreviewImage(null); // Clear preview after successful upload
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour de l'avatar");
      setPreviewImage(null);
    } finally {
      setIsLoadingAvatar(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '600px', margin: '40px auto' }}>
      <div style={topNavStyle}>
        <button onClick={() => navigate(-1)} style={backBtnStyle}>
          <ArrowLeft size={18} /> Retour
        </button>
        <button onClick={() => navigate('/settings-preleveur')} style={iconSettingsStyle}>
          <Settings size={20} />
        </button>
      </div>

      <div style={cardStyle}>
        {/* SECTION HEADER: Avatar & Role */}
        <div style={headerStyle}>
          <div style={avatarWrapper}>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" disabled={isLoadingAvatar} />
            <div 
              style={avatarStyle} 
              onClick={() => !isLoadingAvatar && fileInputRef.current.click()}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              title={isLoadingAvatar ? "Upload en cours..." : "Cliquez pour changer"}
            >
              {previewImage ? (
                <img src={previewImage} alt="Profile Preview" style={imageStyle} />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Profile" style={imageStyle} />
              ) : (
                user.nom_complet?.charAt(0) || "Y"
              )}
              {isHovered && !isLoadingAvatar && <div style={cameraOverlayStyle}><Camera size={24} color="white" /></div>}
              {isLoadingAvatar && <div style={cameraOverlayStyle}><span style={{ color: 'white', fontSize: '12px' }}>Upload...</span></div>}
            </div>
            <div style={onlineBadge}></div>
          </div>
          <h2 style={{ margin: '15px 0 5px 0', color: '#1e293b' }}>{user.nom_complet || "Mon Profil"}</h2>
          <span style={roleBadge}>{user.role}</span>
        </div>

        {/* SECTION INFO: Email & Password */}
        <div style={infoGrid}>
          <div style={infoItem}>
            <Mail size={20} color="#6366f1" />
            <div style={{ marginLeft: '12px', flex: 1 }}>
              <label style={labelStyle}>Email Address</label>
              <p style={valueStyle}>{user.email}</p>
            </div>
          </div>

          <div style={infoItem}>
            <Lock size={20} color="#6366f1" />
            <div style={{ marginLeft: '12px', flex: 1 }}>
              <label style={labelStyle}>Mot de passe</label>
              {/* DYNAMIQUE: kaye-qra plain_password li ghadi n-sauvgaurdiw f Settings */}
              <p style={valueStyle}>
                {showPassword ? (user.plain_password || "password123") : "••••••••••••"}
              </p>
            </div>
            <button onClick={() => setShowPassword(!showPassword)} style={eyeButtonStyle}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* BOUTON SETTINGS: Best Practice */}
        <button 
          onClick={() => navigate('/settings-preleveur')} 
          style={editProfileBtn}
          onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Settings size={16} /> Modifier le profil
        </button>

        {/* SECTION STATS: Patients Count */}
        <div onClick={() => navigate('/dashboard/preleveur')} style={statsBox}>
          <div style={{ background: '#4f46e5', padding: '12px', borderRadius: '12px' }}>
            <Users size={24} color="white" />
          </div>
          <div style={{ marginLeft: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>{stats} Patients</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Inscriptions réalisées par vous</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLES OBJECTS ---
const topNavStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const cardStyle = { background: 'white', padding: '35px', borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' };
const headerStyle = { textAlign: 'center', marginBottom: '35px' };
const avatarWrapper = { position: 'relative', display: 'inline-block', marginBottom: '10px' };
const avatarStyle = { width: '100px', height: '100px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', position: 'relative', cursor: 'pointer', border: '4px solid white', overflow: 'hidden' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const cameraOverlayStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const onlineBadge = { width: '22px', height: '22px', background: '#22c55e', border: '3px solid white', borderRadius: '50%', position: 'absolute', bottom: '5px', right: '5px', zIndex: 10 };
const roleBadge = { background: '#eef2ff', color: '#4f46e5', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' };
const infoGrid = { display: 'grid', gap: '15px', marginBottom: '20px' };
const infoItem = { display: 'flex', alignItems: 'center', padding: '15px 20px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #f1f5f9' };
const labelStyle = { fontSize: '12px', color: '#64748b', display: 'block' };
const valueStyle = { margin: 0, fontWeight: '600', color: '#1e293b' };
const statsBox = { display: 'flex', alignItems: 'center', padding: '25px', background: '#eef2ff', borderRadius: '20px', border: '1px solid #e0e7ff', cursor: 'pointer', transition: 'all 0.3s' };
const backBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '600' };
const iconSettingsStyle = { border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' };
const editProfileBtn = { width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'transparent', color: '#475569', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' };
const eyeButtonStyle = { border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' };

export default Profile;
