/**
 * Wishup Application Form
 * Handles form validation, Cloudflare location detection, and submission
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        cloudflareHeader: 'CF-IPCountry',
        defaultCountryCode: 'in',
        indiaCountryCode: 'IN',
        defaultServiceIndia: 'looking-job',
        defaultServiceOthers: 'hire-va',
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    };

    // Global reference to intl-tel-input instance
    let phoneInput = null;

    // Utility functions
    const utils = {
        getElement: (selector) => document.querySelector(selector),
        getElements: (selector) => document.querySelectorAll(selector),
        
        showError: (inputId, message) => {
            const input = utils.getElement(`#${inputId}`);
            const error = utils.getElement(`#${inputId}-error`);
            
            if (input) input.classList.add('error');
            if (error) {
                error.textContent = message;
                error.classList.add('visible');
            }
        },

        clearError: (inputId) => {
            const input = utils.getElement(`#${inputId}`);
            const error = utils.getElement(`#${inputId}-error`);
            
            if (input) input.classList.remove('error');
            if (error) {
                error.textContent = '';
                error.classList.remove('visible');
            }
        },

        showMessage: (message, type = 'success') => {
            const messageEl = utils.getElement('#form-message');
            if (messageEl) {
                messageEl.textContent = message;
                messageEl.className = `form-message visible ${type}`;
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    messageEl.classList.remove('visible');
                }, 5000);
            }
        },

        setLoading: (isLoading) => {
            const btn = utils.getElement('#submit-btn');
            if (btn) {
                if (isLoading) {
                    btn.classList.add('loading');
                    btn.disabled = true;
                } else {
                    btn.classList.remove('loading');
                    btn.disabled = false;
                }
            }
        }
    };

    // Location detection using Cloudflare trace via client-side function
    const LocationDetector = {
        userCountry: null,
        isIndia: false,

        async init() {
            try {
                // Use global fetchGeoLocation if available
                if (typeof window !== 'undefined' && typeof window.fetchGeoLocation === 'function') {
                    const country = await window.fetchGeoLocation();
                    this.userCountry = (country || 'US').toUpperCase();
                } else {
                    // As a fallback use timezone
                    this.detectFromTimezone();
                }
            } catch (e) {
                console.warn('LocationDetector.init failed, falling back', e);
                this.detectFromTimezone();
            }

            this.isIndia = this.userCountry === CONFIG.indiaCountryCode;
            this.setDefaultService();
            this.setPhoneCountry();
            return this.isIndia;
        },

        detectFromTimezone() {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            this.isIndia = timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta');
            this.userCountry = this.isIndia ? CONFIG.indiaCountryCode : 'US';
        },

        setDefaultService() {
            const serviceSelect = utils.getElement('#form-service');
            if (serviceSelect && (!serviceSelect.value || serviceSelect.value === '')) {
                const defaultValue = this.isIndia ? CONFIG.defaultServiceIndia : CONFIG.defaultServiceOthers;
                serviceSelect.value = defaultValue;
                FormHandler.updateButtonText(defaultValue);
            }
        },

        setPhoneCountry() {
            // Set the country for intl-tel-input based on detected location
            if (phoneInput && this.userCountry) {
                const countryCode = this.userCountry.toLowerCase();
                phoneInput.setCountry(countryCode);
                console.debug('[Location] Set phone country to:', countryCode);
            }
        }
    };

    // Form validation
    const Validator = {
        validateName(value) {
            if (!value || value.trim().length < 2) {
                return 'Please enter your full name (at least 2 characters)';
            }
            if (value.trim().length > 100) {
                return 'Name is too long (maximum 100 characters)';
            }
            return null;
        },

        validateEmail(value) {
            if (!value || !CONFIG.emailRegex.test(value)) {
                return 'Please enter a valid email address (e.g., name@company.com)';
            }
            return null;
        },

        validatePhone(value) {
            if (!phoneInput) {
                return 'Phone input not initialized';
            }

            if (!value || value.trim() === '') {
                return 'Please enter your phone number';
            }

            // Use intl-tel-input's built-in validation
            if (!phoneInput.isValidNumber()) {
                return 'Please enter a valid phone number for the selected country';
            }

            return null;
        },

        validateService(value) {
            if (!value) {
                return 'Please select an option';
            }
            return null;
        },

        validateForm(formData) {
            const errors = {};
            
            const serviceError = this.validateService(formData.service);
            if (serviceError) errors.service = serviceError;
            
            const nameError = this.validateName(formData.name);
            if (nameError) errors.name = nameError;
            
            const emailError = this.validateEmail(formData.email);
            if (emailError) errors.email = emailError;
            
            const phoneError = this.validatePhone(formData.phone);
            if (phoneError) errors.phone = phoneError;
            
            return errors;
        }
    };

    // Form handler
    const FormHandler = {
        init() {
            const form = utils.getElement('#wishup-form');
            if (!form) return;

            // Initialize intl-tel-input
            this.initPhoneInput();

            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize location detection (will set phone country)
            LocationDetector.init();
        },

        initPhoneInput() {
            const input = document.querySelector("#form-phone");
            if (!input) {
                console.warn('[Form] Phone input not found');
                return;
            }

            // Check if intlTelInput is available
            if (typeof window.intlTelInput !== 'function') {
                console.error('[Form] intlTelInput not loaded');
                return;
            }

            phoneInput = window.intlTelInput(input, {
                initialCountry: 'in', // Will be updated by LocationDetector
                preferredCountries: ['in', 'us', 'gb', 'au'],
                separateDialCode: true,
                utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@25.10.1/build/js/utils.js',
                autoPlaceholder: 'aggressive',
                formatOnDisplay: true,
                nationalMode: false,
                countrySearch: false, // Disable search box in dropdown
                showFlags: true,
                showSelectedDialCode: true
            });

            console.debug('[Form] Phone input initialized');
        },

        setupEventListeners() {
            const form = utils.getElement('#wishup-form');
            
            // Form submission
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });

            // Real-time validation on blur
            const inputs = ['form-name', 'form-email', 'form-phone', 'form-service'];
            inputs.forEach(id => {
                const input = utils.getElement(`#${id}`);
                if (input) {
                    input.addEventListener('blur', () => {
                        this.validateField(id);
                    });
                    
                    input.addEventListener('input', () => {
                        utils.clearError(id.replace('form-', ''));
                    });
                }
            });

            // Service selection change - update button text
            const serviceSelect = utils.getElement('#form-service');
            if (serviceSelect) {
                serviceSelect.addEventListener('change', (e) => {
                    this.updateButtonText(e.target.value);
                });
            }
        },

        validateField(fieldId) {
            const input = utils.getElement(`#${fieldId}`);
            if (!input) return;

            const value = input.value.trim();
            const field = fieldId.replace('form-', '');
            let error = null;

            switch(field) {
                case 'name':
                    error = Validator.validateName(value);
                    break;
                case 'email':
                    error = Validator.validateEmail(value);
                    break;
                case 'phone':
                    error = Validator.validatePhone(value);
                    break;
                case 'service':
                    error = Validator.validateService(value);
                    break;
            }

            if (error) {
                utils.showError(field, error);
                return false;
            } else {
                utils.clearError(field);
                return true;
            }
        },

        updateButtonText(service) {
            const btn = utils.getElement('#submit-btn .btn-text');
            if (btn) {
                let text = 'Submit';
                if (service === 'looking-job') {
                    text = 'Apply Now';
                } else if (service === 'hire-va' || service === 'hire-bookkeeper') {
                    text = 'Get Free Consultation';
                } else {
                    text = 'Submit';
                }
                btn.textContent = text;
            }
        },

        async handleSubmit() {
            // Clear previous messages
            const messageEl = utils.getElement('#form-message');
            if (messageEl) messageEl.classList.remove('visible');

            // Get full phone number with country code from intl-tel-input
            const fullPhoneNumber = phoneInput ? phoneInput.getNumber() : '';

            // Get form data
            const formData = {
                service: utils.getElement('#form-service').value,
                name: utils.getElement('#form-name').value.trim(),
                email: utils.getElement('#form-email').value.trim(),
                phone: fullPhoneNumber, // Full international format (e.g., +911234567890)
                phoneCountryCode: phoneInput ? phoneInput.getSelectedCountryData().dialCode : '',
                phoneCountry: phoneInput ? phoneInput.getSelectedCountryData().iso2 : '',
                experience: utils.getElement('#form-experience').value.trim(),
                country: LocationDetector.userCountry,
                isIndia: LocationDetector.isIndia,
                submittedAt: new Date().toISOString()
            };

            // Validate
            const errors = Validator.validateForm(formData);
            
            if (Object.keys(errors).length > 0) {
                // Show all errors
                Object.keys(errors).forEach(field => {
                    utils.showError(field, errors[field]);
                });
                
                // Focus first error field
                const firstErrorField = Object.keys(errors)[0];
                utils.getElement(`#form-${firstErrorField}`).focus();
                return;
            }

            // Clear all errors
            ['service', 'name', 'email', 'phone'].forEach(field => {
                utils.clearError(field);
            });

            // Show loading state
            utils.setLoading(true);

            // Submit to backend (don't wait for response)
            this.submitToBackend(formData).catch(error => {
                console.error('Form submission error:', error);
            });

            // Track submission (if analytics is available)
            if (window.gtag) {
                window.gtag('event', 'form_submit', {
                    event_category: 'engagement',
                    event_label: formData.service
                });
            }

            // Open Calendly immediately with form data on desktop only.
            // On mobile we show the form modal / thank-you flow but do NOT open Calendly directly.
            const calendlyUrl = this.getCalendlyUrl();
            const isMobileView = (typeof window !== 'undefined') && window.innerWidth <= 968;

            if (!isMobileView) {
                console.debug('[Form] Opening Calendly after submission (desktop view)');
                if (typeof window.openCalendly === 'function') {
                    window.openCalendly(calendlyUrl, {
                        name: formData.name,
                        email: formData.email,
                        phone: fullPhoneNumber // Pass full international number
                    });
                }
            } else {
                console.debug('[Form] Mobile view detected - skipping Calendly open');
            }

            // Reset form and hide loading after short delay
            setTimeout(() => {
                utils.setLoading(false);
                utils.getElement('#wishup-form').reset();
                
                // Reset phone input
                if (phoneInput) {
                    phoneInput.setNumber('');
                }
                
                LocationDetector.setDefaultService();
                
                // Close modal if open
                const modal = utils.getElement('.form-modal');
                if (modal && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }, 500);
        },

        getCalendlyUrl() {
            // Check for calendly URL in various places
            const modal = utils.getElement('.form-modal');
            const trigger = utils.getElement('.wishup-form-trigger');
            const form = utils.getElement('#wishup-form');
            
            return modal?.getAttribute('data-calendly-url')
                || trigger?.getAttribute('data-calendly-url')
                || form?.getAttribute('data-calendly-url')
                || 'https://calendly.com/neelesh-rangwani-wishup/30min';
        },

        async submitToBackend(formData) {
            // Replace with your actual API endpoint
            const apiEndpoint = '/api/submit-application'; // or your full URL
            
            try {
                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('Form submitted to API');
                return response;
            } catch (error) {
                // Don't throw - we don't want to block Calendly from opening
                console.error('API submission failed:', error);
                return null;
            }
        }
    };

    // Modal functionality
    const ModalHandler = {
        init() {
            const triggers = utils.getElements('.wishup-form-trigger');
            triggers.forEach(trigger => {
                trigger.addEventListener('click', () => this.open());
            });

            const modal = utils.getElement('.form-modal');
            if (modal) {
                // Close on background click
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.close();
                    }
                });

                // Close on escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.close();
                    }
                });

                // Add close button if not exists
                this.addCloseButton();
            }

            // Wire up Calendly button if present
            this.setupCalendlyButton();
        },

        setupCalendlyButton() {
            const calendlyBtn = utils.getElement('#calendly-btn');
            if (!calendlyBtn) return;

            calendlyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get calendly URL from data attribute or modal container
                const modal = utils.getElement('.form-modal');
                const trigger = utils.getElement('.wishup-form-trigger');
                const calendlyUrl = modal?.getAttribute('data-calendly-url') 
                    || trigger?.getAttribute('data-calendly-url')
                    || 'https://calendly.com/neelesh-rangwani-wishup/30min';

                console.debug('[Modal] Calendly button clicked, URL:', calendlyUrl);
                openCalendlyFromForm(calendlyUrl);
            });
        },

        addCloseButton() {
            const container = utils.getElement('.form-modal .form-container');
            if (container && !container.querySelector('.form-close')) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'form-close';
                closeBtn.setAttribute('aria-label', 'Close');
                closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
                closeBtn.addEventListener('click', () => this.close());
                container.insertBefore(closeBtn, container.firstChild);
            }
        },

        open() {
            const modal = utils.getElement('.form-modal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },

        close() {
            const modal = utils.getElement('.form-modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    };

    // Calendly integration: open prefilled Calendly using openCalendly helper
    function openCalendlyFromForm(calendlyUrl) {
        if (!calendlyUrl) {
            console.error('[Form] No Calendly URL provided');
            return;
        }

        const name = (utils.getElement('#form-name') || {}).value || '';
        const email = (utils.getElement('#form-email') || {}).value || '';
        
        // Get full international phone number from intl-tel-input
        const fullPhone = phoneInput ? phoneInput.getNumber() : '';

        console.debug('[Form] Opening Calendly with form data:', { name, email, phone: fullPhone });

        if (typeof window.openCalendly === 'function') {
            window.openCalendly(calendlyUrl, { name, email, phone: fullPhone });
        } else {
            console.error('[Form] Calendly helper not loaded');
            // Fallback: construct URL and open in new tab
            const params = new URLSearchParams();
            if (name) params.set('name', name);
            if (email) params.set('email', email);
            if (fullPhone) params.set('a1', fullPhone);
            const target = calendlyUrl + (params.toString() ? `?${params.toString().replace(/\+/g, '%20')}` : '');
            window.open(target, '_blank', 'noopener');
        }
    }

    // Expose function to window so templates can call it (e.g., data-calendly-url)
    if (typeof window !== 'undefined') {
        window.openCalendlyFromForm = openCalendlyFromForm;
    }

    // Initialize on DOM ready: ensure LocationDetector.init runs so cookies are read/created
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            LocationDetector.init().catch(() => {});
            FormHandler.init();
            ModalHandler.init();
        });
    } else {
        LocationDetector.init().catch(() => {});
        FormHandler.init();
        ModalHandler.init();
    }

})();
