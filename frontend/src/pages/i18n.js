import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {

      // ================= SIDEBAR =================
      sidebar: {
        patients_list: "Liste Patients",
        today_analyses: "Analyses du jour",
        appointments_management: "Gestion des Rendez-vous",
        logout: "Déconnexion"
      },

      // ================= HEADER =================
      header: {
        space: "Espace"
      },

      // ================= COMMON =================
      common: {
        actions: "Actions",
        status: "Statut",
        loading: "Chargement...",
        cancel: "Annuler",
        validate: "Valider",
        delete: "Supprimer",
        modify: "Modifier",
        save: "Enregistrer",
        finish: "Terminer",
        choose: "-- Choisir --",
        confirm_delete: "Supprimer ce patient ?",
        confirm_cancel_exam: "Annuler cet examen ?"
      },

      // ================= PATIENTS =================
      patients: {
        search_placeholder: "Rechercher par CIN ou Nom...",
        new_patient: "Nouveau Patient",
        name_prenom: "Nom & Prénom",
        sexe: "Sexe",
        cin: "CIN",
        phone: "Téléphone",
        birth_date: "Date Naissance",
        new_exam: "Nouvel Examen"
      },

      // ================= ANALYSES =================
      analyses: {
        reference: "Référence",
        patient: "Patient",
        exam: "Examen",
        no_analyses: "Aucune analyse."
      },

      // ================= RENDEZVOUS =================
      rendezvous: {
        title: "Dashboard - Gestion des Rendez-vous",
        patient: "Patient",
        contact: "Contact",
        requested_date: "Date demandée",
        fix_time: "Fixer l'Heure",
        saisir_analyse: "Saisir Analyse",
        at_lab: "Au Labo 🧪",
        modal_title: "Sélectionner le Type d'Analyse",
        analysis_type: "Type d'analyse",
        choose_hour: "Veuillez choisir une heure avant de valider !",
        error_update: "Erreur lors de la modification",
        select_analysis: "Veuillez sélectionner un type d'analyse !",
        error_transfer: "Erreur lors du transfert au laboratoire"
      },

      // ================= LOGIN =================
      login: {
        tab_personnel: "Personnel",
        tab_patient: "Patient",
        email_label: "Email",
        password_label: "Mot de passe",
        submit_btn: "Se Connecter",
        btn_results: "Voir mes Résultats",
        no_appointment: "Vous n'avez pas de rendez-vous ?",
        take_appointment: "Prendre un rendez-vous",
        phone_label: "N° de Téléphone",
        reference_label: "Référence d'examen",
        charger: "Chargement..."
      },

      // ================= APPOINTMENT FORM =================
      appointment_form: {
        title: "Prendre un Rendez-vous",
        nom: "Nom",
        prenom: "Prénom",
        phone: "Téléphone",
        email: "Email",
        sexe: "Sexe",
        select_sexe: "-- Sélectionner --",
        male: "Masculin",
        female: "Féminin",
        birth_date: "Date de naissance",
        cin: "CIN",
        desired_date: "Date souhaitée",
        btn_next: "Suivant (Vérifier mon Email)",
        btn_login_patient: "Se connecter (Espace Patient) ➔"
      },

      // ================= VERIFICATION =================
      verification: {
        msg_sent: "Un code de vérification a été envoyé à",
        enter_code: "Entrez le code à 4 chiffres :",
        btn_confirm: "Confirmer le Rendez-vous",
        btn_loading: "Vérification...",
        btn_back: "Retour / Modifier les infos",
        sent: "Envoi du code..."
      },

      // ================= PROFILE =================
      profile: {
        back: "Retour",
        uploading: "Upload...",
        change_photo: "Cliquez pour changer",
        my_profile: "Mon Profil",
        email: "Adresse Email",
        password: "Mot de passe",
        edit_profile: "Modifier le profil",
        patients: "Patients",
        patient_desc: "Inscriptions réalisées par vous",
        avatar_success: "Avatar mis à jour avec succès!",
        avatar_error: "Erreur lors de la mise à jour de l'avatar",
        error_loading: "Erreur lors du chargement du profil"
      },

      // ================= SETTINGS =================
      settings: {
        back: "Retour",
        my_profile: "Mon Profil",
        full_name: "Nom complet",
        email: "Adresse Email",
        save_changes: "Enregistrer les modifications",
        security: "Sécurité",
        old_password: "Ancien mot de passe",
        new_password: "Nouveau mot de passe",
        confirm_password: "Confirmer le nouveau mot de passe",
        update_password: "Mettre à jour le mot de passe",

        profile_updated: "Informations mises à jour !",
        profile_update_error: "Erreur lors de la mise à jour",
        password_not_match: "Les mots de passe ne correspondent pas !",
        password_updated: "Mot de passe changé avec succès !",
        old_password_incorrect: "Erreur : l'ancien mot de passe est incorrect"
      },

      // ================= DASHBOARD BIOLOGISTE =================
      biologiste: {
        sidebar: {
          myAnalyses: "Mes Analyses",
          validation: "Validation",
          history: "Historique",
          logout: "Déconnexion"
        },

        header: {
          title: "Espace Biologiste"
        },

        loading: "Chargement...",
        noAnalysis: "Aucune analyse en cours.",
        noValidation: "Aucune analyse en cours de validation.",
        noHistory: "Aucun historique.",

        table: {
          reference: "Référence",
          patient: "Patient",
          exam: "Examen",
          status: "Statut",
          actions: "Actions",
          results: "Résultats"
        },

        buttons: {
          enter: "Saisir",
          approve: "Approuver",
          view: "Voir",
          modify: "Modifier",
          cancel: "Annuler",
          save: "Enregistrer"
        },

        toast: {
          newAnalysis: "{{count}} nouvelle(s) analyse(s)!",
          logoutSuccess: "Déconnexion réussie !",
          resultsSaved: "Résultats saisis ! En cours de validation.",
          approveSuccess: "Examen approuvé !",
          rejectSuccess: "Examen renvoyé pour modification",
          saveError: "Erreur lors de la sauvegarde",
          approveError: "Erreur lors de l'approbation",
          modifyError: "Erreur lors de la modification"
        },

        confirm: {
          rejectExam: "Voulez-vous renvoyer cet examen à la saisie pour modification ?"
        },

        modal: {
          title: "Saisie des Résultats",
          age: "Âge",
          years: "ans",
          male: "👨",
          female: "👩",
          normalRange: "Norme",
          valuePlaceholder: "Valeur",
          pathological: "PATHOLOGIQUE",
          medicalComment: "Commentaire médical..."
        }

      },

      // ================= PROFILE =================
profile: {
  back: "Retour",
  uploading: "Upload...",
  change_photo: "Cliquez pour changer",
  my_profile: "Mon Profil",

  email: "Adresse Email",
  password: "Mot de passe",

  edit_profile: "Modifier le profil",

  validated_analyses: "Analyses Validées",
  pathological_alerts: "Alertes Pathologiques",

  avatar_success: "Avatar mis à jour avec succès!",
  avatar_error: "Erreur lors de la mise à jour de l'avatar",

  error_loading: "Erreur lors du chargement du profil"
},
    }
  },

  ar: {
    translation: {

      // ================= SIDEBAR =================
      sidebar: {
        patients_list: "لائحة المرضى",
        today_analyses: "تحاليل اليوم",
        appointments_management: "تسيير المواعيد",
        logout: "تسجيل الخروج"
      },

      // ================= HEADER =================
      header: {
        space: "فضاء"
      },

      // ================= COMMON =================
      common: {
        actions: "الإجراءات",
        status: "الحالة",
        loading: "جارٍ التحميل...",
        cancel: "إلغاء",
        validate: "تأكيد",
        delete: "حذف",
        modify: "تعديل",
        save: "حفظ",
        finish: "إنهاء",
        choose: "-- اختر --",
        confirm_delete: "هل أنت متأكد من حذف هذا المريض؟",
        confirm_cancel_exam: "هل أنت متأكد من إلغاء هذا الفحص؟"
      },

      // ================= PATIENTS =================
      patients: {
        search_placeholder: "البحث عن طريق بطاقة التعريف أو الاسم...",
        new_patient: "مريض جديد",
        name_prenom: "الاسم الكامل",
        sexe: "الجنس",
        cin: "رقم بطاقة التعريف",
        phone: "الهاتف",
        birth_date: "تاريخ الازدياد",
        new_exam: "فحص جديد"
      },

      // ================= ANALYSES =================
      analyses: {
        reference: "الرقم المرجعي",
        patient: "المريض",
        exam: "الفحص",
        no_analyses: "لا توجد أي تحاليل اليوم."
      },

      // ================= RENDEZVOUS =================
      rendezvous: {
        title: "لوحة التحكم - تسيير المواعيد",
        patient: "المريض",
        contact: "معلومات الاتصال",
        requested_date: "التاريخ المطلوب",
        fix_time: "تحديد الوقت",
        saisir_analyse: "إدخال التحليل",
        at_lab: "في المختبر 🧪",
        modal_title: "اختيار نوع التحليل",
        analysis_type: "نوع التحليل",
        choose_hour: "المرجو اختيار الوقت قبل التأكيد",
        error_update: "خطأ أثناء التعديل",
        select_analysis: "المرجو اختيار نوع التحليل",
        error_transfer: "خطأ أثناء تحويل الموعد إلى المختبر"
      },

      // ================= LOGIN =================
      login: {
        tab_personnel: "الموظفين",
        tab_patient: "المرضى",
        email_label: "البريد الإلكتروني",
        password_label: "كلمة المرور",
        submit_btn: "تسجيل الدخول",
        btn_results: "عرض نتائجي",
        no_appointment: "ليس لديك موعد؟",
        take_appointment: "احجز موعداً الآن",
        phone_label: "رقم الهاتف",
        reference_label: "الرقم المرجعي للفحص",
        charger: "جارٍ التحميل..."
      },

      // ================= APPOINTMENT FORM =================
      appointment_form: {
        title: "حجز موعد جديد",
        nom: "الاسم العائلي",
        prenom: "الاسم الشخصي",
        phone: "رقم الهاتف",
        email: "البريد الإلكتروني",
        sexe: "الجنس",
        select_sexe: "-- اختر الجنس --",
        male: "ذكر",
        female: "أنثى",
        birth_date: "تاريخ الازدياد",
        cin: "رقم بطاقة التعريف الوطنية",
        desired_date: "التاريخ المطلوب للموعد",
        btn_next: "التالي (التحقق من البريد الإلكتروني)",
        btn_login_patient: "تسجيل الدخول (فضاء المريض)"
      },

      // ================= VERIFICATION =================
      verification: {
        msg_sent: "تم إرسال رمز التحقق إلى",
        enter_code: "أدخل الرمز المكون من 4 أرقام:",
        btn_confirm: "تأكيد الموعد",
        btn_loading: "جارٍ التحقق...",
        btn_back: "الرجوع / تعديل المعلومات",
        sent: "جارٍ إرسال الرمز..."
      },

      // ================= PROFILE =================
      profile: {
        back: "رجوع",
        uploading: "جارٍ الرفع...",
        change_photo: "اضغط لتغيير الصورة",
        my_profile: "ملفي الشخصي",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        edit_profile: "تعديل الملف الشخصي",
        patients: "مرضى",
        patient_desc: "عمليات التسجيل التي قمت بها",
        avatar_success: "تم تحديث الصورة بنجاح",
        avatar_error: "خطأ أثناء تحديث الصورة",
        error_loading: "خطأ أثناء تحميل الملف الشخصي"
      },

      // ================= SETTINGS =================
      settings: {
        back: "رجوع",
        my_profile: "ملفي الشخصي",
        full_name: "الاسم الكامل",
        email: "البريد الإلكتروني",
        save_changes: "حفظ التعديلات",
        security: "الأمان",
        old_password: "كلمة المرور القديمة",
        new_password: "كلمة المرور الجديدة",
        confirm_password: "تأكيد كلمة المرور الجديدة",
        update_password: "تحديث كلمة المرور",

        profile_updated: "تم تحديث المعلومات بنجاح!",
        profile_update_error: "حدث خطأ أثناء التحديث",
        password_not_match: "كلمتا المرور غير متطابقتين!",
        password_updated: "تم تغيير كلمة المرور بنجاح!",
        old_password_incorrect: "خطأ: كلمة المرور القديمة غير صحيحة"
      },

      // ================= DASHBOARD BIOLOGISTE =================
      biologiste: {
        sidebar: {
          myAnalyses: "تحاليلـي",
          validation: "التحقق",
          history: "السجل",
          logout: "تسجيل الخروج"
        },

        header: {
          title: "فضاء أخصائي التحاليل"
        },

        loading: "جارٍ التحميل...",
        noAnalysis: "لا توجد تحاليل قيد المعالجة.",
        noValidation: "لا توجد تحاليل قيد التحقق.",
        noHistory: "لا يوجد سجل.",

        table: {
          reference: "المرجع",
          patient: "المريض",
          exam: "الفحص",
          status: "الحالة",
          actions: "الإجراءات",
          results: "النتائج"
        },

        buttons: {
          enter: "إدخال",
          approve: "الموافقة",
          view: "عرض",
          modify: "تعديل",
          cancel: "إلغاء",
          save: "حفظ"
        },

        toast: {
          newAnalysis: "تمت إضافة {{count}} تحليل(ات) جديد(ة)!",
          logoutSuccess: "تم تسجيل الخروج بنجاح!",
          resultsSaved: "تم إدخال النتائج! في انتظار التحقق.",
          approveSuccess: "تمت الموافقة على الفحص!",
          rejectSuccess: "تمت إعادة الفحص للتعديل",
          saveError: "خطأ أثناء الحفظ",
          approveError: "خطأ أثناء الموافقة",
          modifyError: "خطأ أثناء التعديل"
        },

        confirm: {
          rejectExam: "هل تريد إعادة هذا الفحص للتعديل؟"
        },

        modal: {
          title: "إدخال النتائج",
          age: "العمر",
          years: "سنة",
          male: "👨",
          female: "👩",
          normalRange: "المعدل الطبيعي",
          valuePlaceholder: "القيمة",
          pathological: "غير طبيعي",
          medicalComment: "تعليق طبي..."
        }
      },
      // ================= PROFILE =================
profile: {
  back: "رجوع",
  uploading: "جارٍ الرفع...",
  change_photo: "اضغط لتغيير الصورة",
  my_profile: "ملفي الشخصي",

  email: "البريد الإلكتروني",
  password: "كلمة المرور",

  edit_profile: "تعديل الملف الشخصي",

  validated_analyses: "التحاليل المصادق عليها",
  pathological_alerts: "التنبيهات المرضية",

  avatar_success: "تم تحديث الصورة بنجاح",
  avatar_error: "خطأ أثناء تحديث الصورة",

  error_loading: "خطأ أثناء تحميل الملف الشخصي"
},
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;