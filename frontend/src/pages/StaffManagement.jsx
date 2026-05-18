import { useState, useEffect } from "react";
import axiosInstance from "axios"; 
import { toast } from "sonner";
import { UserPlus, Trash2, Pencil, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const StaffManagement = () => {
  const { t } = useTranslation();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [passwordModalStaff, setPasswordModalStaff] = useState(null);
  const [passwordData, setPasswordData] = useState({
    password: "",
    password_confirmation: "",
  });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "biologiste"
  });

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("http://projet_pff.test/api/admin/staff", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(response.data);
      setLoading(false);
    } catch (error) {
      toast.error(t("staff.loadError"));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post("http://projet_pff.test/api/admin/staff", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t("staff.addSuccess"));
      setShowModal(false);
      setFormData({ name: "", email: "", password: "", role: "biologiste" });
      fetchStaff();
    } catch (error) {
      toast.error(t("staff.addError"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("staff.deleteConfirm"))) {
      try {
        const token = localStorage.getItem("token");
        await axiosInstance.delete(`http://projet_pff.test/api/admin/staff/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(t("staff.deleteSuccess"));
        fetchStaff();
      } catch (error) {
        toast.error(t("staff.deleteError"));
      }
    }
  };

  const openPasswordModal = (member) => {
    setPasswordModalStaff(member);
    setPasswordData({ password: "", password_confirmation: "" });
  };

  const closePasswordModal = () => {
    setPasswordModalStaff(null);
    setPasswordData({ password: "", password_confirmation: "" });
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error(t("staff.passwordMismatch", "Les mots de passe ne correspondent pas"));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put(
        `http://projet_pff.test/api/admin/staff/${passwordModalStaff.id}/password`,
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("staff.passwordUpdated", "Mot de passe modifie !"));
      closePasswordModal();
    } catch (error) {
      toast.error(error.response?.data?.message || t("staff.passwordUpdateError", "Erreur lors du changement du mot de passe"));
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: '24px'
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{t("staff.title")}</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>{t("staff.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#2563eb',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UserPlus size={16} /> {t("staff.addButton")}
        </button>
      </div>

      {/* Table Section */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>{t("staff.loading")}</div>
        ) : staff.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>{t("staff.empty")}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', direction: 'ltr' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                <th style={{ padding: '14px 20px' }}>{t("staff.fullName")}</th>
                <th style={{ padding: '14px 20px' }}>{t("staff.email")}</th>
                <th style={{ padding: '14px 20px' }}>{t("staff.role")}</th>
                <th style={{ padding: '14px 20px', textAlign: 'center' }}>{t("staff.actions")}</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '14px', color: '#334155' }}>
              {staff.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '600', color: '#1e293b' }}>{member.nom_complet}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{member.email}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '9999px', 
                      fontSize: '12px', 
                      fontWeight: '700',
                      background: member.role === 'biologiste' ? '#f0fdf4' : '#f3e8ff',
                      color: member.role === 'biologiste' ? '#16a34a' : '#7e22ce',
                      border: member.role === 'biologiste' ? '1px solid #bbf7d0' : '1px solid #e9d5ff'
                    }}>
                      {t(`staff.${member.role}`, member.role).toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <button
                      onClick={() => openPasswordModal(member)}
                      title={t("staff.changePassword", "Changer le mot de passe")}
                      style={{ background: '#e0f2fe', border: 'none', color: '#0369a1', cursor: 'pointer', padding: '7px', borderRadius: '6px', marginRight: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      style={{ background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '7px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      title={t("common.delete")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 📄 الـ Modal الحقيقي اللي غايكون فوق الصفحة كاملة */}
      {showModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.4)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 999
        }}>
          <div style={{ 
            background: '#fff', 
            padding: '24px', 
            borderRadius: '12px', 
            width: '150%', 
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', marginTop: 0 }}>{t("staff.newAccount")}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>{t("staff.fullName")}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  placeholder={t("staff.namePlaceholder")}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>{t("staff.emailAddress")}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  placeholder={t("staff.emailPlaceholder")}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>{t("staff.password")}</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  placeholder={t("staff.passwordPlaceholder")}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>{t("staff.roleAssigned")}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', background: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="biologiste">{t("staff.biologiste")}</option>
                  <option value="preleveur">{t("staff.preleveur")}</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  {t("staff.createAccount")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordModalStaff && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.4)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: '#fff', 
            padding: '24px', 
            borderRadius: '12px', 
            width: '90%', 
            maxWidth: '420px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                  {t("staff.changePassword", "Changer le mot de passe")}
                </h3>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                  {passwordModalStaff.nom_complet}
                </p>
              </div>
              <button
                type="button"
                onClick={closePasswordModal}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', color: '#64748b', cursor: 'pointer', padding: '6px', display: 'inline-flex' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  {t("staff.newPassword", "Nouveau mot de passe")}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  style={{ width: '100%', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  placeholder={t("staff.passwordPlaceholder")}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  {t("staff.confirmPassword", "Confirmer le mot de passe")}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordData.password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                  style={{ width: '100%', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  placeholder={t("staff.confirmPassword", "Confirmer le mot de passe")}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  style={{ padding: '8px 16px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  {t("staff.savePassword", "Enregistrer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
