import { useState, useEffect } from "react";
import axios from "axios"; // أو دير import axios من "axios" عادي على حسب الـ setup ديالك
import axiosInstance from "axios"; 
import { toast } from "sonner";
import { UserPlus, Trash2 } from "lucide-react";

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
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
      toast.error("Erreur lors du chargement du staff");
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
      toast.success("Membre du staff ajouté !");
      setShowModal(false);
      setFormData({ name: "", email: "", password: "", role: "biologiste" });
      fetchStaff();
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      try {
        const token = localStorage.getItem("token");
        await axiosInstance.delete(`http://projet_pff.test/api/admin/staff/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Utilisateur supprimé !");
        fetchStaff();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
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
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>👥 Gestion du Staff</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Gérez les comptes des biologistes et préleveurs du laboratoire</p>
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
          <UserPlus size={16} /> Ajouter du Personnel
        </button>
      </div>

      {/* Table Section */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Chargement...</div>
        ) : staff.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Aucun membre du staff trouvé.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                <th style={{ padding: '14px 20px' }}>Nom Complet</th>
                <th style={{ padding: '14px 20px' }}>Email</th>
                <th style={{ padding: '14px 20px' }}>Rôle</th>
                <th style={{ padding: '14px 20px', textAlign: 'center' }}>Actions</th>
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
                      {member.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(member.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
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
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', marginTop: 0 }}>Nouveau Compte Staff</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Nom Complet</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  placeholder="Ex: Anas"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Adresse Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  placeholder="Ex: anas@helixlab.com"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Mot de passe</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', boxSizing: 'border-box' }}
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Rôle Affecté</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', background: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="biologiste">Biologiste</option>
                  <option value="preleveur">Préleveur</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Créer le compte
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