import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { use } from 'react';

const DashboardRendezVous = () => {
    const [rendezVous, setRendezVous] = useState([]);
    const [heures, setHeures] = useState({});
    console.log("واش هاد الـ Component كايتـقـرا أصلاً؟"); // لتخزين الساعة لكل موعد بشكل منفصل

   // 1️⃣ أولاً: الـ دالّـة مـعـزولـة وحـدهـا كـاتـسـالـي فـ الـقـوس ديـالـهـا
const fetchRendezVous = () => {
    const token = localStorage.getItem('token'); 

    axios.get('http://Projet_PFF.test/api/rendezvous', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {
        console.log("هاااا هي الداتا لّي جات من الباك:", res.data);
        setRendezVous(res.data);
    })
    .catch(err => {
        console.error("Erreur de récupération:", err);
    });
}; // 👈 الـ دالّـة تـسـالـي هـنـا بّـالـظّـبـط!

// 2️⃣ ثـانـيـاً: الـ `useEffect` مـحـطـوطـة وحـدهـا لـتـحـت بـاش تـعـيّـط عـلـى الـ دالّـة
useEffect(() => {
    fetchRendezVous();
}, []);

   const handleAction = async (id, statutAct) => {
    const heureFixee = heures[id] || '';
    if (statutAct === 'valide' && !heureFixee) {
        toast.warn("Veuillez choisir une heure avant de valider !");
        return;
    }

    // 🔑 1. كنجيبو الـ Token من الـ localStorage هنايا
    const token = localStorage.getItem('token'); 

    try {
        // 🚀 2. كنمررو الـ Headers ف البلاصة الصحيحة ديالها مع الـ Axios PUT
        const response = await axios.put(`http://Projet_PFF.test/api/rendezvous/${id}/statut`, {
            statut: statutAct,
            heure_rendez_vous: heureFixee
        }, {
            headers: {
                Authorization: `Bearer ${token}` // 🔒 هادا هو الساروت لّي غايحل القفل د Sanctum
            }
        });

        // 🌟 رد البال هنا رجعت ليك "status" بـ "s" ف الـخر على حساب Laravel كيرجع "status"
        if (response.data.status === 'success' || response.data.statut === 'success') {
            toast.success(response.data.message);
            fetchRendezVous(); // عاود جيب الـ داتا الجديدة أوتوماتيك
        }
    } catch (err) {
        console.error(err); // باش تلمح إيلا كان شي بلان آخر ف الـ Console
        toast.error("Erreur lors de la modification");
    }
};

const handleHeureChange = (id, val) => {
    setHeures({ ...heures, [id]: val });
};
    return (
        <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
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
                                    {rv.statut === 'en_cours' && (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleAction(rv.id, 'valide')} style={{ ...btnStyle, background: '#22c55e' }}>Valider</button>
                                            <button onClick={() => handleAction(rv.id, 'annule')} style={{ ...btnStyle, background: '#ef4444' }}>Annuler</button>
                                        </div>
                                    )}
                                    {rv.statut !== 'en_cours' && <span style={{ color: '#94a3b8', fontSize: '13px' }}>Traité</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const thStyle = { padding: '12px', color: '#475569', fontWeight: 'bold' };
const tdStyle = { padding: '12px', color: '#334155' };
const btnStyle = { border: 'none', padding: '6px 12px', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default DashboardRendezVous;