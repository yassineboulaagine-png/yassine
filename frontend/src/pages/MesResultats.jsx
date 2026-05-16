import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, AlertCircle, User, Calendar, FileText, Loader } from "lucide-react";
import { toast } from "sonner";

const MesResultats = () => {
  const [patient, setPatient] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem("token");
    console.log("=== MesResultats Debug ===");
    console.log("All localStorage keys:", Object.keys(localStorage));
    console.log("Token from localStorage:", storedToken);
    console.log("Token type:", typeof storedToken);
    console.log("Token is valid:", storedToken && storedToken !== "undefined" && storedToken.length > 0);
    
    // Check all possible token keys
    const possibleTokens = [
      localStorage.getItem("token"),
      localStorage.getItem("auth_token"),
      localStorage.getItem("access_token"),
      localStorage.getItem("api_token"),
    ];
    console.log("Possible tokens:", possibleTokens);
    
    // Use valid token or show error
    const validToken = storedToken && storedToken !== "undefined" ? storedToken : null;
    
    if (!validToken) {
      console.log("❌ No valid token found");
      setError("Vous devez être connecté pour voir vos résultats. Token non trouvé dans localStorage.");
      setLoading(false);
      return;
    }

    console.log("✅ Token found, fetching data...");
    setToken(validToken);
    
    
  }, []);

 
    useEffect(() => {
  const loadAllData = async () => {
    try {
      const examStr = localStorage.getItem('currentExamen');
      if (!examStr) return;
      
      const exam = JSON.parse(examStr);
      console.log("🔄 Fetching data for exam ID:", exam.id);

      // عيط لـ API وحدة كتعطي كولشي
      const res = await axios.get(`http://projet_pff.test/apiexamens/results/${exam.id}`);
      
      if (res.data.success) {
        // كنعمرو المريض والجدول فدقة وحدة
        setPatient(res.data.examen.patient); 
        setResults([res.data.examen]); 
        setLoading(false);
        console.log("✅ Data loaded successfully!");
        console.log("FULL EXAMEN:", res.data.examen);
      console.log("TYPE ANALYSE:", res.data.examen.type_analyse);
      }
    } catch (err) {
      console.error("❌ Error loading data:", err);
    }
  };

  loadAllData();
}, []); // تأكد بلي القوس خاوي هنا

  

     

  const generatePDF = async (examen) => {
    try {
      setGeneratingPDF(true);
      console.log("📄 Generating PDF for exam ID:", examen.id);
      console.log("📄 Examen data:", examen);

      // Call backend PDF generation endpoint
      const response = await axios.get(
        `http://projet_pff.test/apiexamens/${examen.id}/pdf`,
        {
          responseType: 'blob', // Important: handle response as binary
          headers: {
            'Accept': 'application/pdf'
          }
        }
      );

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rapport_${examen.reference}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Append to body, click, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("✅ PDF downloaded successfully!");
      toast.success("Rapport PDF téléchargé avec succès!");
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      
      // Check if error response has specific message
      if (error.response?.data?.message) {
        toast.error(`Erreur: ${error.response.data.message}`);
      } else {
        toast.error("Erreur lors de la génération du rapport PDF");
      }
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleLoginClick = () => {
    window.location.href = "/login";
  };

  // Inline Styles
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
      padding: "20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    wrapper: {
      maxWidth: "1000px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "30px",
    },
    title: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "8px",
    },
    subtitle: {
      fontSize: "14px",
      color: "#6b7280",
    },
    card: {
      background: "white",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e5e7eb",
      padding: "24px",
      marginBottom: "24px",
    },
    errorBox: {
      background: "#fef2f2",
      border: "1px solid #fca5a5",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "24px",
      display: "flex",
      gap: "12px",
      alignItems: "flex-start",
    },
    errorTitle: {
      color: "#7f1d1d",
      fontWeight: "600",
      marginBottom: "4px",
    },
    errorText: {
      color: "#b91c1c",
      fontSize: "13px",
    },
    loginButton: {
      background: "#4f46e5",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      marginTop: "12px",
      transition: "background 0.2s",
    },
    patientCard: {
      display: "flex",
      gap: "16px",
      alignItems: "flex-start",
    },
    patientAvatar: {
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      background: "#e0e7ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    patientInfo: {
      flex: 1,
    },
    patientName: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "12px",
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "16px",
    },
    infoItem: {
      fontSize: "13px",
    },
    infoLabel: {
      fontWeight: "600",
      color: "#374151",
    },
    infoValue: {
      color: "#6b7280",
      marginTop: "4px",
    },
    spinner: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "300px",
    },
    emptyState: {
      textAlign: "center",
      padding: "48px 24px",
    },
    emptyIcon: {
      width: "64px",
      height: "64px",
      background: "#f3f4f6",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 16px",
    },
    emptyTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "8px",
    },
    emptyText: {
      fontSize: "14px",
      color: "#6b7280",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    thead: {
      background: "#f9fafb",
      borderBottom: "1px solid #e5e7eb",
    },
    th: {
      padding: "12px 16px",
      textAlign: "left",
      fontSize: "13px",
      fontWeight: "600",
      color: "#111827",
    },
    tr: {
      borderBottom: "1px solid #e5e7eb",
      transition: "background 0.15s",
    },
    td: {
      padding: "12px 16px",
      fontSize: "13px",
      color: "#374151",
    },
    reference: {
      fontFamily: "monospace",
      fontWeight: "bold",
      color: "#4f46e5",
    },
    statusBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      borderRadius: "20px",
      padding: "4px 12px",
      fontSize: "12px",
      fontWeight: "600",
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    pdfButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 14px",
      background: "#4f46e5",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      transition: "background 0.2s",
    },
    pdfButtonDisabled: {
      background: "#a5b4fc",
      cursor: "not-allowed",
    },
    tipBox: {
      marginTop: "24px",
      padding: "12px 16px",
      background: "#eff6ff",
      border: "1px solid #93c5fd",
      borderRadius: "6px",
      color: "#1e40af",
      fontSize: "13px",
    },
  };

  // Loading State
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.header}>
            <h1 style={styles.title}>Mes Analyses Médicales</h1>
          </div>
          <div style={styles.spinner}>
            <Loader style={{ animation: "spin 1s linear infinite" }} size={48} color="#4f46e5" />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>
    );
  }

 <div>console.log(res.data.examen);</div>

  // Not Logged In State
  if (!token || error) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.header}>
            <h1 style={styles.title}>Mes Analyses Médicales</h1>
            <p style={styles.subtitle}>Connectez-vous pour consulter vos résultats</p>
          </div>
          <div style={styles.errorBox}>
            <AlertCircle size={20} style={{ color: "#dc2626", marginTop: "2px" }} />
            <div>
              <div style={styles.errorTitle}>Authentification requise</div>
              <div style={styles.errorText}>{error || "Vous devez être connecté pour voir vos résultats."}</div>
              <button
                style={styles.loginButton}
                onClick={handleLoginClick}
                onMouseEnter={(e) => (e.target.style.background = "#4338ca")}
                onMouseLeave={(e) => (e.target.style.background = "#4f46e5")}
              >
                Aller à la page de connexion
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Mes Analyses Médicales</h1>
          <p style={styles.subtitle}>Consultez et téléchargez vos résultats d'analyses validées</p>
        </div>

        {/* Patient Info Card */}
        {patient && (
          <div style={styles.card}>
            <div style={styles.patientCard}>
              <div style={styles.patientAvatar}>
                <User size={28} color="#4f46e5" />
              </div>
              <div style={styles.patientInfo}>
                <div style={styles.patientName}>{(`${patient?.nom || ""} ${patient?.prenom || ""}`.trim() || "Patient")}</div>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Nom Complet</div>
                    <div style={styles.infoValue}>{(`${patient?.nom || ""} ${patient?.prenom || ""}`.trim() || "-")}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Date d'accès</div>
                    <div style={styles.infoValue}>{new Date().toLocaleDateString("fr-FR")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 ? (
          <div style={styles.card}>
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <FileText size={32} color="#9ca3af" />
              </div>
              <h3 style={styles.emptyTitle}>Aucune analyse disponible</h3>
              <p style={styles.emptyText}>Vous n'avez pas encore de résultats d'analyses validées.</p>
            </div>
          </div>
        ) : (
          /* Results Table */
          <>
            <div style={styles.card}>
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>Vos Résultats d'Analyses</h2>
                <p style={{ fontSize: "13px", color: "#6b7280" }}>Patient: <strong>{`${patient?.nom || ""} ${patient?.prenom || ""}`.trim() || "-"}</strong></p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead style={styles.thead}>
                    <tr>
                      <th style={styles.th}>Référence</th>
                      <th style={styles.th}>Type d'Analyse</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Statut</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((examen, index) => (
                      <tr key={index} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.reference}>{examen?.reference || "-"}</span>
                        </td>
                        <td style={styles.td}>{examen?.type_analyse?.libelle || examen?.lignes?.[0]?.analyse?.typeAnalyse?.libelle || "-"}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Calendar size={14} color="#9ca3af" />
                            {examen?.date_examen ? new Date(examen.date_examen).toLocaleDateString("fr-FR") : "-"}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.statusBadge}>{examen?.statut ? examen.statut.replace('_', ' ') : "-"}</span>
                        </td>
                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <button
                            onClick={() => generatePDF(examen)}
                            disabled={generatingPDF}
                            style={{
                              ...styles.pdfButton,
                              ...(generatingPDF ? styles.pdfButtonDisabled : {}),
                            }}
                            onMouseEnter={(e) => {
                              if (!generatingPDF) e.target.style.background = "#4338ca";
                            }}
                            onMouseLeave={(e) => {
                              if (!generatingPDF) e.target.style.background = "#4f46e5";
                            }}
                            title="Télécharger le rapport PDF"
                          >
                            {generatingPDF ? (
                              <>
                                <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
                                <span>PDF...</span>
                              </>
                            ) : (
                              <>
                                <Download size={14} />
                                <span>PDF</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tip Box */}
            <div style={styles.tipBox}>
              💡 <strong>Astuce:</strong> Cliquez sur le bouton "PDF" pour télécharger un rapport professionnel de vos analyses avec tous les détails.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MesResultats;