# Helix Lab Design System - Patients Component

## Color Palette

### Primary Colors
```
Dark Blue (Sidebar):      #0f172a
Professional Blue:        #2563eb
Light Blue (Hover):       #1d4ed8
Sky Blue (Light BG):      #e0f2fe
```

### Neutral Colors
```
Background:               #f8fafc
White:                    #ffffff
Border Gray:              #e2e8f0
Light Gray:               #f1f5f9
Text Dark:                #1e293b
Text Medium:              #334155
Text Light:               #64748b
Text Muted:               #94a3b8
```

### Semantic Colors
```
Success Green:            #16a34a
Error Red:                #dc2626
Warning Orange:           #ea580c
Info Cyan:                #0369a1
```

### Shades for Backgrounds
```
Success Light:            #f0fdf4
Error Light:              #fee2e2
Warning Light:            #fff7ed
Info Light:               #f0f9ff
```

---

## Typography

### Font Family
- Primary: Inter, sans-serif
- Fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

### Font Sizes
```
Heading 1 (h1):           28px / 1.75rem (font-weight: 800)
Heading 2 (h2):           20px / 1.25rem (font-weight: 700)
Heading 3 (h3):           16px / 1rem   (font-weight: 600)
Body Large:               16px / 1rem   (font-weight: 500)
Body Medium:              14px / 0.875rem (font-weight: 500)
Body Small:               13px / 0.8125rem (font-weight: 600)
Caption:                  12px / 0.75rem (font-weight: 500)
```

### Font Weights
```
Regular:    400
Medium:     500
Semibold:   600
Bold:       700
Extrabold:  800
```

### Line Heights
```
Tight:      1.2
Normal:     1.5
Relaxed:    1.75
Loose:      2
```

---

## Spacing System

### Base Unit: 4px

```
2px:    1px * 2
4px:    Base unit
8px:    2 units
12px:   3 units
16px:   4 units
20px:   5 units
24px:   6 units
28px:   7 units
32px:   8 units
36px:   9 units
40px:   10 units
48px:   12 units
56px:   14 units
64px:   16 units
```

### Component Spacing
```
Button padding:           10px 20px / 10px 16px
Form input padding:       10px 12px
Table cell padding:       16px
Card padding:             24px - 48px
Section margin:           32px
```

---

## Border & Radius

### Border Widths
```
Thin:     1px
Medium:   2px
Thick:    4px
```

### Border Radius
```
Small:    4px
Medium:   6px
Large:    8px
XLarge:   12px
XXLarge:  16px
Full:     9999px (pill shape)
```

### Shadow System
```
None:     none
Subtle:   0 1px 2px rgba(0, 0, 0, 0.03)
Small:    0 4px 6px -1px rgba(0, 0, 0, 0.05)
Medium:   0 10px 15px -3px rgba(0, 0, 0, 0.1)
Large:    0 20px 25px -5px rgba(0, 0, 0, 0.1)
XLarge:   0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

---

## Component States

### Button States
```
Default:   Background: #2563eb, Color: white
Hover:     Background: #1d4ed8, Transform: translateY(-2px)
Active:    Transform: translateY(0), Opacity: 0.9
Disabled:  Opacity: 0.6, Cursor: not-allowed
Focus:     Outline: 2px solid #2563eb, Outline-offset: 2px
```

### Input States
```
Default:   Border: #e2e8f0, Background: white
Hover:     Border: #cbd5e1
Focus:     Border: #2563eb, Box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)
Disabled:  Background: #f1f5f9, Opacity: 0.6
Error:     Border: #dc2626, Box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1)
```

### Table Row States
```
Default:   Background: white
Hover:     Background: #f8fafc
Selected:  Background: #e0f2fe, Border-left: 2px solid #2563eb
```

---

## Interaction Patterns

### Transitions
```
Fast:     200ms ease
Normal:   300ms ease
Slow:     500ms ease
```

### Animations
```
Fade-in:      opacity 0 → 1 (300ms)
Slide-up:     translateY(20px) → 0 (300ms)
Scale:        scale(1) → 1.05 (200ms)
Rotate:       rotate(0deg) → rotate(90deg) (300ms)
```

---

## Responsive Breakpoints

```
Mobile:       < 480px
Tablet:       480px - 768px
Desktop:      768px - 1024px
Large:        > 1024px
```

### Media Queries
```css
@media (max-width: 480px)   /* Mobile First */
@media (max-width: 768px)   /* Tablet & Mobile */
@media (max-width: 1024px)  /* Desktop & below */
@media (min-width: 1024px)  /* Desktop Only */
```

---

## Accessibility

### Focus States
```
All interactive elements have:
- Outline: 2px solid #2563eb
- Outline-offset: 2px
- Clearly visible in all contrast scenarios
```

### Color Contrast
```
Body Text:        Minimum 4.5:1 (WCAG AA standard)
Large Text:       Minimum 3:1
UI Components:    Minimum 3:1
```

### Keyboard Navigation
```
Tab:       Move to next element
Shift+Tab: Move to previous element
Enter:     Activate button/submit form
Escape:    Close modal/dialog
Space:     Toggle checkbox
Arrow:     Navigate select options
```

---

## Icon System (Lucide React)

### Icon Sizes
```
Extra Small:  16px
Small:        18px
Medium:       20px
Large:        24px
XLarge:       32px
```

### Icon Colors
```
Primary:      Inherit text color
Muted:        #94a3b8
Success:      #16a34a
Error:        #dc2626
Warning:      #ea580c
Info:         #0369a1
```

### Common Icons Used
```
Add/Create:         Plus
Search:             Search
Edit:               Edit2
Delete:             Trash2
Close:              X
Back:               ChevronLeft
Forward:            ChevronRight
Up/Sort:            ChevronUp
Down/Sort:          ChevronDown
View:               Eye
Hide:               EyeOff
User:               User
Settings:           Settings
Logout:             LogOut
Loading:            Loader
Success:            CheckCircle
Error:              AlertCircle
Warning:            AlertTriangle
Info:               Info
Menu:               Menu
Filter:             Filter
Export:             Download
Import:             Upload
```

---

## Form Components

### Input Field
```
Height:           36px - 40px
Padding:          10px 12px
Border:           1px solid #e2e8f0
Border-radius:    6px
Font-size:        14px
Placeholder:      Color: #cbd5e1
Focus:            Border: #2563eb, Shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)
```

### Label
```
Font-size:        13px
Font-weight:      600
Color:            #0f172a
Text-transform:   uppercase
Letter-spacing:   0.5px
Margin-bottom:    8px
```

### Select/Dropdown
```
Height:           36px - 40px
Padding:          10px 12px / 10px 32px (right for arrow)
Border:           1px solid #e2e8f0
Border-radius:    6px
Arrow:            Custom SVG background image
Font-size:        14px
Cursor:           pointer
```

### Checkbox/Radio
```
Size:             16px × 16px
Border-radius:    3px (checkbox) / 50% (radio)
Checked:          Background: #2563eb, Border: #2563eb
Unchecked:        Background: white, Border: #e2e8f0
Focus:            Outline: 2px solid #2563eb
```

---

## Table Design

### Header Row
```
Background:       #f8fafc
Padding:          16px
Font-size:        12px
Font-weight:      600
Color:            #64748b
Text-transform:   uppercase
Border-bottom:    1px solid #e2e8f0
```

### Data Row
```
Padding:          16px
Font-size:        14px
Color:            #334155
Border-bottom:    1px solid #f1f5f9
Hover:            Background: #fbfcfe
```

### Striped Rows (Optional)
```
Odd rows:         Background: white
Even rows:        Background: #f8fafc
```

---

## Modal/Dialog

### Overlay
```
Background:       rgba(15, 23, 42, 0.6)
Backdrop-filter:  blur(4px)
Z-index:          9999
Transition:       200ms ease
```

### Content Box
```
Background:       white
Width:            90% / max-width: 450px
Padding:          30px
Border-radius:    16px
Box-shadow:       0 20px 25px -5px rgba(0, 0, 0, 0.1)
Animation:        slideUp 300ms ease-out
```

### Modal Header
```
Padding-bottom:   16px
Border-bottom:    1px solid #f1f5f9
Margin-bottom:    24px
```

---

## Utility Classes (Tailwind)

### Flexbox
```
flex                 display: flex
flex-col             flex-direction: column
gap-{n}              gap: {n}px
justify-center       justify-content: center
align-items          align-items: center
```

### Grid
```
grid                 display: grid
grid-cols-{n}        grid-template-columns: repeat({n}, 1fr)
gap-{n}              gap: {n}px
```

### Sizing
```
w-full               width: 100%
h-full               height: 100%
min-h-screen         min-height: 100vh
max-w-{n}            max-width: {n}px
```

### Spacing
```
p-{n}                padding
m-{n}                margin
px-{n}               padding-left & padding-right
py-{n}               padding-top & padding-bottom
```

### Text
```
text-{size}          font-size
font-{weight}        font-weight
text-{color}         color
uppercase            text-transform: uppercase
```

### Visibility
```
hidden               display: none
invisible            visibility: hidden
opacity-{n}          opacity: {n}%
```

---

## Dark Mode (Optional Future)

### Color Inversions
```
Text Dark:        #1e293b → #e2e8f0
Background:       #f8fafc → #0f172a
Borders:          #e2e8f0 → #334155
Card Background:  #ffffff → #1e293b
```

---

## Print Styles

### Hidden on Print
```
Buttons:          display: none
Modal:            display: none
Navigation:       display: none
Search:           display: none
```

### Print Optimizations
```
Table:            Border: 1px solid #000
Shadows:          None
Colors:           Print-friendly (black/white)
Page Breaks:      Avoid breaking rows
```

---

## Performance Considerations

### Optimization Tips
1. Use CSS transforms instead of margin/padding for animations
2. Prefer opacity over visibility
3. Debounce search input
4. Lazy load images
5. Minimize repaints and reflows
6. Use CSS classes instead of inline styles

### Best Practices
- Minimize DOM nodes
- Avoid nested selectors
- Use CSS custom properties for theming
- Compress images
- Minify CSS and JavaScript

---

## Implementation Checklist

- ✅ Color palette defined
- ✅ Typography system
- ✅ Spacing system
- ✅ Border & radius
- ✅ Shadow system
- ✅ Component states
- ✅ Responsive breakpoints
- ✅ Accessibility standards
- ✅ Icon system
- ✅ Form components
- ✅ Table design
- ✅ Modal design
- ✅ Utility classes
- ✅ Print styles
- ✅ Performance optimizations

---

## Usage Examples

### Creating a Consistent Component
```jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

function MyComponent() {
  return (
    <div className="p-8 bg-slate-50">
      {/* Using design system */}
      <h1 className="text-2xl font-extrabold text-slate-900">Title</h1>
      <p className="text-sm text-slate-600 mt-2">Description</p>
      
      {/* Using predefined components */}
      <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
        <Plus size={20} /> Add Item
      </Button>
      
      <Input 
        placeholder="Search..."
        className="mt-4 border-slate-300"
      />
    </div>
  );
}
```

---

## References

- Component Documentation: `PATIENTS_COMPONENT_README.md`
- Quick Reference: `PATIENTS_QUICK_REFERENCE.md`
- Setup Guide: `PATIENTS_SETUP_GUIDE.md`

---

**Design System Version:** 1.0  
**Last Updated:** May 9, 2026  
**Helix Lab Admin Dashboard**
