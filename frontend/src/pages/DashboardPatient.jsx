import { useState } from "react";
import { Search, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import "./Login.css";

const DashboardPatient = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  // زيد هادي حدا الـ code
  const [phone, setPhone] = useState("");

  // حيدنا التايب سكريبت من الـ Event (e)
  const handleSearch = async (e) => {
  e.preventDefault();
  
  if (!code || !phone) { // تأكد بلي زدتي State ديال phone
    toast.error("Veuillez remplir tous les champs");
    return;
  }
  
  setLoading(true);
  
  try {
    // 1. عيط للـ Backend
    const response = await axios.post("http://projet_pff.test/api/patient/check-access", {
      reference: code,
      telephone: phone
    });

    if (response.data.success) {
      toast.success("Accès autorisé !");
      
      // 2. خزن الـ ID فـ localStorage باش نجبدو النتائج فـ الصفحة الجاية
      localStorage.setItem("patient_exam_id", response.data.exam_id);
      
      // 3. ديه لصفحة النتائج
      navigate("/patient/results"); 
    }
  } catch (error) {
    // إيلا المعلومات غلط
    const msg = error.response?.data?.message || "Informations incorrectes";
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
      <div className="patient-access-container">
        <div className="patient-header">
          {/* أي Class فيها Tailwind (flex, items-center...) غاتخدم يلا كنتي منصبو */}
          <FileText size={48} className="mx-auto text-blue-600 mb-4" />
          <h1 className="patient-title">Espace Patient</h1>
          <p className="patient-desc">
            Saisissez le code figurant sur votre ticket pour consulter vos résultats.
          </p>
        </div>

        <form onSubmit={handleSearch}>
          <div className="code-input-group">
            <input
              type="text"
              className="code-input"
              
              value={code}
              // كنحولو الحروف لـ Capital أوتوماتيكياً
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={12}
            />
          </div>

          <button type="submit" className="btn-consult" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Search size={20} />
                Consulter mes résultats
              </div>
            )}
          </button>
        </form>

        <p className="mt-8 text-xs text-slate-400">
          En cas de problème, veuillez contacter le secrétariat du laboratoire.
        </p>
      </div>
    </div>
  );
};

export default DashboardPatient;