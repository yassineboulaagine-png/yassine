import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    CalendarCheck,
    IdCard,
    LogIn,
    MailCheck,
    ShieldCheck
} from 'lucide-react';
import { useTranslation } from "react-i18next";
import './PrendreRendezVous.css';

const PrendreRendezVous = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        sexe: '',
        date_naissance: '',
        cin: '',
        date_rendez_vous: ''
    });

    const [, setAnalyses] = useState([]);
    const [step, setStep] = useState(1);
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();

    useEffect(() => {
        axios.get('http://Projet_PFF.test/api/analyses')
            .then(res => setAnalyses(res.data))
            .catch(err => console.error("Erreur analyses:", err));
    }, []);

    const handleChange = (e) => {
        const value = e.target.name === 'cin' ? e.target.value.toUpperCase() : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

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
            toast.error(err.response?.data?.message || t('appointment_form.send_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndStore = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://Projet_PFF.test/api/rendezvous/store', {
                ...formData,
                code: verificationCode
            });

            if (response.data.statut === 'success' || response.data.status === 'success') {
                toast.success(t('appointment_form.success'));
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
        <main className="appointment-page">
            <section className="appointment-shell">
                <aside className="appointment-visual" aria-hidden="true">
                    <div className="appointment-brand">
                        <span className="appointment-brand-mark">
                            <CalendarCheck size={24} />
                        </span>
                        <span>Helix Lab</span>
                    </div>

                    <div className="appointment-visual-content">
                        <div className="appointment-visual-icon">
                            <ShieldCheck size={34} />
                        </div>
                        <h1>{t('appointment_form.title')}</h1>
                        <div className="appointment-visual-tags">
                            <span><MailCheck size={15} />{t('appointment_form.email')}</span>
                            <span><IdCard size={15} />{t('appointment_form.cin')}</span>
                            <span><CalendarCheck size={15} />{t('appointment_form.desired_date')}</span>
                        </div>
                    </div>
                </aside>

                <div className="appointment-form-panel">
                    <div className="appointment-panel-header">
                        <div>
                            <span className="appointment-kicker">Helix Lab</span>
                            <h2>{t('appointment_form.title')}</h2>
                        </div>

                        <div className="appointment-steps" aria-label={`Etape ${step} sur 2`}>
                            <span className={step === 1 ? 'active' : ''}>1</span>
                            <span className={step === 2 ? 'active' : ''}>2</span>
                        </div>
                    </div>

                    {step === 1 ? (
                        <form className="appointment-form" onSubmit={handleSendCode}>
                            <div className="appointment-grid">
                                <label className="appointment-field">
                                    <span>{t('appointment_form.nom')}</span>
                                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
                                </label>

                                <label className="appointment-field">
                                    <span>{t('appointment_form.prenom')}</span>
                                    <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />
                                </label>

                                <label className="appointment-field">
                                    <span>{t('appointment_form.phone')}</span>
                                    <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} required />
                                </label>

                                <label className="appointment-field">
                                    <span>{t('appointment_form.email')}</span>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </label>

                                <label className="appointment-field">
                                    <span>{t('appointment_form.sexe')}</span>
                                    <select name="sexe" value={formData.sexe} onChange={handleChange} required>
                                        <option value="">{t('appointment_form.select_sexe')}</option>
                                        <option value="M">{t('appointment_form.male')}</option>
                                        <option value="F">{t('appointment_form.female')}</option>
                                    </select>
                                </label>

                                <label className="appointment-field">
                                    <span>{t('appointment_form.birth_date')}</span>
                                    <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required />
                                </label>

                                <label className="appointment-field">
                                    <span>{t('appointment_form.cin')}</span>
                                    <input type="text" name="cin" placeholder="Ex: AB12345" value={formData.cin} onChange={handleChange} required />
                                </label>

                                <label className="appointment-field">
                                    <span>{t('appointment_form.desired_date')}</span>
                                    <input type="date" name="date_rendez_vous" value={formData.date_rendez_vous} onChange={handleChange} required />
                                </label>
                            </div>

                            <div className="appointment-actions">
                                <button type="submit" disabled={loading} className="appointment-button appointment-button-primary">
                                    <span>{loading ? t('verification.sent') : t('appointment_form.btn_next')}</span>
                                    <ArrowRight size={18} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="appointment-button appointment-button-secondary"
                                >
                                    <LogIn size={18} />
                                    <span>{t('appointment_form.btn_login_patient')}</span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="appointment-form appointment-verification" onSubmit={handleVerifyAndStore}>
                            <div className="appointment-verification-icon">
                                <MailCheck size={34} />
                            </div>

                            <p className="appointment-verification-message">
                                {t('verification.msg_sent')} <strong>{formData.email}</strong>.
                            </p>

                            <label className="appointment-code-field">
                                <span>{t('verification.enter_code')}</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="4"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    required
                                />
                            </label>

                            <div className="appointment-actions">
                                <button type="submit" disabled={loading} className="appointment-button appointment-button-success">
                                    <span>{loading ? t('verification.btn_loading') : t('verification.btn_confirm')}</span>
                                    <CalendarCheck size={18} />
                                </button>

                                <button type="button" onClick={() => setStep(1)} className="appointment-back-button">
                                    <ArrowLeft size={17} />
                                    <span>{t('verification.btn_back')}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default PrendreRendezVous;
