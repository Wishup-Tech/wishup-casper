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
        // Countries eligible for Calendly consultation (only for hire-va and hire-bookkeeper)
        calendlyEligibleCountries: ['us', 'ca', 'gb', 'uk', 'au', 'qa', 'sa', 'il', 'ae', 'nl', 'ie', 'nz', 'sg'],
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
            // Set default service for ALL forms on the page
            const serviceSelects = utils.getElements('#form-service');
            serviceSelects.forEach(serviceSelect => {
                if (serviceSelect && (!serviceSelect.value || serviceSelect.value === '')) {
                    const defaultValue = this.isIndia ? CONFIG.defaultServiceIndia : CONFIG.defaultServiceOthers;
                    serviceSelect.value = defaultValue;
                    
                    // Update button text for this form
                    const form = serviceSelect.closest('form');
                    if (form) {
                        const submitBtn = form.querySelector('#submit-btn .btn-text');
                        if (submitBtn) {
                            let text = 'Submit';
                            if (defaultValue === 'looking-job') {
                                text = 'Apply Now';
                            } else if (defaultValue === 'hire-va' || defaultValue === 'hire-bookkeeper') {
                                text = 'Get Free Consultation';
                            }
                            submitBtn.textContent = text;
                        }
                    }
                }
            });
        },

        setPhoneCountry() {
            // Set the country for ALL phone input instances based on detected location
            if (this.userCountry) {
                const countryCode = this.userCountry.toLowerCase();
                
                // Set country for the main phoneInput instance
                if (phoneInput) {
                    phoneInput.setCountry(countryCode);
                    console.debug('[Location] Set main phone country to:', countryCode);
                }
                
                // Set country for all other instances
                if (window.phoneInputInstances && window.phoneInputInstances.length > 0) {
                    window.phoneInputInstances.forEach((instance, index) => {
                        if (instance) {
                            instance.setCountry(countryCode);
                            console.debug(`[Location] Set phone instance ${index + 1} country to:`, countryCode);
                        }
                    });
                }
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
                console.log('[Validation] Phone input not initialized');
                return 'Phone input not initialized';
            }

            // Get the raw input value (what user typed)
            const rawValue = value || '';
            
            console.log('[Validation] Raw phone value:', rawValue);
            console.log('[Validation] Raw phone value length:', rawValue.length);
            
            // Check if empty first
            if (rawValue === '' || rawValue.trim() === '') {
                console.log('[Validation] Phone is empty');
                return 'Please enter your phone number';
            }

            // Get the full number with country code from intl-tel-input
            const fullNumber = phoneInput.getNumber();
            console.log('[Validation] Full number from library:', fullNumber);
            
            // Get just the national number (without country code)
            const nationalNumber = rawValue.replace(/[\s\-\(\)]/g, '');
            console.log('[Validation] National number (cleaned):', nationalNumber);
            console.log('[Validation] National number length:', nationalNumber.length);
            
            // Validate: only digits allowed in the input
            if (!/^\d+$/.test(nationalNumber)) {
                console.log('[Validation] Failed - contains non-digits');
                return 'Phone number can only contain digits';
            }
            
            // Check length of the actual phone number (excluding country code)
            if (nationalNumber.length > 15) {
                console.log('[Validation] Failed - too long:', nationalNumber.length);
                return 'Phone number cannot exceed 15 digits';
            }
            
            if (nationalNumber.length < 7) {
                console.log('[Validation] Failed - too short:', nationalNumber.length);
                return 'Phone number must be at least 7 digits';
            }

            console.log('[Validation] Passed - phone is valid');
            return null;
        },

        validateService(value) {
            if (!value) {
                return 'Please select an option';
            }
            return null;
        },

        validateForm(formData, formElement) {
            const errors = {};
            
            const serviceError = this.validateService(formData.service);
            if (serviceError) errors.service = serviceError;
            
            const nameError = this.validateName(formData.name);
            if (nameError) errors.name = nameError;
            
            const emailError = this.validateEmail(formData.email);
            if (emailError) errors.email = emailError;
            
            // Get the raw phone input value for validation from THIS form
            const phoneInputElement = formElement ? formElement.querySelector('#form-phone') : document.querySelector('#form-phone');
            const rawPhoneValue = phoneInputElement ? phoneInputElement.value : '';
            const phoneError = this.validatePhone(rawPhoneValue);
            if (phoneError) errors.phone = phoneError;
            
            return errors;
        }
    };

    const MOBILE_SIDEFORM_BREAKPOINT = 968;

    // Form handler
    const FormHandler = {
        init() {
            const form = utils.getElement('#wishup-form');
            if (!form) return;

            this.removeUnusedForms();

            // Initialize intl-tel-input
            this.initPhoneInput();

            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize location detection (will set phone country)
            LocationDetector.init();
        },

        removeUnusedForms() {
            const isMobile = window.innerWidth <= MOBILE_SIDEFORM_BREAKPOINT;
            if (!isMobile) {
                return;
            }

            const forms = Array.from(utils.getElements('#wishup-form'));
            forms.forEach(form => {
                const wrapper = form.closest('.wishup-application-form');
                const mode = wrapper?.dataset?.formMode || 'inline';
                if (mode === 'sidebar') {
                    wrapper?.remove();
                }
            });
        },

        initPhoneInput() {
            // Find all phone inputs on the page
            const inputs = document.querySelectorAll("#form-phone");
            if (!inputs || inputs.length === 0) {
                console.warn('[Form] No phone inputs found');
                return;
            }

            // Check if intlTelInput is available
            if (typeof window.intlTelInput !== 'function') {
                console.error('[Form] intlTelInput not loaded');
                return;
            }

            // Store all instances for later use
            window.phoneInputInstances = window.phoneInputInstances || [];

            // Initialize phone input on each form
            inputs.forEach((input, index) => {
                // Skip if already initialized
                if (input.classList.contains('iti__input')) {
                    console.debug('[Form] Phone input already initialized, skipping');
                    return;
                }

                // Desktop: append to body for proper positioning
                // Mobile: keep in parent to work with modal overlay
                const isInModal = !!input.closest('.form-modal');
                const isDesktop = window.innerWidth >= 969;
                
                const options = {
                    initialCountry: 'in', // Will be updated by LocationDetector
                    preferredCountries: ['in', 'us', 'gb', 'au'],
                    separateDialCode: true,
                    utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@25.10.1/build/js/utils.js',
                    autoPlaceholder: 'aggressive',
                    formatOnDisplay: false, // Disable auto-formatting to allow only digits
                    nationalMode: false,
                    countrySearch: true, // Enable search box in dropdown
                    showFlags: true,
                    showSelectedDialCode: true,
                    fullScreenOnMobile: false,
                };

                // On desktop, don't use dropdownContainer so it appends to body (no overflow)
                // On mobile, keep it in parent for modal compatibility
                if (!isDesktop || isInModal) {
                    options.dropdownContainer = input.parentNode;
                }

                const phoneInputInstance = window.intlTelInput(input, options);

                // Store instance
                window.phoneInputInstances.push(phoneInputInstance);

                // Store the first instance as the main phoneInput for validation
                if (index === 0 || !phoneInput) {
                    phoneInput = phoneInputInstance;
                }

                // Restrict phone input to numbers only
                input.addEventListener('input', (e) => {
                    // Remove any non-digit characters (spaces, dashes, parentheses, etc.)
                    const cleaned = e.target.value.replace(/[^\d]/g, '');
                    e.target.value = cleaned;
                    console.log('[Phone Input] Cleaned value:', cleaned);
                });

                // Prevent non-numeric keypress (except special keys)
                input.addEventListener('keypress', (e) => {
                    // Allow only digits (0-9) and special keys
                    if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                        e.preventDefault();
                    }
                });

                console.debug(`[Form] Phone input ${index + 1} initialized`);
            });

            console.debug('[Form] Phone input initialized');
        },

        setupEventListeners() {
            // Get all forms on the page (modal, sidebar, inline)
            const forms = utils.getElements('#wishup-form');
            
            forms.forEach(form => {
                // Form submission - pass the form element to handleSubmit
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSubmit(e.target);
                });

                // Service selection change - update button text for this specific form
                const serviceSelect = form.querySelector('#form-service');
                const submitBtn = form.querySelector('#submit-btn .btn-text');
                
                if (serviceSelect && submitBtn) {
                    serviceSelect.addEventListener('change', (e) => {
                        const service = e.target.value;
                        let text = 'Submit';
                        if (service === 'looking-job') {
                            text = 'Apply Now';
                        } else if (service === 'hire-va' || service === 'hire-bookkeeper') {
                            text = 'Get Free Consultation';
                        }
                        submitBtn.textContent = text;
                    });
                }
            });

            // Real-time validation on blur - for all inputs across all forms
            const inputs = ['form-name', 'form-email', 'form-phone', 'form-service'];
            inputs.forEach(id => {
                const inputElements = utils.getElements(`#${id}`);
                inputElements.forEach(input => {
                    input.addEventListener('blur', () => {
                        this.validateField(id);
                    });
                    
                    input.addEventListener('input', () => {
                        utils.clearError(id.replace('form-', ''));
                    });
                });
            });
        },

        validateField(fieldId) {
            const input = utils.getElement(`#${fieldId}`);
            if (!input) return;

            const field = fieldId.replace('form-', '');
            let value, error = null;

            // For phone field, get the actual input value without trimming
            // because intl-tel-input manages the input
            if (field === 'phone') {
                value = input.value; // Don't trim phone - may have formatting
                console.log('[validateField] Phone input value:', value);
            } else {
                value = input.value.trim();
            }

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

        async handleSubmit(formElement) {
            // Clear previous messages
            const messageEl = formElement.querySelector('#form-message');
            if (messageEl) messageEl.classList.remove('visible');

            // Get the raw phone input value from THIS form
            const phoneInputElement = formElement.querySelector('#form-phone');
            const rawPhoneValue = phoneInputElement ? phoneInputElement.value.trim() : '';
            
            console.log('[handleSubmit] Raw phone input value:', rawPhoneValue);
            console.log('[handleSubmit] Form element:', formElement);
            
            const nameValue = formElement.querySelector('#form-name').value.trim();
            const nameParts = nameValue.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Get phoneInput instance for this SPECIFIC form
            // CRITICAL: We must get the country from the phone input at submission time,
            // not at initialization, because the user may have changed the country dropdown
            let phoneInputInstance = null;
            if (phoneInputElement && window.phoneInputInstances && window.phoneInputInstances.length > 0) {
                // Find the instance that matches THIS form's phone input
                phoneInputInstance = window.phoneInputInstances.find(instance => 
                    instance && instance.telInput === phoneInputElement
                );
            }
            
            // Fallback to global phoneInput if we only have one instance
            if (!phoneInputInstance && phoneInput) {
                phoneInputInstance = phoneInput;
            }

            console.log('[handleSubmit] Phone instance found:', !!phoneInputInstance);
            console.log('[handleSubmit] Phone input element:', phoneInputElement);
            console.log('[handleSubmit] Total phone instances:', window.phoneInputInstances?.length || 0);
            
            // Get country data from phone input at submission time (captures user's selection)
            let phoneCountryData = { dialCode: '', iso2: '' };
            if (phoneInputInstance) {
                try {
                    phoneCountryData = phoneInputInstance.getSelectedCountryData();
                    console.log('[handleSubmit] Phone country data from instance:', phoneCountryData);
                } catch (e) {
                    console.error('[handleSubmit] Failed to get country data:', e);
                }
            } else {
                console.warn('[handleSubmit] No phone instance found - will use IP-detected country');
            }

            // Get form data from THIS form
            const formData = {
                service: formElement.querySelector('#form-service').value,
                name: nameValue,
                firstName: firstName,
                lastName: lastName,
                email: formElement.querySelector('#form-email').value.trim(),
                phone: rawPhoneValue, // Raw phone digits (e.g., 1234567890)
                phoneCountryCode: phoneCountryData.dialCode || '',
                phoneCountry: phoneCountryData.iso2 || '', // This captures the CURRENT selection at submit time
                experience: formElement.querySelector('#form-experience').value.trim(),
                country: LocationDetector.userCountry,
                isIndia: LocationDetector.isIndia,
                submittedAt: new Date().toISOString()
            };

            console.log('[handleSubmit] ===== FORM DATA DEBUG =====');
            console.log('[handleSubmit] Full formData:', formData);
            console.log('[handleSubmit] formData.phoneCountry (from dropdown):', formData.phoneCountry);
            console.log('[handleSubmit] formData.country (from LocationDetector):', formData.country);
            console.log('[handleSubmit] LocationDetector.userCountry:', LocationDetector.userCountry);
            console.log('[handleSubmit] phoneCountryData:', phoneCountryData);
            console.log('[handleSubmit] ===============================');

            // Validate - pass formElement to get correct phone input
            const errors = Validator.validateForm(formData, formElement);
            
            if (Object.keys(errors).length > 0) {
                // Show all errors in THIS form
                Object.keys(errors).forEach(field => {
                    const input = formElement.querySelector(`#form-${field}`);
                    const error = formElement.querySelector(`#form-${field}-error`);
                    
                    if (input) input.classList.add('error');
                    if (error) {
                        error.textContent = errors[field];
                        error.classList.add('visible');
                    }
                });
                
                // Focus first error field in THIS form
                const firstErrorField = Object.keys(errors)[0];
                const firstInput = formElement.querySelector(`#form-${firstErrorField}`);
                if (firstInput) firstInput.focus();
                return;
            }

            // Clear all errors in THIS form
            ['service', 'name', 'email', 'phone'].forEach(field => {
                const input = formElement.querySelector(`#form-${field}`);
                const error = formElement.querySelector(`#form-${field}-error`);
                
                if (input) input.classList.remove('error');
                if (error) {
                    error.textContent = '';
                    error.classList.remove('visible');
                }
            });

            // Show loading state
            const submitBtn = formElement.querySelector('#submit-btn');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            }

            // Submit to backend
            try {
                await this.submitToBackend(formData);
                
                // Show success message
                const messageEl = formElement.querySelector('#form-message');
                if (messageEl) {
                    messageEl.textContent = 'Thanks for your interest!';
                    messageEl.className = 'form-message visible success';
                }
            } catch (error) {
                console.error('Form submission error:', error);
                
                // Show error message
                const messageEl = formElement.querySelector('#form-message');
                if (messageEl) {
                    messageEl.textContent = 'An error occurred. Please try again.';
                    messageEl.className = 'form-message visible error';
                }
                
                // Hide loading
                if (submitBtn) {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }
                return;
            }

            // Track submission (if analytics is available)
            if (window.gtag) {
                window.gtag('event', 'form_submit', {
                    event_category: 'engagement',
                    event_label: formData.service
                });
            }

            // Construct phone number for Calendly (country code + phone, no + sign)
            // Example: +911234567890 becomes 911234567890
            let fullPhoneNumber = '';
            if (phoneInputInstance && phoneInputInstance.getNumber()) {
                // Remove the + sign from the international number
                fullPhoneNumber = phoneInputInstance.getNumber().replace(/\+/g, '');
            } else if (formData.phoneCountryCode && rawPhoneValue) {
                // Construct manually: country code + raw phone value (no + sign)
                fullPhoneNumber = `${formData.phoneCountryCode}${rawPhoneValue}`;
            } else {
                fullPhoneNumber = rawPhoneValue || '';
            }

            // Close modal after a short delay (allow success message to be seen)
            // Only close if form is inside a modal (not sidebar or inline forms)
            const formWrapper = formElement.closest('.wishup-application-form');
            const formMode = formWrapper ? formWrapper.getAttribute('data-form-mode') : null;
            const modal = formWrapper ? formWrapper.parentElement : null;
            
            // Only close if this is a modal form (not sidebar or inline)
            const isModalForm = formMode === 'modal' && modal && modal.classList.contains('form-modal');
            
            console.debug('[Form] Form mode:', formMode);
            console.debug('[Form] Is modal form:', isModalForm);
            console.debug('[Form] Modal element:', modal);
            
            setTimeout(() => {
                if (isModalForm && modal) {
                    console.debug('[Form] Closing modal now - Element ID:', modal.id);
                    
                    // Use ModalHandler.close() for consistent modal closing
                    ModalHandler.close();
                } else {
                    console.debug('[Form] Not a modal form - skipping modal close');
                }

                // Determine if Calendly should be opened (after modal closes)
                // Only show Calendly for hire-va or hire-bookkeeper services
                // AND only if user's actual LOCATION (from Cloudflare/IP detection) is in eligible countries
                // Note: We use LocationDetector.userCountry (IP-based), NOT phone selection
                const shouldShowCalendly = this.shouldShowCalendly(formData.service, LocationDetector.userCountry);
                
                if (shouldShowCalendly) {
                    // Open Calendly with form data (both desktop and mobile)
                    const calendlyUrl = this.getCalendlyUrl();
                    console.debug('[Form] Opening Calendly after submission');
                    console.debug('[Form] Service:', formData.service);
                    console.debug('[Form] User Location (Cloudflare):', LocationDetector.userCountry);
                    console.debug('[Form] Phone for Calendly (no +):', fullPhoneNumber);
                    
                    if (typeof window.openCalendly === 'function') {
                        window.openCalendly(calendlyUrl, {
                            name: formData.name,
                            email: formData.email,
                            phone: fullPhoneNumber // Pass phone without + sign
                        });
                    }
                } else {
                    console.debug('[Form] Calendly not shown - Service:', formData.service, 'User Location:', LocationDetector.userCountry);
                }
            }, 800); // 800ms delay to show success message

            // Reset form and hide loading after short delay
            setTimeout(() => {
                // Hide loading
                if (submitBtn) {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }
                formElement.reset();
                
                // Reset phone input for this form
                if (phoneInputInstance) {
                    phoneInputInstance.setNumber('');
                }
                
                // Reset default service for all forms
                LocationDetector.setDefaultService();
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

        shouldShowCalendly(service, userLocation) {
            // Don't show Calendly for job applications
            if (service === 'looking-job') {
                return false;
            }

            // Only show Calendly for hire-va and hire-bookkeeper
            if (service !== 'hire-va' && service !== 'hire-bookkeeper') {
                return false;
            }

            // Check if user's actual location (from Cloudflare/IP) is in eligible list
            // Note: This is based on geolocation, not phone number country selection
            if (!userLocation) {
                console.warn('[Calendly] No location detected, not showing Calendly');
                return false;
            }

            // Convert location to lowercase for comparison
            const locationLower = userLocation.toLowerCase();
            const isEligible = CONFIG.calendlyEligibleCountries.includes(locationLower);
            
            console.debug('[Calendly] User Location:', locationLower, 'Eligible:', isEligible);
            
            return isEligible;
        },

        getVisitHistory() {
            try {
                const visitHistoryData = localStorage.getItem('ghost-history');
                if (!visitHistoryData) return [];

                const parsedHistory = JSON.parse(visitHistoryData);
                const origin = window?.location?.origin || '';

                // Format history to match expected structure
                // localStorage format: { path, time, referrerSource, referrerMedium, referrerUrl }
                // API format: { page, timestamp, referrerSource, referrerMedium, referrerUrl }
                return parsedHistory.map(item => ({
                    page: item.path ? `${origin}${item.path}` : (item.url || item.page || ''),
                    timestamp: item.time ? new Date(item.time).toISOString() : (item.timestamp || new Date().toISOString()),
                    referrerMedium: item.referrerMedium || null,
                    referrerUrl: item.referrerUrl || null,
                    referrerSource: item.referrerSource || null
                }));
            } catch (error) {
                console.error('Error parsing visit history:', error);
                return [];
            }
        },

        getLeadCategory(service) {
            const categoryMap = {
                'hire-va': 'Hire a Virtual Assistant',
                'hire-bookkeeper': 'Hire a Bookkeeper',
                'looking-job': "I'm looking for a job"
            };
            return categoryMap[service] || service;
        },

        getVaOrClient(service) {
            // For both hire-va and hire-bookkeeper, return "I want to hire a Virtual Assistant"
            // For looking-job, return "I'm looking for a job"
            if (service === 'hire-va' || service === 'hire-bookkeeper') {
                return 'I want to hire a Virtual Assistant';
            } else if (service === 'looking-job') {
                return "I want to work as a Virtual Assistant";
            }
            return 'I want to hire a Virtual Assistant'; // Default
        },

        async getUserIP() {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                return data.ip || '';
            } catch (error) {
                console.error('Error fetching IP:', error);
                return '';
            }
        },

        async submitToBackend(formData) {
            const apiEndpoint = 'https://app-dev.wishup.co/api/public/lead/create';
            
            try {
                // Get user IP
                const userIP = await this.getUserIP();

                // Get visit history
                const pageVisits = this.getVisitHistory();

                // Map service to lead category
                const leadCategory = this.getLeadCategory(formData.service);
                
                // Map service to va_or_client field
                const vaOrClient = this.getVaOrClient(formData.service);

                // Get country code: Use phone input selected country if user changed it, otherwise use IP-detected country
                let countryCode = null;
                
                console.log('[API] ===== COUNTRY CODE DEBUG =====');
                console.log('[API] formData.phoneCountry:', formData.phoneCountry);
                console.log('[API] formData.phoneCountry type:', typeof formData.phoneCountry);
                console.log('[API] formData.phoneCountry.trim():', formData.phoneCountry ? formData.phoneCountry.trim() : 'N/A');
                console.log('[API] formData.country:', formData.country);
                console.log('[API] formData.country type:', typeof formData.country);
                console.log('[API] LocationDetector.userCountry:', LocationDetector.userCountry);
                
                if (formData.phoneCountry && formData.phoneCountry.trim() !== '') {
                    // User selected a country in phone input - use that (already lowercase ISO2 like 'us', 'in', 'au')
                    countryCode = formData.phoneCountry.toLowerCase();
                    console.log('[API] Using phoneCountry (user selected):', countryCode);
                } else if (formData.country) {
                    // Use IP-detected country from Cloudflare trace (uppercase like 'US', 'IN' - convert to lowercase)
                    countryCode = formData.country.toLowerCase();
                    console.log('[API] Using formData.country (IP-detected):', countryCode);
                } else {
                    console.log('[API] No country available - countryCode will be null');
                }

                console.log('[API] Final countryCode:', countryCode);
                console.log('[API] ================================');

                // Get phone number - remove + sign but keep country code digits
                let phoneNumber = null;
                if (formData.phone && formData.phone.trim() !== '') {
                    // Remove + sign, spaces, dashes, parentheses - keep only digits
                    phoneNumber = formData.phone.replace(/[\+\s\-\(\)]/g, '');
                    // If after cleaning it's empty, set to null
                    if (!phoneNumber || phoneNumber.length === 0) {
                        phoneNumber = null;
                    }
                }

                console.log('[API Payload Debug]');
                console.log('- formData.phone:', formData.phone);
                console.log('- Cleaned phoneNumber (no +):', phoneNumber);
                console.log('- countryCode:', countryCode);

                // Prepare payload matching the expected format exactly
                const payload = {
                    first_name: formData.firstName || null,
                    last_name: formData.lastName || null,
                    lead_category: leadCategory || null,
                    email: formData.email || null,
                    va_or_client: vaOrClient || null,
                    phone: phoneNumber,
                    tell_us_more: formData.experience || null,
                    country_code: countryCode,
                    triggerSource: window.location.href || null,
                    lead_title: "N.A",
                    whatsapp_consent: false,
                    source: window.location.href || null,
                    page_visits: pageVisits || [],
                    ip: userIP || null
                };

                console.log('[API] Full payload:', JSON.stringify(payload, null, 2));

                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Form submitted successfully:', result);
                
                utils.showMessage('Thanks for your interest!', 'success');
                return result;
            } catch (error) {
                console.error('API submission failed:', error);
                throw error;
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

            // Handle mobile floating button trigger
            const mobileTrigger = utils.getElement('#mobile-form-trigger');
            if (mobileTrigger) {
                console.debug('[Modal] Mobile trigger button found, attaching click handler');
                mobileTrigger.addEventListener('click', () => {
                    console.debug('[Modal] Mobile trigger clicked, opening modal');
                    this.open();
                });
            } else {
                console.warn('[Modal] Mobile trigger button not found');
            }

            // Handle mobile consultation button (new site-wide button)
            const mobileConsultationTrigger = utils.getElement('#mobile-consultation-trigger');
            if (mobileConsultationTrigger) {
                console.debug('[Modal] Mobile consultation trigger found, attaching click handler');
                mobileConsultationTrigger.addEventListener('click', () => {
                    console.debug('[Modal] Mobile consultation trigger clicked, opening modal');
                    this.open();
                });
            }

            // Handle close button in modal
            const closeBtn = utils.getElement('#form-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }

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

                // Add close button if not exists (legacy support)
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
            console.debug('[Modal] Opening modal, modal element found:', !!modal);
            if (modal) {
                // Remove inline display: none and set display: flex
                modal.style.display = 'flex';
                // Clear any inline opacity set during close
                modal.style.opacity = '';
                // Trigger opacity transition after display change
                requestAnimationFrame(() => {
                    modal.classList.add('active');
                });
                document.body.style.overflow = 'hidden';
                console.debug('[Modal] Modal opened, active class added');
            } else {
                console.error('[Modal] Modal element not found');
            }
        },

        close() {
            const modal = utils.getElement('.form-modal');
            console.debug('[Modal] Closing modal');
            if (modal) {
                modal.classList.remove('active');
                // Wait for transition before hiding
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300); // Match CSS transition duration
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
