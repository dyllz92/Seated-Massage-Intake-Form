// Brand Selection and Theming
// Handles localStorage persistence and UI theming for brand selection

const BRAND_STORAGE_KEY = 'selectedBrand';

/**
 * Get the currently selected brand from localStorage
 * @returns {'flexion' | 'hemisphere' | null}
 */
function getSelectedBrand() {
    try {
        return localStorage.getItem(BRAND_STORAGE_KEY);
    } catch (e) {
        console.warn('localStorage not available:', e);
        return null;
    }
}

/**
 * Set the selected brand in localStorage
 * @param {'flexion' | 'hemisphere'} brand
 */
function setSelectedBrand(brand) {
    try {
        localStorage.setItem(BRAND_STORAGE_KEY, brand);
    } catch (e) {
        console.warn('localStorage not available:', e);
    }
}

/**
 * Clear the selected brand from localStorage
 */
function clearSelectedBrand() {
    try {
        localStorage.removeItem(BRAND_STORAGE_KEY);
    } catch (e) {
        console.warn('localStorage not available:', e);
    }
}

/**
 * Apply brand theming to the page
 * Sets data-brand attribute on body element
 * @param {'flexion' | 'hemisphere' | null} brand
 */
function applyBrandTheme(brand) {
    if (brand) {
        document.body.setAttribute('data-brand', brand);
        document.documentElement.setAttribute('data-brand', brand);
    } else {
        document.body.removeAttribute('data-brand');
        document.documentElement.removeAttribute('data-brand');
    }
}

/**
 * Get the display name for a brand
 * @param {'flexion' | 'hemisphere' | null} brand
 * @returns {string}
 */
function getBrandDisplayName(brand) {
    switch (brand) {
        case 'hemisphere':
            return 'Hemisphere Wellness';
        case 'flexion':
        default:
            return 'Flexion & Flow';
    }
}

/**
 * Handle brand selection and navigate to form type selection
 * @param {'flexion' | 'hemisphere'} brand
 */
function selectBrand(brand) {
    setSelectedBrand(brand);
    window.location.href = '/select-form';
}

/**
 * Handle changing brand - clears selection and goes back to brand select
 */
function changeBrand() {
    clearSelectedBrand();
    window.location.href = '/';
}

/**
 * Initialize brand theming on page load
 * Call this on pages that need brand theming applied
 */
function initBrandTheme() {
    const brand = getSelectedBrand();
    applyBrandTheme(brand);
    return brand;
}

/**
 * Check if brand is selected, redirect to brand selection if not
 * @returns {boolean} true if brand is selected
 */
function requireBrand() {
    const brand = getSelectedBrand();
    if (!brand) {
        window.location.href = '/';
        return false;
    }
    applyBrandTheme(brand);
    return true;
}

/**
 * Update page branding elements (logo, title, etc.)
 * @param {'flexion' | 'hemisphere' | null} brand
 */
function updateBrandingElements(brand) {
    // Update logo if present
    const logo = document.querySelector('.logo, .logo-small');
    if (logo && logo.tagName === 'IMG') {
        if (brand === 'hemisphere') {
            // Hide Flexion logo for Hemisphere, could replace with Hemisphere logo if available
            logo.style.display = 'none';
        } else {
            logo.style.display = '';
        }
    }

    // Update page title
    const displayName = getBrandDisplayName(brand);
    if (document.title.includes('Flexion & Flow')) {
        document.title = document.title.replace('Flexion & Flow', displayName);
    }

    // Update h1 headings that reference the brand
    const h1 = document.querySelector('.header-section h1');
    if (h1 && h1.textContent.includes('Flexion & Flow')) {
        h1.textContent = h1.textContent.replace('Flexion & Flow', displayName);
    }
}

// Auto-initialize on DOMContentLoaded for pages that include this script
document.addEventListener('DOMContentLoaded', () => {
    // Don't auto-apply on brand selection page itself
    if (!document.querySelector('.brand-selection')) {
        const brand = initBrandTheme();
        updateBrandingElements(brand);
    }
});
