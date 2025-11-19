// calendly-helper.js
// Opens Calendly using the official widget with prefill query params
(function () {
    'use strict';

    /**
     * Opens Calendly popup widget with prefilled data
     * @param {string} url - Base Calendly URL (e.g., "https://calendly.com/username/30min")
     * @param {Object} options - Prefill options
     * @param {string} options.name - User's name
     * @param {string} options.email - User's email
     * @param {string} options.phone - User's phone (will be passed as 'a1' custom field)
     */
    function openCalendly(url, options) {
        options = options || {};
        var name = options.name;
        var email = options.email;
        var phone = options.phone;

        if (!url) {
            console.error('[Calendly] No URL provided');
            return;
        }

        // Build prefill query params
        var params = [];
        if (name && name.trim()) params.push('name=' + encodeURIComponent(name.trim()));
        if (email && email.trim()) params.push('email=' + encodeURIComponent(email.trim()));
        if (phone && phone.trim()) params.push('a1=' + encodeURIComponent(phone.trim()));

        // Construct full URL with params
        var fullUrl = url + (params.length ? '?' + params.join('&') : '');

        console.debug('[Calendly] Opening with URL:', fullUrl);

        // Wait for Calendly script to be ready
        var tryOpenCalendly = function() {
            if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
                try {
                    window.Calendly.initPopupWidget({ url: fullUrl });
                    console.debug('[Calendly] Popup opened successfully');
                } catch (err) {
                    console.error('[Calendly] Failed to open popup:', err);
                    fallbackOpen(fullUrl);
                }
            } else {
                console.warn('[Calendly] Widget not ready, using fallback');
                fallbackOpen(fullUrl);
            }
        };

        // Small delay to ensure script is loaded
        setTimeout(tryOpenCalendly, 50);
    }

    /**
     * Fallback: open in new window if Calendly widget not available
     */
    function fallbackOpen(url) {
        var width = Math.min(window.innerWidth - 40, 900);
        var height = Math.min(window.innerHeight - 80, 720);
        var left = Math.max(0, (window.screen.width - width) / 2);
        var top = Math.max(0, (window.screen.height - height) / 2);

        window.open(
            url,
            'calendly',
            'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',resizable=yes,scrollbars=yes'
        );
    }

    /**
     * Store lead form data in localStorage for later use
     */
    function storeLeadFormData(data) {
        try {
            localStorage.setItem('leadFormData', JSON.stringify(data));
            console.debug('[Calendly] Lead data stored in localStorage');
        } catch (e) {
            console.error('[Calendly] Failed to store lead data:', e);
        }
    }

    /**
     * Get stored lead form data from localStorage
     */
    function getLeadFormData() {
        try {
            var data = localStorage.getItem('leadFormData');
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('[Calendly] Failed to retrieve lead data:', e);
            return {};
        }
    }

    /**
     * Clear stored lead form data
     */
    function clearLeadFormData() {
        try {
            localStorage.removeItem('leadFormData');
            console.debug('[Calendly] Lead data cleared from localStorage');
        } catch (e) {
            console.error('[Calendly] Failed to clear lead data:', e);
        }
    }

    /**
     * Auto-open Calendly if URL query params indicate success
     */
    function checkAndAutoOpenCalendly() {
        var urlParams = new URLSearchParams(window.location.search);
        var shouldOpen = urlParams.get('message') === 'success' && urlParams.get('lead_id');

        if (!shouldOpen) return;

        console.debug('[Calendly] Auto-opening based on URL params');

        var leadInfo = getLeadFormData();
        var calendlyBaseUrl = urlParams.get('calendly_url') || 'https://calendly.com/neelesh-rangwani-wishup/30min';

        openCalendly(calendlyBaseUrl, {
            name: leadInfo.name,
            email: leadInfo.email,
            phone: leadInfo.phone
        });

        // Clear the data after opening
        setTimeout(function() { clearLeadFormData(); }, 1000);
    }

    // Expose functions globally
    if (typeof window !== 'undefined') {
        window.openCalendly = openCalendly;
        window.storeLeadFormData = storeLeadFormData;
        window.getLeadFormData = getLeadFormData;
        window.clearLeadFormData = clearLeadFormData;
    }

    // Auto-check on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndAutoOpenCalendly);
    } else {
        checkAndAutoOpenCalendly();
    }

    // Support ES module export if needed
    try {
        if (typeof exports === 'object') {
            exports.openCalendly = openCalendly;
            exports.storeLeadFormData = storeLeadFormData;
            exports.getLeadFormData = getLeadFormData;
            exports.clearLeadFormData = clearLeadFormData;
        }
    } catch (e) {
        // ignore
    }
})();

