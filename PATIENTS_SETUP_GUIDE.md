# Patients Management Component - Setup & Integration Guide

## Quick Start

### 1. Component Files Created
✅ **Frontend Components:**
- `frontend/src/pages/PatientsManagement.jsx` - Main React component
- `frontend/src/pages/PatientsManagement.css` - Component styling
- `frontend/src/pages/PATIENTS_COMPONENT_README.md` - Detailed documentation

✅ **Backend Reference:**
- `Back-end/app/Http/Controllers/API_REFERENCE_PATIENTS.php` - API endpoint documentation

### 2. Component Already Integrated
The component has been integrated into the admin dashboard:
- Updated `frontend/src/pages/DashboardAdmin.jsx` to import and use `PatientsManagement`
- Clicking "Patients" in the sidebar will now display the patients management interface

## Configuration

### Step 1: Verify Frontend Dependencies
All required dependencies are already in your `package.json`:
- ✅ axios
- ✅ lucide-react
- ✅ sonner (toast notifications)
- ✅ @radix-ui components

### Step 2: API Base URL Configuration
**Current Setting:**
```javascript
const API_BASE_URL = "http://projet_pff.test/Back-end/public/api";
```

**Location:** `frontend/src/pages/PatientsManagement.jsx` (Line 11)

**To Change:**
1. Open `PatientsManagement.jsx`
2. Locate the `API_BASE_URL` constant
3. Update to match your backend URL:
   ```javascript
   const API_BASE_URL = "https://your-api-domain.com/api";
   ```

### Step 3: Backend API Setup (Laravel)

**Required Endpoints:**
```
GET    /api/patients           - Fetch all patients
POST   /api/patients           - Create new patient
PUT    /api/patients/{id}      - Update patient
DELETE /api/patients/{id}      - Delete patient
```

**Quick Setup:**
1. Create Patient Model:
   ```bash
   php artisan make:model Patient -m
   ```

2. Define migration in `database/migrations/xxxx_create_patients_table.php`:
   ```php
   Schema::create('patients', function (Blueprint $table) {
       $table->id();
       $table->string('nom');
       $table->string('prenom');
       $table->string('cin')->unique();
       $table->string('telephone');
       $table->enum('sexe', ['M', 'F'])->default('M');
       $table->date('date_naissance');
       $table->timestamps();
   });
   ```

3. Create Controller:
   ```bash
   php artisan make:controller PatientController --resource --model=Patient
   ```

4. Register routes in `routes/api.php`:
   ```php
   Route::middleware('auth:sanctum')->group(function () {
       Route::apiResource('patients', PatientController::class);
   });
   ```

5. Run migration:
   ```bash
   php artisan migrate
   ```

**Refer to:** `Back-end/app/Http/Controllers/API_REFERENCE_PATIENTS.php` for detailed API specifications.

## Features Overview

### Patient List
- Professional table with columns: Nom Complet, CIN, Téléphone, Date d'inscription
- Responsive design
- Hover effects
- Empty/loading states

### Search Functionality
- Real-time search bar
- Filter by full name or CIN
- Case-insensitive matching

### Add Patient Modal
- Form with fields: nom, prenom, cin, telephone, sexe, date_naissance
- Form validation
- Success/error notifications

### Edit & Delete Actions
- Edit icon to modify patient
- Delete icon with confirmation dialog
- Automatic list refresh after actions

### UI/UX
- Matches Helix Lab theme (dark blue sidebar, professional styling)
- Tailwind CSS + Lucide icons
- Toast notifications via Sonner
- Smooth animations and transitions
- Mobile responsive

## File Structure
```
frontend/
├── src/
│   ├── pages/
│   │   ├── DashboardAdmin.jsx (UPDATED)
│   │   ├── PatientsManagement.jsx (NEW)
│   │   ├── PatientsManagement.css (NEW)
│   │   ├── PATIENTS_COMPONENT_README.md (NEW)
│   │   └── Dashboard.css
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── ... (other UI components)
│   └── ... (other directories)

Back-end/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── API_REFERENCE_PATIENTS.php (NEW)
│   │   │   └── PatientController.php (TO BE CREATED)
│   │   └── Requests/
│   ├── Models/
│   │   └── Patient.php (TO BE CREATED)
│   └── ...
└── database/
    ├── migrations/
    └── seeders/
```

## Testing the Component

### 1. Start Frontend Development Server
```bash
cd frontend
npm run dev
# or
bun run dev
```

### 2. Start Backend Server
```bash
cd Back-end
php artisan serve
# or use your preferred server
```

### 3. Navigate to Component
1. Go to Admin Dashboard
2. Click "Patients" in the sidebar
3. You should see the Patients Management interface

### 4. Test Features
- ✅ View patient list (requires data in database)
- ✅ Add new patient
- ✅ Edit existing patient
- ✅ Delete patient
- ✅ Search by name/CIN

## Common Issues & Solutions

### "Cannot GET /api/patients"
- Verify backend server is running
- Check API_BASE_URL is correct
- Ensure CORS is enabled

### Modal not displaying
- Verify CSS file is loaded
- Check browser DevTools console for errors
- Ensure no CSS conflicts

### Search not working
- Verify patient data has `nom`, `prenom`, `cin` fields
- Check API response format matches expected structure
- Look at browser console for errors

### Authentication errors
- Verify you're logged in as admin
- Check authentication token in localStorage
- Ensure backend authentication is configured

### Form not submitting
- Verify all required fields are filled
- Check network tab in DevTools for errors
- Verify API endpoint is correct

## Customization Examples

### 1. Add Additional Table Column
In `PatientsManagement.jsx`:
```javascript
// In table header
<th>Email</th>

// In table body (inside tbody tr)
<td>{patient.email}</td>
```

### 2. Change Button Colors
In `PatientsManagement.css`:
```css
.btn-add-patient {
  background-color: #YOUR_COLOR; /* Change this */
}
```

### 3. Add Email Field to Form
```javascript
// Add to formData state
date_naissance: "",
email: "",  // NEW

// Add form group in modal
<div className="form-group">
  <label htmlFor="email">Email</label>
  <Input
    id="email"
    name="email"
    type="email"
    value={formData.email}
    onChange={handleInputChange}
  />
</div>
```

### 4. Customize Search Criteria
In `PatientsManagement.jsx`, modify the filter logic:
```javascript
useEffect(() => {
  const filtered = patients.filter((patient) => {
    const fullName = `${patient.prenom} ${patient.nom}`.toLowerCase();
    const cin = patient.cin.toLowerCase();
    const email = patient.email?.toLowerCase(); // NEW
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || cin.includes(term) || email?.includes(term);
  });
  setFilteredPatients(filtered);
}, [searchTerm, patients]);
```

## Performance Tips

1. **For Large Datasets (>1000 patients):**
   - Implement server-side pagination
   - Add filtering on backend
   - Use pagination parameters in API calls

2. **For Better UX:**
   - Add loading skeleton while fetching
   - Debounce search input
   - Add infinite scroll instead of pagination

3. **Caching:**
   - Consider using React Query or TanStack Query for better data management
   - Cache patient list data

## Security Considerations

1. **Backend:**
   - Add proper authorization checks (user must be admin)
   - Validate all input data
   - Implement rate limiting

2. **Frontend:**
   - Verify user is authenticated before showing component
   - Sanitize any user input
   - Use HTTPS in production

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS 14+, Android 10+)

## Next Steps

1. ✅ Component files created
2. ✅ Integration done
3. 📋 Create backend API endpoints
4. 📋 Test with real data
5. 📋 Deploy to production

## Documentation Files

- **Frontend Documentation:** `frontend/src/pages/PATIENTS_COMPONENT_README.md`
- **API Reference:** `Back-end/app/Http/Controllers/API_REFERENCE_PATIENTS.php`
- **This Setup Guide:** Currently reading

## Support & Troubleshooting

For detailed component documentation, see: `frontend/src/pages/PATIENTS_COMPONENT_README.md`

For API specifications, see: `Back-end/app/Http/Controllers/API_REFERENCE_PATIENTS.php`

## Version Info
- React: 18+
- Vite: 5+
- Laravel: 11+
- Node.js: 16+
