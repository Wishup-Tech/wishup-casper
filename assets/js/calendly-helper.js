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

        console.debug('[Calendly] Opening in modal with URL:', fullUrl);
        openCalendlyInModal(fullUrl);
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
     * Inject minimal styles for Calendly modal
     */
    function injectCalendlyModalStyles() {
        if (document.getElementById('calendly-modal-styles')) return;
        var style = document.createElement('style');
        style.id = 'calendly-modal-styles';
        style.textContent = "\n" +
            ".calendly-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;z-index:10050;opacity:0;transition:opacity .2s ease}\n" +
            ".calendly-modal-overlay.active{opacity:1}\n" +
            ".calendly-modal{background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.2);max-width:960px;width:calc(100vw - 32px);height:calc(100vh - 80px);max-height:900px;display:flex;flex-direction:column;overflow:hidden;position:relative}\n" +
            ".calendly-modal-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #e5e7eb;flex-shrink:0}\n" +
            ".calendly-modal-title{font-size:16px;font-weight:600;color:#111827;margin:0}\n" +
            ".calendly-modal-close{border:none;background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;color:#6b7280}\n" +
            ".calendly-modal-close:hover{background:#f3f4f6;color:#111827}\n" +
            ".calendly-modal-body{position:relative;flex:1;min-height:420px;background:#fff;overflow:hidden;width:100%}\n" +
            ".calendly-iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:none}\n" +
            ".calendly-loader{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#fff}\n" +
            ".calendly-spinner{width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#2563eb;border-radius:50%;animation:cal-spin 1s linear infinite}\n" +
            "@keyframes cal-spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}\n" +
            "@media (max-width: 768px){.calendly-modal{width:calc(100vw - 24px);height:calc(100vh - 60px);max-height:none}}\n" +
            "@media (max-width: 480px){.calendly-modal{width:100vw;height:100vh;max-height:none;border-radius:0}}\n";
        document.head.appendChild(style);
    }

    /**
     * Open Calendly in a custom modal with loader until iframe loads
     */
    function openCalendlyInModal(fullUrl) {
        try {
            injectCalendlyModalStyles();

            // Overlay
            var overlay = document.createElement('div');
            overlay.className = 'calendly-modal-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');

            // Modal container
            var modal = document.createElement('div');
            modal.className = 'calendly-modal';

            // Header
            var header = document.createElement('div');
            header.className = 'calendly-modal-header';
            var title = document.createElement('h3');
            title.className = 'calendly-modal-title';
            title.textContent = 'Schedule now';
            var closeBtn = document.createElement('button');
            closeBtn.className = 'calendly-modal-close';
            closeBtn.setAttribute('aria-label', 'Close scheduling');
            closeBtn.innerHTML = '\n                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>\n            ';

            header.appendChild(title);
            header.appendChild(closeBtn);

            // Body
            var body = document.createElement('div');
            body.className = 'calendly-modal-body';

            var loader = document.createElement('div');
            loader.className = 'calendly-loader';
            loader.innerHTML = '\n                <div class="calendly-spinner"></div>\n                <div style="color:#374151;font-size:14px">Loading scheduler…</div>\n            ';

            var iframe = document.createElement('iframe');
            iframe.className = 'calendly-iframe';
            iframe.src = fullUrl;
            iframe.title = 'Calendly Scheduler';
            iframe.loading = 'eager';
            iframe.addEventListener('load', function () {
                // Hide loader, reveal Calendly
                loader.style.display = 'none';
                iframe.style.display = 'block';
            }, { once: true });

            body.appendChild(loader);
            body.appendChild(iframe);

            modal.appendChild(header);
            modal.appendChild(body);
            overlay.appendChild(modal);

            function close() {
                try { document.body.style.overflow = ''; } catch (_) {}
                try { document.removeEventListener('keydown', onKeyDown); } catch (_) {}
                if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }

            function onKeyDown(e) {
                if (e.key === 'Escape') close();
            }

            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) close();
            });
            closeBtn.addEventListener('click', close);
            document.addEventListener('keydown', onKeyDown);

            document.body.appendChild(overlay);
            // trigger fade-in
            requestAnimationFrame(function(){ overlay.classList.add('active'); });
            // prevent background scroll
            document.body.style.overflow = 'hidden';
        } catch (err) {
            console.error('[Calendly] Modal open failed, falling back:', err);
            fallbackOpen(fullUrl);
        }
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

