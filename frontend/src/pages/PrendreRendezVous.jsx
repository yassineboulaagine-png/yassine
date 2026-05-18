import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from "react-i18next";


const PrendreRendezVous = () => {

    const navigate = useNavigate();
    
    // 1. الحالات (States) ديال الفورم بعد ما زدنا الخانات الجداد 🚀
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        sexe: '',           // 👈 تزاد هنا
        date_naissance: '',  // 👈 تزاد هنا
        cin: '',             // 👈 تزاد هنا
        date_rendez_vous: ''
    });

    const [analyses, setAnalyses] = useState([]); 
    const [step, setStep] = useState(1); 
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);

    const {t,i18n} = useTranslation();
    
      const changeLanguage = (e) => {
        const selectedLanguage = e.target.value;
        i18n.changeLanguage(selectedLanguage);
        
        // 💡 بلان إضافي: باش تقلب الاتجاه د الصفحة (RTL) إلى تختار العَرَبية
        if (selectedLanguage === 'ar') {
          document.body.dir = 'rtl';
        } else {
          document.body.dir = 'ltr';
        }
      };

    // 2. نجيبو ليديرست ديال التحليلات ملي تحل الصفحة
    useEffect(() => {
        axios.get('http://Projet_PFF.test/api/analyses') 
            .then(res => setAnalyses(res.data))
            .catch(err => console.error("Erreur analyses:", err));
    }, []);

    const handleChange = (e) => {
        // لقطة زوينة للـ CIN باش يرجع ديما حروف كبار أوتوماتيك كيفما كتبو المريض
        const value = e.target.name === 'cin' ? e.target.value.toUpperCase() : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    // 3. الخطوة الأولى: صيفط الكود للـ إيميل
    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);

        const browserLang = navigator.language || navigator.userLanguage;

        const userLang = browserLang.startsWith('ar') ? 'ar' : 'fr';


        try {
            const response = await axios.post('http://Projet_PFF.test/api/rendezvous/send-code', {
                email: formData.email,
                lang: userLang
            });
            
            if (response.data.statut === 'success' || response.data.status === 'success') {
                toast.success(response.data.message);
                setStep(2); 
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur lors de l'envoi du code");
        } finally {
            setLoading(false);
        }
    };

    // 4. الخطوة الثانية: التحقق وتخزين الموعد النهائي (الداتا كتمشي كاملة مكمولة للباك)
    const handleVerifyAndStore = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://Projet_PFF.test/api/rendezvous/store', {
                ...formData, // 🚀 هنا غاتمشي الداتا كاملة فيها حتى الـ cin والـ sexe والتاريخ
                code: verificationCode
            });

            if (response.data.statut === 'success' || response.data.status === 'success') {
                toast.success("Votre rendez-vous a été enregistré avec succès !");
                // رجع الفورم خاوية ونوض ناضي
                setFormData({ 
                    nom: '', prenom: '', telephone: '', email: '', 
                    sexe: '', date_naissance: '', cin: '', date_rendez_vous: '' 
                });
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
            <h2 style={{ textAlign: 'center', color: '#333' }}>{t('appointment_form.title')}</h2>
            
            {step === 1 ? (
                /* === ÉTAPE 1: Remplir les informations === */
                <form onSubmit={handleSendCode}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>{t('appointment_form.nom')}</label>
                        <input type="text" name="nom" value={formData.nom} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>{t('appointment_form.prenom')}</label>
                        <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>{t('appointment_form.phone')}</label>
                        <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>{t('appointment_form.email')}</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
                    </div>

                    {/* 🚀 الخانات الجداد تزادو هنا مورا الـ Email نِيشان باش يجي الديزاين منسق */}
                    <div style={{ marginBottom: '15px' }}>
                        <label>{t('appointment_form.sexe')}</label>
                        <select name="sexe" value={formData.sexe} onChange={handleChange} required style={inputStyle}>
                            <option value="">-- {t('appointment_form.select_sexe')} --</option>
                            <option value="M">{t('appointment_form.male')}</option>
                            <option value="F">{t('appointment_form.female')}</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>{t('appointment_form.birth_date')}</label>
                        <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required style={inputStyle} />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>{t('appointment_form.cin')}</label>
                        <input type="text" name="cin" placeholder="Ex: AB12345" value={formData.cin} onChange={handleChange} required style={inputStyle} />
                    </div>
                    {/* ---------------------------------------------------- */}

                    <div style={{ marginBottom: '20px' }}>
                        <label>{t('appointment_form.desired_date')}</label>
                        <input type="date" name="date_rendez_vous" value={formData.date_rendez_vous} onChange={handleChange} required style={inputStyle} />
                    </div>
                    
                    <button type="submit" disabled={loading} style={btnStyle}>
                        {loading ? 'Envoi du code...' : t('appointment_form.btn_next')}
                    </button>

                    <div style={{ marginTop: '15px', textAlign: 'center' }}>
    <button 
        type="button" 
        onClick={() => navigate('/login')} // 🎯 كتطير بيه نيشان لـ Login.jsx
        style={{
            width: '100%',
            backgroundColor: '#64748b', // لون رمادي أنيق ومهني
            color: 'white',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '15px',
            transition: 'background 0.3s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#475569'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#64748b'}
    >
        ⬅ {t('appointment_form.btn_login_patient')}
    </button>
</div>
                </form>
            ) : (
                /* === ÉTAPE 2: Entrer le code de vérification === */
                <form onSubmit={handleVerifyAndStore}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <p style={{ color: '#666' }}>{t('verification.msg_sent')} <strong>{formData.email}</strong>.</p>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>{t('verification.enter_code')}</label>
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
                        {loading ? t('verification.btn_loading') : t('verification.btn_confirm')}
                    </button>
                    
                    <button type="button" onClick={() => setStep(1)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', width: '100%' }}>
                        {t('verification.btn_back')}
                    </button>

                    {/* 🚀 حط هاد البارتي تحت البوطونة الزرقاء د الـ Suivant نِيشان لداخل ف الـ Step 1 */}

                </form>
            )}
        </div>
    );
};

const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' };

export default PrendreRendezVous;