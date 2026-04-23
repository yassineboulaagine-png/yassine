import { useState, useEffect } from "react";
import axios from "axios";
import { Search, ClipboardList, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const MesResultats = () => {
  const [examens, setExamens] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Fetch l-analyses li 3ndhom statut 'valide'
  const fetchExamensBiologiste = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/examens-biologiste");
      setExamens(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching examens:", error);
      setLoading(false);
    }
  };

  // 2. Auto-Refresh kol 3 seconat
  useEffect(() => {
    fetchExamensBiologiste(); // fetch awal merra

    const interval = setInterval(() => {
      fetchExamensBiologiste();
    }, 3000); 

    return () => clearInterval(interval); // Cleanup
  }, []);

  // Filter dial l-ba7t (Search)
  const filteredExamens = examens.filter(ex => 
    ex.patient?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="hl-content-body">
      <div className="hl-header-section" style={{ marginBottom: '25px' }}>
        <h2 style={{ color: '#1e1b4b', fontWeight: '700' }}>Analyses à Traiter (Biologiste)</h2>
        <div className="search-input-container" style={{ marginTop: '15px' }}>
          <Search size={18} color="#94a3b8" />
          <input 
            className="hl-search-input"
            placeholder="Rechercher par patient ou référence..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="hl-table-container">
        <table className="hl-table">
          <thead>
            <tr>
              <th>RÉFÉRENCE</th>
              <th>PATIENT</th>
              <th>ANALYSE</th>
              <th>STATUT</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Chargement...</td></tr>
            ) : filteredExamens.length > 0 ? (
              filteredExamens.map((ex) => (
                <tr key={ex.id}>
                  <td className="font-bold">{ex.reference}</td>
                  <td>{ex.patient?.nom} {ex.patient?.prenom}</td>
                  <td>
                    {/* Affichage dial l-analyses (Lignes d'examen) */}
                    {ex.lignes?.map((l, index) => (
                      <div key={index} style={{ fontSize: '13px' }}>
                        • {l.analyse?.designation}
                      </div>
                    ))}
                  </td>
                  <td>
                    <span className="status-badge valide" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                      {ex.statut}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-modifier"
                      onClick={() => toast.info("Ouverture du formulaire de saisie...")}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <ClipboardList size={16} /> Saisir Résultats
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Aucune analyse validée pour le moment.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MesResultats;