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

                // Keep dropdown inside the input group (default behavior).
                // No portal/append-to-body: we'll ensure the modal doesn't clip it via CSS.
                const isInModal = !!input.closest('.form-modal');

                const phoneInputInstance = window.intlTelInput(input, {
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
                    // Force dropdown to stay within the input's parent (form group)
                    // and avoid library defaulting to body/fullscreen on mobile
                    dropdownContainer: input.parentNode,
                    fullScreenOnMobile: false,
                });

                // No extra positioning required when not appending to body

                // Desktop fullscreen enhancement: when opening dropdown on large screens,
                // convert inline dropdown to fullscreen style without inline top/left.
                // Leave mobile (< 969px) behavior untouched.
                const DESKTOP_BREAKPOINT = 969;
                const enableDesktopFullscreen = () => {
                    if (window.innerWidth < DESKTOP_BREAKPOINT) return; // only desktop
                    const itiRoot = input.closest('.iti');
                    if (!itiRoot) return;
                    const list = itiRoot.querySelector('.iti__country-list');
                    if (!list) return;
                    // Add fullscreen classes
                    itiRoot.classList.add('iti--fullscreen-popup');
                    list.classList.add('iti__country-list--fullscreen');
                    // Remove inline positioning the library may have applied
                    list.style.top = '';
                    list.style.left = '';
                    list.style.right = '';
                    list.style.bottom = '';
                    // Prevent body scroll while list is open
                    document.body.style.overflow = 'hidden';
                };
                const disableDesktopFullscreen = () => {
                    if (window.innerWidth < DESKTOP_BREAKPOINT) return; // only desktop cleanup
                    const itiRoot = input.closest('.iti');
                    if (!itiRoot) return;
                    const list = itiRoot.querySelector('.iti__country-list');
                    if (list) {
                        list.classList.remove('iti__country-list--fullscreen');
                        // Inline styles already cleared; not re-adding.
                    }
                    itiRoot.classList.remove('iti--fullscreen-popup');
                    document.body.style.overflow = '';
                };
                // Attach intl-tel-input custom events
                input.addEventListener('open:countrydropdown', enableDesktopFullscreen);
                input.addEventListener('close:countrydropdown', disableDesktopFullscreen);
                // Also defensive: on resize while open, re-evaluate
                window.addEventListener('resize', () => {
                    const itiRoot = input.closest('.iti');
                    const list = itiRoot?.querySelector('.iti__country-list');
                    if (!list) return;
                    const isFullscreen = list.classList.contains('iti__country-list--fullscreen');
                    if (window.innerWidth < DESKTOP_BREAKPOINT && isFullscreen) {
                        // Drop back to inline if shrinking to mobile width
                        disableDesktopFullscreen();
                    }
                });

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

            // Get phoneInput instance for this form
            const phoneInputInstance = phoneInputElement && window.phoneInputInstances ? 
                window.phoneInputInstances.find(instance => instance.telInput === phoneInputElement) : 
                phoneInput;

            // Get form data from THIS form
            const formData = {
                service: formElement.querySelector('#form-service').value,
                name: nameValue,
                firstName: firstName,
                lastName: lastName,
                email: formElement.querySelector('#form-email').value.trim(),
                phone: rawPhoneValue, // Raw phone digits (e.g., 1234567890)
                phoneCountryCode: phoneInputInstance ? phoneInputInstance.getSelectedCountryData().dialCode : '',
                phoneCountry: phoneInputInstance ? phoneInputInstance.getSelectedCountryData().iso2 : '',
                experience: formElement.querySelector('#form-experience').value.trim(),
                country: LocationDetector.userCountry,
                isIndia: LocationDetector.isIndia,
                submittedAt: new Date().toISOString()
            };

            console.log('[handleSubmit] Full formData:', formData);

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
                    messageEl.textContent = 'Form submitted successfully!';
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

            // Open Calendly with form data (both desktop and mobile)
            const calendlyUrl = this.getCalendlyUrl();
            console.debug('[Form] Opening Calendly after submission');
            console.debug('[Form] Phone for Calendly (no +):', fullPhoneNumber);
            
            if (typeof window.openCalendly === 'function') {
                window.openCalendly(calendlyUrl, {
                    name: formData.name,
                    email: formData.email,
                    phone: fullPhoneNumber // Pass phone without + sign
                });
            }

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
                
                // Close modal if this form is in a modal
                const modal = formElement.closest('.form-modal');
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

        getVisitHistory() {
            try {
                const visitHistoryData = localStorage.getItem('ghost-history');
                if (!visitHistoryData) return [];

                const parsedHistory = JSON.parse(visitHistoryData);
                const origin = window?.location?.origin || '';

                // Format history to match expected structure
                return parsedHistory.map(item => ({
                    page: item.url || item.page || '',
                    timestamp: item.timestamp || new Date().toISOString(),
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

                // Get country code in lowercase
                const countryCode = formData.phoneCountry ? formData.phoneCountry.toLowerCase() : null;

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
                    va_or_client: leadCategory || null,
                    phone: phoneNumber,
                    tell_us_more: formData.experience || null,
                    country_code: countryCode,
                    triggerSource: 'Blogs',
                    lead_title: null,
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
                
                utils.showMessage('Form submitted successfully!', 'success');
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
