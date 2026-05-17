import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DashboardRendezVous = () => {
    const [rendezVous, setRendezVous] = useState([]);
    const [heures, setHeures] = useState({});
    
    // 🌟 States جداد ديال الـ Modal وأنواع التحاليل
    const [typesAnalyse, setTypesAnalyse] = useState([]); // لتخزين أنواع التحاليل من الداتابيز
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRdvId, setSelectedRdvId] = useState(null);
    const [selectedTypeAnalyse, setSelectedTypeAnalyse] = useState('');

    console.log("واش هاد الـ Component كايتـقـرا أصلاً؟");

    // 1️⃣ أولاً: جلب المواعيد
    const fetchRendezVous = () => {
        const token = localStorage.getItem('token'); 
        axios.get('http://Projet_PFF.test/api/rendezvous', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            console.log("هاااا هي الداتا لّي جات من الباك:", res.data);
            setRendezVous(res.data);
        })
        .catch(err => {
            console.error("Erreur de récupération:", err);
        });
    };

    // 🌟 ثانياً: جلب أنواع التحاليل باش نعمرو الـ Select أوتوماتيك
    const fetchTypesAnalyse = () => {
        const token = localStorage.getItem('token');
        axios.get('http://Projet_PFF.test/api/analyses', { // 🚨 تأكد من هاد الـ URL عندك ف الباك
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setTypesAnalyse(res.data);
        })
        .catch(err => {
            console.error("Erreur types d'analyse:", err);
        });
    };

    useEffect(() => {
        fetchRendezVous();
        fetchTypesAnalyse(); // جيب أنواع التحاليل ف الدخلة
    }, []);

    // دالة التحكم ف الـ Validation والـ Annulation د الموعد الافتراضي
    const handleAction = async (id, statutAct) => {
        const heureFixee = heures[id] || '';
        if (statutAct === 'valide' && !heureFixee) {
            toast.warn("Veuillez choisir une heure avant de valider !");
            return;
        }

        const token = localStorage.getItem('token'); 

        try {
            const response = await axios.put(`http://Projet_PFF.test/api/rendezvous/${id}/statut`, {
                statut: statutAct,
                heure_rendez_vous: heureFixee
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success' || response.data.statut === 'success') {
                toast.success(response.data.message);
                fetchRendezVous(); 
            }
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la modification");
        }
    };

    // 🚀 دالة إرسال المريض إلى جدول الـ Examen (Analyses du jour)
    const handlePasserAuLabo = async (e) => {
        e.preventDefault();
        if (!selectedTypeAnalyse) {
            toast.warn("Veuillez sélectionner un type d'analyse !");
            return;
        }

        const token = localStorage.getItem('token');

        try {
            // صيفطنا الـ type_analyse_id للـ API لي قادينا ف الباك لبارح
            const response = await axios.post(`http://Projet_PFF.test/api/rendez-vous/${selectedRdvId}/passer-au-labo`, {
                type_analyse_id: selectedTypeAnalyse
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setIsModalOpen(false); // شد الـ Modal
                setSelectedTypeAnalyse(''); // خوي الـ Select
                fetchRendezVous(); // عاود جيب المواعيد (الموعد غايكون ولى traite وغايختفي)
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Erreur lors du transfert au laboratoire");
        }
    };

    const openAnalyseModal = (id) => {
        setSelectedRdvId(id);
        setIsModalOpen(true);
    };

    const handleHeureChange = (id, val) => {
        setHeures({ ...heures, [id]: val });
    };

    return (
        <div style={{ width: '100%', padding: '20px', background: '#f8fafc', minHeight: '100vh' , boxSizing: 'border-box' }}>
            <div style={{ width:'100%',background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',boxSizing: 'border-box' }}>
                <h2 style={{ color: '#1e3a8a', marginBottom: '20px' }}>Dashboard - Gestion des Rendez-vous</h2>
                
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={thStyle}>Patient</th>
                            <th style={thStyle}>Contact</th>
                            <th style={thStyle}>Date demandée</th>
                            <th style={thStyle}>Fixer l'Heure</th>
                            <th style={thStyle}>Statut</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rendezVous && rendezVous.map(rv => (
                            <tr key={rv.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={tdStyle}><strong>{rv.nom.toUpperCase()}</strong> {rv.prenom}</td>
                                <td style={tdStyle}>{rv.telephone}<br/><span style={{ fontSize: '12px', color: '#64748b' }}>{rv.email}</span></td>
                                <td style={tdStyle}>{rv.date_rendez_vous}</td>
                                <td style={tdStyle}>
                                    {rv.statut === 'en_cours' ? (
                                        <input 
                                            type="time" 
                                            value={heures[rv.id] || ''} 
                                            onChange={(e) => handleHeureChange(rv.id, e.target.value)}
                                            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                        />
                                    ) : (
                                        <span>{rv.heure_rendez_vous || '--:--'}</span>
                                    )}
                                </td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold',
                                        background: rv.statut === 'en_cours' ? '#fef3c7' : rv.statut === 'valide' ? '#d1fae5' : '#fee2e2',
                                        color: rv.statut === 'en_cours' ? '#b45309' : rv.statut === 'valide' ? '#065f46' : '#991b1b'
                                    }}>
                                        {rv.statut}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    {/* 1. الموعد مازال en_cours: كيبان بوطون Valider و Annuler */}
                                    {rv.statut === 'en_cours' && (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleAction(rv.id, 'valide')} style={{ ...btnStyle, background: '#22c55e' }}>Valider</button>
                                            <button onClick={() => handleAction(rv.id, 'annule')} style={{ ...btnStyle, background: '#ef4444' }}>Annuler</button>
                                        </div>
                                    )}
                                    
                                    {/* 2. 🚀 الموعد تـڤـاليدا: هنا فين غايظهر البوطون الجديد د السحر ديالنا لـ الساير د التحليلة */}
                                    {rv.statut === 'valide' && (
                                        <button onClick={() => openAnalyseModal(rv.id)} style={{ ...btnStyle, background: '#3b82f6' }}>
                                            Saisir Analyse
                                        </button>
                                    )}

                                    {/* 3. الموعد تخدم وسالا (traite) */}
                                    {rv.statut === 'traite' && <span style={{ color: '#94a3b8', fontSize: '13px' }}>Au Labo 🧪</span>}
                                    
                                    {rv.statut === 'annule' && <span style={{ color: '#ef4444', fontSize: '13px' }}>Annulé</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 🎨 الـ Modal د الساير د التحليلة (كيظهر غير يلا كليكينا على Saisir Analyse) */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ color: '#1e3a8a', marginBottom: '15px' }}>Sélectionner le Type d'Analyse</h3>
                        <form onSubmit={handlePasserAuLabo}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>Type d'analyse :</label>
                                <select 
                                    value={selectedTypeAnalyse} 
                                    onChange={(e) => setSelectedTypeAnalyse(e.target.value)}
                                    style={selectStyle}
                                    required
                                >
                                    <option value="">-- Choisir une analyse --</option>
                                    {typesAnalyse.map(type => (
                                        <option key={type.id} value={type.id}>
                                            {type.designation} ({type.type_analyse?.libelle}) {/* أو libelle على حسب شنو مسمي خانة الاسم ف جدولك */}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ ...btnStyle, background: '#94a3b8' }}>
                                    Annuler
                                </button>
                                <button type="submit" style={{ ...btnStyle, background: '#22c55e' }}>
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// الـ Styles المستعملة ف الجدول والـ Modal
const thStyle = { padding: '12px', color: '#475569', fontWeight: 'bold' };
const tdStyle = { padding: '12px', color: '#334155' };
const btnStyle = { border: 'none', padding: '6px 12px', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalContentStyle = {
    background: '#fff', padding: '25px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
};

const selectStyle = {
    width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#334155', background: '#fff'
};

export default DashboardRendezVous;