# Brand Selection Page - Visual Comparison

**Before → After**

---

## Desktop Layout (1024px+)

### BEFORE
```
┌────────────────────────────────────────────────────────────────┐
│                         Welcome                                 │
│            Please select your massage provider:                 │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │   [Flexion Logo]        │  │   [Hemisphere Logo/H]       │  │
│  │                         │  │                             │  │
│  │   Flexion & Flow        │  │   Hemisphere Wellness       │  │
│  │   Standard intake form  │  │   Hemisphere Wellness       │  │
│  │                         │  │   clients                   │  │
│  └─────────────────────────┘  └─────────────────────────────┘  │
│                                                                  │
│   Your information is kept private and secure                   │
└────────────────────────────────────────────────────────────────┘
```

### AFTER
```
┌────────────────────────────────────────────────────────────────┐
│                         Welcome                                 │
│            Please select your massage provider:                 │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │                         │  │                             │  │
│  │   [Flexion Logo]        │  │   [Hemisphere Logo]         │  │
│  │   (110-140px height)    │  │   (110-140px height)        │  │
│  │                         │  │                             │  │
│  │ flexionandflow.com.au   │  │ hemispherewellness.com      │  │
│  └─────────────────────────┘  └─────────────────────────────┘  │
│                                                                  │
│   Your information is kept private and secure                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Mobile Layout (375px - 480px)

### BEFORE
```
┌────────────────────────────────┐
│      Welcome                    │
│ Please select your provider:    │
│                                 │
│  ┌──────────────────────────┐   │
│  │   [Flexion Logo]         │   │
│  │                          │   │
│  │   Flexion & Flow         │   │
│  │   Standard intake form   │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌──────────────────────────┐   │
│  │   [Hemisphere Logo/H]    │   │
│  │                          │   │
│  │   Hemisphere Wellness    │   │
│  │   Hemisphere Wellness    │   │
│  │   clients                │   │
│  └──────────────────────────┘   │
│                                 │
│  Your information is kept...    │
└────────────────────────────────┘
```

### AFTER
```
┌────────────────────────────────┐
│      Welcome                    │
│ Please select your provider:    │
│                                 │
│  ┌──────────────────────────┐   │
│  │                          │   │
│  │   [Flexion Logo]         │   │
│  │   (72-96px height)       │   │
│  │                          │   │
│  │ flexionandflow.com.au    │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌──────────────────────────┐   │
│  │                          │   │
│  │   [Hemisphere Logo]      │   │
│  │   (72-96px height)       │   │
│  │                          │   │
│  │ hemispherewellness.com   │   │
│  └──────────────────────────┘   │
│                                 │
│  Your information is kept...    │
└────────────────────────────────┘
```

---

## Key Visual Changes

| Element | Before | After |
|---------|--------|-------|
| **Text Content** | Brand name + Subtitle | Website link only |
| **Logo Height (Mobile)** | 60-80px | 72-96px |
| **Logo Height (Desktop)** | 60-80px | 110-140px |
| **Hemisphere Logo** | "H" Placeholder | Actual Logo |
| **Card Min Height** | 260px | 220px |
| **Content Spacing** | Text + Icon | Compact Logo + Link |
| **Visual Focus** | Text-heavy | Logo-focused |
| **Cleanliness** | Moderate | Very clean |

---

## Component Structure

### HTML Changes

**Card Structure:**
```html
<!-- Before -->
<button class="form-card brand-card">
  <div class="card-icon">
    <img ... class="brand-logo-image">
  </div>
  <h2>Brand Name</h2>
  <p class="brand-subtitle">Subtitle</p>
</button>

<!-- After -->
<button class="form-card brand-card" aria-label="Select Brand">
  <div class="brand-logo-container">
    <img ... class="brand-logo-image">
  </div>
  <a href="..." class="brand-link">website.url</a>
</button>
```

---

## CSS Styling Comparison

### Flexbox Layout

**Before:**
- Used default form-card inherited styles
- Card aligned items implicitly
- Vertical spacing handled by margin

**After:**
```css
.brand-card {
    display: flex;
    flex-direction: column;
    align-items: center;        /* center horizontally */
    justify-content: center;    /* center vertically */
    padding: 24px 20px;
    gap: 16px;                  /* space between logo and link */
}
```

### Logo Container

**New:**
```css
.brand-logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 72px;    /* mobile */
    max-height: 96px;    /* mobile */
}

@media (min-width: 768px) {
    .brand-logo-container {
        min-height: 110px;   /* desktop */
        max-height: 140px;   /* desktop */
    }
}
```

### Website Link

**New:**
```css
.brand-link {
    color: var(--text-light);
    font-size: 13px;
    text-decoration: none;
    transition: color 0.2s ease;
}

.brand-link:hover {
    color: var(--primary-color);
    text-decoration: underline;
}

.brand-link:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}
```

---

## Interaction States

### Card States

| State | Before | After |
|-------|--------|-------|
| **Default** | Subtle shadow | Same |
| **Hover** | Lifted, shadow grows | Same + Potential link underline |
| **Active/Click** | - | Scale down 0.98 (subtle press effect) |
| **Focus** | Colored outline | Same |
| **Disabled** | N/A | N/A |

### Link States

| State | Visual |
|-------|--------|
| **Default** | Light gray text, no underline |
| **Hover** | Primary color, underline |
| **Focus** | Colored outline around link |
| **Visited** | Same as default (no visited state) |

---

## Accessibility Changes

### Screen Reader

**Before:**
```
Button: (card action)
  Image: (logo)
  Heading: Flexion & Flow
  Paragraph: Standard intake form
```

**After:**
```
Button: Select Flexion & Flow
  Image: (logo)
  Link: flexionandflow.com.au
```

### Keyboard Navigation

**Before:**
- Tab to card → outline visible
- Enter/Space → select brand
- No links to tab to

**After:**
- Tab to card → outline visible
- Enter/Space → select brand
- Tab to link → outline visible
- Enter/Space on link → opens website in new tab

---

## Logo Assets

### Before
```
public/img/flexion-flow-logo.png     (exists)
Hemisphere: H placeholder (CSS only)
```

### After
```
public/img/flexion-flow-logo.png     (unchanged)
public/img/hemisphere-logo.png       (actual logo image)
```

---

## Responsive Breakpoints

### Mobile (< 768px)
- Logo height: 72-96px
- Card padding: 24px 20px
- Link font: 13px
- Full width cards (flex-wrap or stacked)

### Tablet (768px - 1024px)
- Transition to desktop sizing
- Logo height: 110-140px
- Cards side-by-side with good spacing

### Desktop (> 1024px)
- Logo height: 110-140px
- Maximum layout width: 1200px
- Cards equally spaced

---

## Design Decisions

1. **Logo-Only Approach**
   - Cleaner visual design
   - Focuses on brand recognition
   - Reduces cognitive load
   - More modern appearance

2. **Website Links Below Logos**
   - Provides brand verification
   - Directs interested users to company
   - Doesn't interfere with selection flow
   - Opens in new tab to preserve form

3. **Responsive Sizing**
   - Mobile: 72-96px (clear but not overwhelming)
   - Desktop: 110-140px (prominent, professional)
   - Scales smoothly between breakpoints

4. **Accessibility**
   - aria-labels provide clear button purpose
   - Keyboard navigation fully supported
   - Focus states clearly visible
   - Links independently focusable

5. **Visual Feedback**
   - Hover effects on card and link
   - Active/press effect (scale 0.98)
   - Focus outlines for keyboard users
   - Smooth transitions (0.25s)

---

## Summary

The new design is **cleaner, more modern, and logo-focused** while maintaining all functionality and accessibility. The removal of text labels makes the interface feel less cluttered, and the addition of website links adds a professional touch.

**Key Improvements:**
- ✅ Cleaner visual appearance
- ✅ Better brand focus (logos prominent)
- ✅ Professional with website links
- ✅ Improved accessibility with aria-labels
- ✅ Responsive design (mobile to desktop)
- ✅ Actual Hemisphere logo (not placeholder)
- ✅ Smooth interactions and transitions
