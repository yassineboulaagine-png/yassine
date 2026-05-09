# Patients Management Component - Documentation

## Overview
The `PatientsManagement` component is a professional patient management interface for the Helix Lab Admin Dashboard. It provides a complete solution for viewing, searching, adding, editing, and deleting patient records.

## Features

### 1. **Patient List Table**
- Displays patients in a professional table format with columns:
  - **Nom Complet**: Concatenated first name and last name
  - **CIN**: National ID number
  - **Téléphone**: Phone number
  - **Date d'inscription**: Registration/creation date
- Responsive design that adapts to mobile screens
- Hover effects for better UX
- Empty and loading states

### 2. **Search Functionality**
- Real-time search bar at the top of the page
- Filter patients by:
  - Full name (prenom + nom)
  - CIN (National ID)
- Case-insensitive search
- Instant results update

### 3. **Add Patient Feature**
- "+ Ajouter Patient" button opens a modal with a form
- Form fields:
  - **Nom** (Last Name) - Required
  - **Prénom** (First Name) - Required
  - **CIN** (National ID) - Required
  - **Téléphone** (Phone) - Required
  - **Sexe** (Gender) - Dropdown (M/F)
  - **Date de Naissance** (Birth Date) - Required
- Form validation
- Success/error notifications via toast

### 4. **Edit Functionality**
- Edit icon in each table row
- Populates modal with existing patient data
- Updates patient via PUT request
- Toast notification on success

### 5. **Delete Functionality**
- Delete icon in each table row
- Confirmation dialog before deletion
- Removes patient from the list
- Toast notification on success

### 6. **API Integration**
Uses Axios for REST API communication:
- **GET** `/api/patients` - Fetch all patients
- **POST** `/api/patients` - Create new patient
- **PUT** `/api/patients/{id}` - Update patient
- **DELETE** `/api/patients/{id}` - Delete patient

## File Structure

```
frontend/src/pages/
├── PatientsManagement.jsx       # Main component
├── PatientsManagement.css       # Component styling
└── DashboardAdmin.jsx           # Updated to include component
```

## Component Props
The component doesn't accept props - it manages its own state internally.

## State Management

```javascript
- patients: Array of all patients from API
- filteredPatients: Array of patients matching search criteria
- searchTerm: Current search input value
- loading: Loading state for initial data fetch
- openModal: Boolean to control modal visibility
- isSubmitting: Boolean to prevent duplicate submissions
- editingId: ID of patient being edited (null for new patient)
- formData: Object containing form field values
```

## API Response Format Expected

### GET /api/patients
```json
{
  "data": [
    {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "cin": "12345678",
      "telephone": "+212612345678",
      "sexe": "M",
      "date_naissance": "1990-05-15",
      "created_at": "2024-01-15T10:30:00",
      "updated_at": "2024-01-15T10:30:00"
    }
  ]
}
```

### POST /api/patients
**Request:**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "cin": "12345678",
  "telephone": "+212612345678",
  "sexe": "M",
  "date_naissance": "1990-05-15"
}
```

**Response:**
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "cin": "12345678",
  "telephone": "+212612345678",
  "sexe": "M",
  "date_naissance": "1990-05-15",
  "created_at": "2024-01-15T10:30:00"
}
```

## Styling & Theme
- **Colors**: Dark blue (#0f172a), Professional blue (#2563eb), Light gray (#f8fafc)
- **Typography**: Inter font family, clean hierarchy
- **Icons**: Lucide React icons
- **CSS Framework**: Tailwind CSS with custom CSS
- **Components**: Shadcn/ui Input component

## Usage

### In DashboardAdmin.jsx
```jsx
import PatientsManagement from "./PatientsManagement";

// Inside the JSX:
{activeTab === 'patients' && (
  <PatientsManagement />
)}
```

## Customization Guide

### 1. Change API Base URL
Locate this line in `PatientsManagement.jsx`:
```javascript
const API_BASE_URL = "http://localhost:8000/api";
```
Update to your actual API endpoint.

### 2. Modify Table Columns
In the table header, add/remove `<th>` elements:
```javascript
<th>New Column</th>
```
And in the tbody, add corresponding `<td>` with data:
```javascript
<td>{patient.newField}</td>
```

### 3. Add Form Fields
Add new field to `formData` state:
```javascript
const [formData, setFormData] = useState({
  // ... existing fields
  newField: "",
});
```
Add form group in the modal:
```javascript
<div className="form-group">
  <label htmlFor="newField">New Field</label>
  <Input
    id="newField"
    name="newField"
    value={formData.newField}
    onChange={handleInputChange}
  />
</div>
```

### 4. Customize Colors
Edit `PatientsManagement.css`:
- Primary blue: `#2563eb` → your color
- Dark background: `#0f172a` → your color
- Light background: `#f8fafc` → your color

### 5. Add New Action Buttons
Add button in the actions cell:
```javascript
<button 
  className="action-btn view-btn"
  onClick={() => handleViewPatient(patient)}
  title="View Details"
>
  <Eye size={18} />
</button>
```

## Error Handling
- Displays error toasts for failed API calls
- Validates required fields before submission
- Handles network errors gracefully
- Shows loading states to users

## Accessibility Features
- Semantic HTML structure
- ARIA labels on buttons
- Keyboard navigation support
- Focus visible states
- Clear visual feedback on interactions

## Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Dependencies
- React 18+
- Axios (HTTP client)
- Lucide React (Icons)
- Sonner (Toast notifications)
- Tailwind CSS
- Shadcn/ui Button and Input components

## Performance Considerations
- Uses useEffect hook for data fetching
- Filters applied client-side (suitable for <1000 records)
- For larger datasets, implement server-side pagination
- Debounce search for better performance with large lists

## Future Enhancements
- [ ] Server-side pagination
- [ ] Bulk actions (delete multiple patients)
- [ ] Export to CSV/PDF
- [ ] Patient details modal/page
- [ ] Advanced filtering options
- [ ] Sort by column headers
- [ ] User activity logging
- [ ] Duplicate patient detection

## Troubleshooting

### Modal not opening
Check if `openModal` state is being set correctly and modal CSS is loaded.

### Data not loading
1. Verify API endpoint is correct
2. Check browser console for errors
3. Ensure CORS is enabled on backend
4. Verify API response format matches expected structure

### Search not working
Verify that patient objects have `nom`, `prenom`, and `cin` fields matching API response.

### Styling issues
1. Ensure `PatientsManagement.css` is in the same directory as component
2. Verify Tailwind CSS is properly configured
3. Check browser DevTools for CSS conflicts

## Support
For issues or questions, refer to the main project documentation or contact the development team.
