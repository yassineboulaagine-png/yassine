# Patients Component - Quick Reference & Code Snippets

## API Base URL Configuration
**File:** `frontend/src/pages/PatientsManagement.jsx` (Line 11)
```javascript
// Current
const API_BASE_URL = "http://projet_pff.test/Back-end/public/api";

// Production Example
const API_BASE_URL = "https://api.helixlab.com/api";

// Environment Variable (Recommended)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://projet_pff.test/Back-end/public/api";
```

---

## Common Customizations

### 1. Add a New Table Column
**Example: Add "Email" column**

```javascript
// In PatientsManagement.jsx - Add to table header
<th>Email</th>

// In table body (inside the map function)
<td>{patient.email}</td>

// Update API response expectations
// Your API should return: { ..., email: "patient@example.com", ... }
```

---

### 2. Add a New Form Field
**Example: Add "Email" to the add/edit form**

```javascript
// Step 1: Update formData state initialization
const [formData, setFormData] = useState({
  nom: "",
  prenom: "",
  cin: "",
  telephone: "",
  sexe: "M",
  date_naissance: "",
  email: "",  // NEW
});

// Step 2: Add form validation (optional)
if (!formData.nom || !formData.email) {
  toast.error("Veuillez remplir tous les champs obligatoires");
  return;
}

// Step 3: Add form input in modal
<div className="form-group">
  <label htmlFor="email">Email *</label>
  <Input
    id="email"
    name="email"
    type="email"
    value={formData.email}
    onChange={handleInputChange}
    placeholder="Ex: patient@example.com"
    className="form-input"
  />
</div>

// Step 4: The handleInputChange already supports new fields automatically!
```

---

### 3. Change Color Theme
**File:** `frontend/src/pages/PatientsManagement.css`

```css
/* Primary Button Color */
.btn-add-patient {
  background-color: #2563eb;  /* Change to your color */
}

/* Edit Action Button */
.action-btn.edit-btn {
  background-color: #e0f2fe;  /* Light background */
  color: #0369a1;             /* Icon color */
}

/* Delete Action Button */
.action-btn.delete-btn {
  background-color: #fee2e2;  /* Light background */
  color: #dc2626;             /* Icon color */
}

/* Name Badge */
.name-badge {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}
```

**Example: Teal Theme**
```css
.btn-add-patient {
  background-color: #0d9488;  /* Teal */
}
.btn-add-patient:hover {
  background-color: #0f766e;  /* Darker Teal */
}
```

---

### 4. Modify Search Functionality
**Current: Searches by name and CIN**

**Add Email to search:**
```javascript
useEffect(() => {
  const filtered = patients.filter((patient) => {
    const fullName = `${patient.prenom} ${patient.nom}`.toLowerCase();
    const cin = patient.cin.toLowerCase();
    const email = patient.email?.toLowerCase();  // NEW
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || cin.includes(term) || email?.includes(term);  // UPDATED
  });
  setFilteredPatients(filtered);
}, [searchTerm, patients]);
```

---

### 5. Add a New Action Button
**Example: Add "View Details" button**

```javascript
// Step 1: Add handler function
const handleViewDetails = (patient) => {
  // Navigate to detail page or open modal
  navigate(`/patients/${patient.id}`);
  // or: openDetailModal(patient);
};

// Step 2: Add button to actions cell (in table tbody)
<div className="actions-cell">
  <button
    className="action-btn view-btn"
    onClick={() => handleViewDetails(patient)}
    title="View Details"
  >
    <Eye size={18} />
  </button>
  <button className="action-btn edit-btn" ...>
    <Edit2 size={18} />
  </button>
  <button className="action-btn delete-btn" ...>
    <Trash2 size={18} />
  </button>
</div>

// Step 3: Add import for Eye icon
import { Plus, Search, Edit2, Trash2, X, Eye } from "lucide-react";

// Step 4: Add CSS for new button
.action-btn.view-btn {
  background-color: #f0fdf4;  /* Light green */
  color: #16a34a;             /* Green */
}

.action-btn.view-btn:hover {
  background-color: #16a34a;
  color: white;
}
```

---

### 6. Add Pagination
**Replace infinite list with page-based pagination:**

```javascript
// Add pagination state
const [currentPage, setCurrentPage] = useState(1);
const [patientsPerPage] = useState(10);

// Calculate pagination
const indexOfLastPatient = currentPage * patientsPerPage;
const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

// In table, replace {filteredPatients.map(...)} with:
{currentPatients.map((patient) => (
  <tr key={patient.id}>
    {/* ... rest of row ... */}
  </tr>
))}

// Add pagination controls after table
<div className="pagination-controls">
  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
    Précédent
  </button>
  <span>Page {currentPage} / {Math.ceil(filteredPatients.length / patientsPerPage)}</span>
  <button onClick={() => setCurrentPage(p => p + 1)}>
    Suivant
  </button>
</div>
```

---

### 7. Add Bulk Actions
**Example: Delete multiple patients at once**

```javascript
// Add state for selected patients
const [selectedPatients, setSelectedPatients] = useState([]);

// Add checkbox to table header
<th>
  <input
    type="checkbox"
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedPatients(filteredPatients.map(p => p.id));
      } else {
        setSelectedPatients([]);
      }
    }}
  />
</th>

// Add checkbox to each row
<td>
  <input
    type="checkbox"
    checked={selectedPatients.includes(patient.id)}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedPatients([...selectedPatients, patient.id]);
      } else {
        setSelectedPatients(selectedPatients.filter(id => id !== patient.id));
      }
    }}
  />
</td>

// Add bulk delete handler
const handleBulkDelete = async () => {
  if (selectedPatients.length === 0) {
    toast.error("Sélectionnez des patients");
    return;
  }
  
  if (!window.confirm(`Supprimer ${selectedPatients.length} patients ?`)) {
    return;
  }

  try {
    await Promise.all(
      selectedPatients.map(id => axios.delete(`${API_BASE_URL}/patients/${id}`))
    );
    toast.success("Patients supprimés");
    setSelectedPatients([]);
    fetchPatients();
  } catch (error) {
    toast.error("Erreur lors de la suppression");
  }
};

// Add button for bulk delete
{selectedPatients.length > 0 && (
  <button onClick={handleBulkDelete} className="btn-bulk-delete">
    Supprimer {selectedPatients.length}
  </button>
)}
```

---

### 8. Add Sort by Column Headers
**Make table sortable:**

```javascript
const [sortField, setSortField] = useState('nom');
const [sortDirection, setSortDirection] = useState('asc');

const handleSort = (field) => {
  if (sortField === field) {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortField(field);
    setSortDirection('asc');
  }
};

// Apply sort to filteredPatients
const sortedPatients = [...filteredPatients].sort((a, b) => {
  const valueA = a[sortField];
  const valueB = b[sortField];
  
  if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
  if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
  return 0;
});

// Update table header with click handlers
<th onClick={() => handleSort('nom')}>
  Nom Complet {sortField === 'nom' && (sortDirection === 'asc' ? '↑' : '↓')}
</th>

// Use sortedPatients instead of filteredPatients in map
{sortedPatients.map((patient) => (...))}
```

---

### 9. Export to CSV
**Add export functionality:**

```javascript
import { Download } from "lucide-react";

const handleExportCSV = () => {
  const headers = ['Nom Complet', 'CIN', 'Téléphone', 'Date Inscription'];
  const rows = filteredPatients.map(p => [
    `${p.prenom} ${p.nom}`,
    p.cin,
    p.telephone,
    formatDate(p.created_at)
  ]);

  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `patients-${new Date().toISOString()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Add export button
<button onClick={handleExportCSV} className="btn-export">
  <Download size={18} /> Exporter
</button>
```

---

### 10. Add Date Filter
**Filter by registration date range:**

```javascript
const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

const filtered = patients.filter((patient) => {
  // ... existing search filter ...
  
  // Add date filter
  if (dateFilter.start) {
    const patientDate = new Date(patient.created_at);
    if (patientDate < new Date(dateFilter.start)) return false;
  }
  if (dateFilter.end) {
    const patientDate = new Date(patient.created_at);
    if (patientDate > new Date(dateFilter.end)) return false;
  }
  
  return true;
});

// Add date inputs to header
<div className="date-filter">
  <Input
    type="date"
    value={dateFilter.start}
    onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
    placeholder="De"
  />
  <Input
    type="date"
    value={dateFilter.end}
    onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
    placeholder="À"
  />
</div>
```

---

## Import Statement Reference
```javascript
// Icons available from lucide-react
import {
  Plus,          // Add button
  Search,        // Search icon
  Edit2,         // Edit action
  Trash2,        // Delete action
  X,             // Close modal
  Eye,           // View details
  Download,      // Export
  ChevronUp,     // Sort ascending
  ChevronDown,   // Sort descending
  Loader,        // Loading spinner
  AlertCircle,   // Error icon
} from "lucide-react";
```

---

## Toast Notification Examples
```javascript
import { toast } from "sonner";

// Success
toast.success("Patient ajouté avec succès");

// Error
toast.error("Erreur lors du chargement");

// Info
toast.info("Opération en cours...");

// Warning
toast.warning("Êtes-vous sûr ?");

// Custom duration
toast.success("Message", { duration: 5000 }); // 5 seconds
```

---

## Styling Class Reference
```css
/* Main containers */
.patients-management
.patients-header
.search-container
.hl-table-container

/* Buttons */
.btn-add-patient
.action-btn
.action-btn.edit-btn
.action-btn.delete-btn

/* Form */
.form-group
.form-input
.form-select
.form-actions

/* States */
.loading-state
.empty-state
.modal-overlay
.modal-content

/* Responsive */
@media (max-width: 768px)
@media (max-width: 480px)
```

---

## Environment Variables (Optional)
**Create `.env.local` in frontend directory:**
```
VITE_API_BASE_URL=http://projet_pff.test/Back-end/public/api
VITE_APP_NAME=Helix Lab
```

**Use in component:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

---

## Testing API Endpoints with cURL
```bash
# Get all patients
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://projet_pff.test/apipatients

# Add new patient
curl -X POST http://projet_pff.test/apipatients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom":"Dupont",
    "prenom":"Jean",
    "cin":"12345678",
    "telephone":"+212612345678",
    "sexe":"M",
    "date_naissance":"1990-05-15"
  }'

# Update patient
curl -X PUT http://projet_pff.test/apipatients/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Dupont Updated"}'

# Delete patient
curl -X DELETE http://projet_pff.test/apipatients/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Debug Tips
```javascript
// Log API response
const response = await axios.get(`${API_BASE_URL}/patients`);
console.log('API Response:', response.data);

// Check form data before submit
console.log('Form Data:', formData);

// Monitor state changes
console.log('Patients Updated:', patients);

// API error debugging
catch (error) {
  console.error('Full Error:', error);
  console.error('Status:', error.response?.status);
  console.error('Message:', error.response?.data?.message);
  console.error('Errors:', error.response?.data?.errors);
}
```

---

**For more information, see:**
- `PATIENTS_COMPONENT_README.md` - Full documentation
- `PATIENTS_SETUP_GUIDE.md` - Setup instructions
- `API_REFERENCE_PATIENTS.php` - API specifications
