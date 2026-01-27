/**
 * Australian Phone Number Formatting & Validation
 * Formats and validates Australian mobile and landline numbers
 * Supports: 04xxxxxxxx, +614xxxxxxxx, +61 4xxxxxxxx
 */

class AUPhoneFormatter {
    /**
     * Format AU phone number for display
     * @param {string} value - Raw phone number
     * @returns {string} Formatted phone number
     */
    static formatForDisplay(value) {
        if (!value) return '';

        // Remove all non-digits except +
        const cleaned = value.replace(/[^\d+]/g, '');

        // If starts with +61, convert to 04 format
        let digits = cleaned;
        if (cleaned.startsWith('+61')) {
            digits = '0' + cleaned.slice(3); // +614 → 04
        }

        // Only format if it looks like a valid AU number (starts with 04 or 02, etc)
        if (!digits.match(/^0\d{9,10}$/)) {
            return cleaned; // Return as-is if not valid format
        }

        // Format mobile: 0412 345 678
        if (digits.startsWith('04')) {
            return digits.slice(0, 4) + ' ' + digits.slice(4, 7) + ' ' + digits.slice(7);
        }

        // Format other landlines: 02 1234 5678
        if (digits.startsWith('0')) {
            return digits.slice(0, 2) + ' ' + digits.slice(2, 6) + ' ' + digits.slice(6);
        }

        return digits;
    }

    /**
     * Normalize phone number to canonical +61 format
     * @param {string} value - Raw phone number
     * @returns {string|null} Canonical +61 format or null if invalid
     */
    static normalizeToCanonical(value) {
        if (!value) return null;

        // Remove all non-digits except +
        const cleaned = value.replace(/[^\d+]/g, '');

        // Convert 04 to +614
        if (cleaned.startsWith('04')) {
            return '+61' + cleaned.slice(1); // 04xxxxxxxx → +614xxxxxxxx
        }

        // If already +61, ensure it's valid
        if (cleaned.startsWith('+614')) {
            return cleaned;
        }

        // If it's another AU format (02, 03, 07, 08), also support it
        if (cleaned.match(/^0[2378]\d{8}$/)) {
            return '+61' + cleaned.slice(1);
        }

        return null;
    }

    /**
     * Validate AU phone number
     * @param {string} value - Raw phone number
     * @returns {object} {valid: boolean, error: string|null}
     */
    static validate(value) {
        if (!value) {
            return { valid: false, error: 'Phone number is required' };
        }

        const canonical = this.normalizeToCanonical(value);
        if (!canonical) {
            return {
                valid: false,
                error: 'Please enter a valid Australian phone number (e.g., 0412 345 678 or +61 412 345 678)'
            };
        }

        // Mobile numbers: +614xx xxxxxxx (2-4, 6-10 and 11-14 are valid carriers)
        // Landlines: +612xx xxxxxx, +613xx xxxxxx, etc.
        const isValidMobile = canonical.match(/^\+614[0-9]{8}$/);
        const isValidLandline = canonical.match(/^\+61[2378][0-9]{8}$/);

        if (!isValidMobile && !isValidLandline) {
            return {
                valid: false,
                error: 'Please enter a valid Australian phone number'
            };
        }

        return { valid: true, error: null };
    }
}

/**
 * Initialize AU phone formatting for a phone input element
 * @param {HTMLInputElement} phoneInput - The phone input element
 */
function initAUPhoneFormatting(phoneInput) {
    if (!phoneInput) return;

    // Format on input
    phoneInput.addEventListener('input', (e) => {
        const rawValue = e.target.value;
        const formatted = AUPhoneFormatter.formatForDisplay(rawValue);
        e.target.value = formatted;

        // Store canonical format in a hidden field or data attribute
        const canonical = AUPhoneFormatter.normalizeToCanonical(rawValue);
        e.target.dataset.canonical = canonical || '';
    });

    // Validate on blur
    phoneInput.addEventListener('blur', (e) => {
        const validation = AUPhoneFormatter.validate(e.target.value);
        const errorEl = document.getElementById('error-' + e.target.id);

        if (!validation.valid && e.target.value) {
            e.target.classList.add('is-invalid');
            if (errorEl) {
                errorEl.textContent = validation.error;
            }
        } else {
            e.target.classList.remove('is-invalid');
            if (errorEl) {
                errorEl.textContent = '';
            }
        }
    });
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const mobileInput = document.getElementById('mobile');
    if (mobileInput) {
        initAUPhoneFormatting(mobileInput);
    }
});
