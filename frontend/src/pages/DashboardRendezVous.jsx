import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const DashboardRendezVous = ({ onRendezVousLoaded }) => {

    const { t } = useTranslation();

    const [rendezVous, setRendezVous] = useState([]);
    const [heures, setHeures] = useState({});
    
    // 🌟 States جداد ديال الـ Modal وأنواع التحاليل
    const [typesAnalyse, setTypesAnalyse] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRdvId, setSelectedRdvId] = useState(null);
    const [selectedTypeAnalyse, setSelectedTypeAnalyse] = useState('');
    const typeAnalyseOptions = Array.from(
        new Map(
            typesAnalyse
                .map((item) => {
                    const type = item.type_analyse || item.typeAnalyse || item;
                    const typeId = item.type_analyse_id || type?.id;

                    if (!typeId) return null;

                    return [
                        String(typeId),
                        {
                            id: String(typeId),
                            label: type?.libelle || item.designation || `Type ${typeId}`
                        }
                    ];
                })
                .filter(Boolean)
        ).values()
    );

    console.log("واش هاد الـ Component كايتـقـرا أصلاً؟");

    // 1️⃣ أولاً: جلب المواعيد
    const fetchRendezVous = () => {
        const token = localStorage.getItem('token'); 

        axios.get('http://Projet_PFF.test/api/rendezvous', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            console.log("هاااا هي الداتا لّي جات من الباك:", res.data);
            const rendezVousData = Array.isArray(res.data) ? res.data : [];
            setRendezVous(rendezVousData);
            onRendezVousLoaded?.(rendezVousData);
        })
        .catch(err => {
            console.error("Erreur de récupération:", err);
        });
    };

    // 🌟 ثانياً: جلب أنواع التحاليل
    const fetchTypesAnalyse = () => {
        const token = localStorage.getItem('token');

        axios.get('http://Projet_PFF.test/api/type-analyses', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
            setTypesAnalyse(data);
        })
        .catch(err => {
            console.error("Erreur types d'analyse:", err);

            axios.get('http://Projet_PFF.test/api/analyses', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
                setTypesAnalyse(data);
            })
            .catch(error => {
                console.error("Erreur analyses fallback:", error);
            });
        });
    };

    useEffect(() => {
        fetchRendezVous();
        fetchTypesAnalyse();
    }, []);

    // Validation / Annulation
    const handleAction = async (id, statutAct) => {

        const heureFixee = heures[id] || '';

        if (statutAct === 'valide' && !heureFixee) {
            toast.warning(t('rendezvous.choose_hour'));
            return;
        }

        const token = localStorage.getItem('token'); 

        try {

            const response = await axios.put(
                `http://Projet_PFF.test/api/rendezvous/${id}/statut`,
                {
                    statut: statutAct,
                    heure_rendez_vous: heureFixee
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.status === 'success' || response.data.statut === 'success') {

                toast.success(response.data.message);
                fetchRendezVous();
            }

        } catch (err) {

            console.error(err);
            toast.error(t('rendezvous.error_update'));

        }
    };

    // 🚀 إرسال للمختبر
    const handlePasserAuLabo = async (e) => {

        e.preventDefault();

        if (!selectedTypeAnalyse) {
            toast.warning(t('rendezvous.select_analysis'));
            return;
        }

        const token = localStorage.getItem('token');

        try {

            const response = await axios.post(
                `http://Projet_PFF.test/api/rendez-vous/${selectedRdvId}/passer-au-labo`,
                {
                    type_analyse_id: Number(selectedTypeAnalyse)
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {

                toast.success(response.data.message);

                setIsModalOpen(false);
                setSelectedTypeAnalyse('');
                fetchRendezVous();

            }

        } catch (err) {

            console.error(err);

            toast.error(
                err.response?.data?.message ||
                t('rendezvous.error_transfer')
            );

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

        <div
            style={{
                flex: 1,
                flexGrow: 1,
                minWidth: 0,
                width: '100%',
                padding: '20px',
                background: '#f8fafc',
                height: 'calc(100vh - 40px)',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column'
            }}
        >

            <div
                style={{
                    width: '100%',
                    flex: 1,
                    background: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >

                <h2
                    style={{
                        color: '#1e3a8a',
                        marginBottom: '20px',
                        marginTop: 0
                    }}
                >
                    {t('rendezvous.title')}
                </h2>

                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        width: '100%',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px'
                    }}
                >

                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            direction: 'ltr'
                        }}
                    >

                        <thead
                            style={{
                                position: 'sticky',
                                top: 0,
                                background: '#f1f5f9',
                                zIndex: 10
                            }}
                        >

                            <tr
                                style={{
                                    textAlign: 'left',
                                    borderBottom: '2px solid #e2e8f0'
                                }}
                            >

                                <th style={thStyle}>
                                    {t('rendezvous.patient')}
                                </th>

                                <th style={thStyle}>
                                    {t('rendezvous.contact')}
                                </th>

                                <th style={thStyle}>
                                    {t('rendezvous.requested_date')}
                                </th>

                                <th style={thStyle}>
                                    {t('rendezvous.fix_time')}
                                </th>

                                <th style={thStyle}>
                                    {t('common.status')}
                                </th>

                                <th style={thStyle}>
                                    {t('common.actions')}
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {rendezVous && rendezVous.map(rv => (

                                <tr
                                    key={rv.id}
                                    style={{
                                        borderBottom: '1px solid #e2e8f0',
                                        background: '#fff'
                                    }}
                                >

                                    <td style={tdStyle}>
                                        <strong>{rv.nom.toUpperCase()}</strong> {rv.prenom}
                                    </td>

                                    <td style={tdStyle}>
                                        {rv.telephone}
                                        <br />

                                        <span
                                            style={{
                                                fontSize: '12px',
                                                color: '#64748b'
                                            }}
                                        >
                                            {rv.email}
                                        </span>
                                    </td>

                                    <td style={tdStyle}>
                                        {rv.date_rendez_vous}
                                    </td>

                                    <td style={tdStyle}>

                                        {rv.statut === 'en_cours' ? (

                                            <input
                                                type="time"
                                                value={heures[rv.id] || ''}
                                                onChange={(e) =>
                                                    handleHeureChange(rv.id, e.target.value)
                                                }
                                                style={{
                                                    padding: '5px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #cbd5e1'
                                                }}
                                            />

                                        ) : (

                                            <span>
                                                {rv.heure_rendez_vous || '--:--'}
                                            </span>

                                        )}

                                    </td>

                                    <td style={tdStyle}>

                                        <span
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: 'bold',

                                                background:
                                                    rv.statut === 'en_cours'
                                                        ? '#fef3c7'
                                                        : rv.statut === 'valide'
                                                        ? '#d1fae5'
                                                        : '#fee2e2',

                                                color:
                                                    rv.statut === 'en_cours'
                                                        ? '#b45309'
                                                        : rv.statut === 'valide'
                                                        ? '#065f46'
                                                        : '#991b1b'
                                            }}
                                        >

                                            {rv.statut}

                                        </span>

                                    </td>

                                    <td style={tdStyle}>

                                        {rv.statut === 'en_cours' && (

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '10px'
                                                }}
                                            >

                                                <button
                                                    onClick={() =>
                                                        handleAction(rv.id, 'valide')
                                                    }
                                                    style={{
                                                        ...btnStyle,
                                                        background: '#22c55e'
                                                    }}
                                                >
                                                    {t('common.validate')}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleAction(rv.id, 'annule')
                                                    }
                                                    style={{
                                                        ...btnStyle,
                                                        background: '#ef4444'
                                                    }}
                                                >
                                                    {t('common.cancel')}
                                                </button>

                                            </div>

                                        )}

                                        {rv.statut === 'valide' && (

                                            <button
                                                onClick={() =>
                                                    openAnalyseModal(rv.id)
                                                }
                                                style={{
                                                    ...btnStyle,
                                                    background: '#3b82f6'
                                                }}
                                            >

                                                {t('rendezvous.saisir_analyse')}

                                            </button>

                                        )}

                                        {rv.statut === 'traite' && (

                                            <span
                                                style={{
                                                    color: '#94a3b8',
                                                    fontSize: '13px'
                                                }}
                                            >

                                                {t('rendezvous.at_lab')}

                                            </span>

                                        )}

                                        {rv.statut === 'annule' && (

                                            <span
                                                style={{
                                                    color: '#ef4444',
                                                    fontSize: '13px'
                                                }}
                                            >

                                                {t('common.cancel')}

                                            </span>

                                        )}

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* Modal */}

            {isModalOpen && (

                <div style={modalOverlayStyle}>

                    <div style={modalContentStyle}>

                        <h3
                            style={{
                                color: '#1e3a8a',
                                marginBottom: '15px'
                            }}
                        >

                            {t('rendezvous.modal_title')}

                        </h3>

                        <form onSubmit={handlePasserAuLabo}>

                            <div style={{ marginBottom: '20px' }}>

                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#475569',
                                        fontWeight: 'bold'
                                    }}
                                >

                                    {t('rendezvous.analysis_type')}

                                </label>

                                <select
                                    value={selectedTypeAnalyse}
                                    onChange={(e) =>
                                        setSelectedTypeAnalyse(e.target.value)
                                    }
                                    style={selectStyle}
                                    required
                                >

                                    <option value="">
                                        {t('common.choose')}
                                    </option>

                                    {typeAnalyseOptions.map(type => (

                                        <option
                                            key={type.id}
                                            value={type.id}
                                        >

                                            {type.label}

                                        </option>

                                    ))}

                                </select>

                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '10px'
                                }}
                            >

                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        ...btnStyle,
                                        background: '#94a3b8'
                                    }}
                                >

                                    {t('common.cancel')}

                                </button>

                                <button
                                    type="submit"
                                    style={{
                                        ...btnStyle,
                                        background: '#22c55e'
                                    }}
                                >

                                    {t('common.save')}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );
};

// Styles
const thStyle = {
    padding: '12px',
    color: '#475569',
    fontWeight: 'bold'
};

const tdStyle = {
    padding: '12px',
    color: '#334155'
};

const btnStyle = {
    border: 'none',
    padding: '6px 12px',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalContentStyle = {
    background: '#fff',
    padding: '25px',
    borderRadius: '8px',
    width: '400px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
};

const selectStyle = {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    color: '#334155',
    background: '#fff'
};

export default DashboardRendezVous;
