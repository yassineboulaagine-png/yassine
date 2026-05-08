import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, AlertCircle, User, Calendar, FileText, Loader } from "lucide-react";
import { toast } from "sonner";

const MesResultats = () => {
  const [patient, setPatient] = useState(null);
  const [examens, setExamens] = useState([]);
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
    fetchPatientInfo(validToken);
    fetchMyResults(validToken);
  }, []);

  const fetchPatientInfo = async (authToken) => {
    try {
     const exam = JSON.parse(localStorage.getItem('currentExamen'));
axios.get(`http://localhost:8000/api/examens/results/${exam.id}`)

      if (response.data) {
        setPatient(response.data);
        console.log("Patient info loaded:", response.data);
      }
    } catch (err) {
      console.error("Error fetching patient info:", err);
    }
  };

  const fetchMyResults = async (authToken) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        "http://localhost:8000/api/examens/my-results",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        }
      );

      const data = response.data.data || response.data;
      setExamens(Array.isArray(data) ? data : []);
      console.log("Exams loaded:", data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Impossible de charger vos résultats d'analyses.");
      setLoading(false);
      toast.error("Erreur lors du chargement des résultats");
    }
  };

  const generatePDF = async (examen) => {
    try {
      setGeneratingPDF(true);

      // Dynamically import jsPDF and autoTable to prevent loading errors
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Colors and fonts
      const primaryColor = [51, 65, 85]; // slate-700
      const lightGray = [241, 245, 249]; // slate-100
      const darkGray = [30, 41, 59]; // slate-900

      // Set initial position
      let yPosition = 15;

      // Header Section - Laboratory Name
      doc.setFontSize(24);
      doc.setTextColor(...primaryColor);
      doc.setFont(undefined, "bold");
      doc.text("Laboratoire d'Analyses Médicales", 105, yPosition, {
        align: "center",
      });

      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Rapport de Résultats d'Analyses", 105, yPosition, {
        align: "center",
      });

      // Divider Line
      yPosition += 8;
      doc.setDrawColor(...primaryColor);
      doc.line(15, yPosition, 195, yPosition);

      // Patient Information Section
      yPosition += 10;
      doc.setFontSize(12);
      doc.setTextColor(...darkGray);
      doc.setFont(undefined, "bold");
      doc.text("Informations du Patient", 15, yPosition);

      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(80, 80, 80);

      const patientInfo = [
        [`Nom: `, `${patient?.nom_complet || "N/A"}`],
        [`Email: `, `${patient?.email || "N/A"}`],
        [`Date du Rapport: `, `${new Date().toLocaleDateString("fr-FR")}`],
        [`Référence d'Examen: `, `${examen.reference}`],
      ];

      patientInfo.forEach((info) => {
        doc.text(info[0], 15, yPosition);
        doc.setFont(undefined, "normal");
        doc.text(info[1], 55, yPosition);
        yPosition += 6;
      });

      // Results Table Section
      yPosition += 5;
      doc.setFontSize(12);
      doc.setTextColor(...darkGray);
      doc.setFont(undefined, "bold");
      doc.text("Résultats d'Analyses", 15, yPosition);

      yPosition += 8;

      // Create table with examination data
      autoTable(doc, {
        head: [
          [
            {
              content: "Type d'Analyse",
              styles: { fontStyle: "bold", fillColor: primaryColor, textColor: [255, 255, 255] },
            },
            {
              content: "Statut",
              styles: { fontStyle: "bold", fillColor: primaryColor, textColor: [255, 255, 255] },
            },
            {
              content: "Date",
              styles: { fontStyle: "bold", fillColor: primaryColor, textColor: [255, 255, 255] },
            },
          ],
        ],
        body: [[examen.analyse_type || "N/A", examen.statut || "N/A", examen.date || "N/A"]],
        startY: yPosition,
        margin: 15,
        styles: {
          fontSize: 10,
          cellPadding: 8,
          border: 1,
          borderColor: [200, 200, 200],
          textColor: [30, 41, 59],
        },
        alternateRowStyles: {
          fillColor: lightGray,
        },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page 1 de ${pageCount} - Généré le ${new Date().toLocaleString("fr-FR")}`,
        105,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );

      // Save PDF
      doc.save(`Resultats_${examen.reference}_${new Date().getTime()}.pdf`);
      toast.success("PDF téléchargé avec succès!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
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
                <div style={styles.patientName}>{patient?.nom_complet || "Patient"}</div>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Email</div>
                    <div style={styles.infoValue}>{patient?.email || "N/A"}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Rôle</div>
                    <div style={styles.infoValue}>{patient?.role || "Patient"}</div>
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
        {examens.length === 0 ? (
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
                    {examens.map((examen, index) => (
                      <tr key={index} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.reference}>{examen.reference}</span>
                        </td>
                        <td style={styles.td}>{examen.analyse_type || "N/A"}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Calendar size={14} color="#9ca3af" />
                            {examen.date}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.statusBadge}>{examen.statut}</span>
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
              💡 <strong>Astuce:</strong> Cliquez sur le bouton "PDF" pour télécharger un rapport professionnel de vos analyses.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MesResultats;