import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PrendreRendezVous = () => {
    // 1. الحالات (States) ديال الفورم
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        date_rendez_vous: ''
    });

    const [analyses, setAnalyses] = useState([]); // باش نجيبو أنواع التحليلات من الـ DB
    const [step, setStep] = useState(1); // التحكم ف الـ Steps (1 أو 2)
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);

    // 2. نجيبو ليديرست ديال التحليلات ملي تحل الصفحة
    useEffect(() => {
        axios.get('http://Projet_PFF.test/api/analyses') // تأكد من هاد الـ Route عندك
            .then(res => setAnalyses(res.data))
            .catch(err => console.error("Erreur analyses:", err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. الخطوة الأولى: صيفط الكود للـ إيميل
    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://Projet_PFF.test/api/rendezvous/send-code', {
                email: formData.email
            });
            
            if (response.data.statut === 'success') {
                toast.success(response.data.message);
                setStep(2); // دوز للخطوة التانية
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur lors de l'envoi du code");
        } finally {
            setLoading(false);
        }
    };

    // 4. الخطوة الثانية: التحقق وتخزين الموعد النهائي
    const handleVerifyAndStore = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://Projet_PFF.test/api/rendezvous/store', {
                ...formData,
                code: verificationCode
            });

            if (response.data.statut === 'success') {
                toast.success("Votre rendez-vous a été enregistré avec succès !");
                // رجع الفورم خاوية ونوض ناضي
                setFormData({ nom: '', prenom: '', telephone: '', email: '',  date_rendez_vous: '' });
                setVerificationCode('');
                setStep(1);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Code incorrect ou expiré");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', background: '#fff' }}>
            <h2 style={{ textAlign: 'center', color: '#333' }}>Prédre un Rendez-vous</h2>
            
            {step === 1 ? (
                /* === ÉTAPE 1: Remplir les informations === */
                <form onSubmit={handleSendCode}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Nom :</label>
                        <input type="text" name="nom" value={formData.nom} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Prénom :</label>
                        <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Téléphone :</label>
                        <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Email :</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                       
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label>Date souhaitée :</label>
                        <input type="date" name="date_rendez_vous" value={formData.date_rendez_vous} onChange={handleChange} required style={inputStyle} />
                    </div>
                    
                    <button type="submit" disabled={loading} style={btnStyle}>
                        {loading ? 'Envoi du code...' : 'Suivant (Vérifier mon Email)'}
                    </button>
                </form>
            ) : (
                /* === ÉTAPE 2: Entrer le code de vérification === */
                <form onSubmit={handleVerifyAndStore}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <p style={{ color: '#666' }}>Un code de vérification a été envoyé à <strong>{formData.email}</strong>.</p>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Entrez le code à 4 chiffres :</label>
                        <input 
                            type="text" 
                            maxLength="4"
                            value={verificationCode} 
                            onChange={(e) => setVerificationCode(e.target.value)} 
                            required 
                            style={{ ...inputStyle, width: '150px', textTransform: 'uppercase', textAlign: 'center', fontSize: '20px', letterSpacing: '5px' }} 
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} style={{ ...btnStyle, background: '#22c55e' }}>
                        {loading ? 'Vérification...' : 'Confirmer le Rendez-vous'}
                    </button>
                    
                    <button type="button" onClick={() => setStep(1)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', width: '100%' }}>
                        Retour / Modifier les infos
                    </button>
                </form>
            )}
        </div>
    );
};

// ستايل خفيف وظريف للـ Inputs والـ Buttons
const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' };

export default PrendreRendezVous;