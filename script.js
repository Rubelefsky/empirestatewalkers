// Empire State Walkers - Website JavaScript
class EmpireStateWalkers {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setMinimumDate();
        this.initializeNavigation();
    }

    setupEventListeners() {
        // Mobile menu toggle
        this.setupMobileMenu();
        
        // Smooth scrolling
        this.setupSmoothScrolling();
        
        // Form submissions
        this.setupForms();
        
        // Navigation highlighting
        this.setupNavigationHighlighting();
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                
                // Toggle hamburger icon
                const icon = mobileMenuBtn.querySelector('i');
                if (mobileMenu.classList.contains('hidden')) {
                    icon.className = 'fas fa-bars text-xl';
                } else {
                    icon.className = 'fas fa-times text-xl';
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.className = 'fas fa-bars text-xl';
                }
            });
        }
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    const offset = 80; // Account for fixed header
                    const targetPosition = target.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    const mobileMenu = document.getElementById('mobile-menu');
                    if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
                        if (mobileMenuBtn) {
                            const icon = mobileMenuBtn.querySelector('i');
                            icon.className = 'fas fa-bars text-xl';
                        }
                    }
                }
            });
        });
    }

    setupForms() {
        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Booking form
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => this.handleBookingForm(e));
        }

        // Add real-time validation
        this.setupFormValidation();
    }

    setupFormValidation() {
        // Email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateEmail(input));
        });

        // Phone validation
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('blur', () => this.validatePhone(input));
        });

        // Required field validation
        const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateRequired(input));
        });
    }

    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(input.value);
        
        if (input.value && !isValid) {
            this.showFieldError(input, 'Please enter a valid email address');
        } else {
            this.clearFieldError(input);
        }
        
        return isValid;
    }

    validatePhone(input) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = input.value.replace(/\D/g, '');
        const isValid = cleanPhone.length >= 10;
        
        if (input.value && !isValid) {
            this.showFieldError(input, 'Please enter a valid phone number');
        } else {
            this.clearFieldError(input);
        }
        
        return isValid;
    }

    validateRequired(input) {
        const isValid = input.value.trim() !== '';
        
        if (!isValid) {
            this.showFieldError(input, 'This field is required');
        } else {
            this.clearFieldError(input);
        }
        
        return isValid;
    }

    showFieldError(input, message) {
        input.classList.add('border-red-500', 'bg-red-50');
        input.classList.remove('border-green-500', 'bg-green-50');
        
        // Remove existing error message
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-500 text-sm mt-1';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }

    clearFieldError(input) {
        input.classList.remove('border-red-500', 'bg-red-50');
        input.classList.add('border-green-500', 'bg-green-50');
        
        const errorMessage = input.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    handleContactForm(e) {
        e.preventDefault();
        
        const formData = this.getFormData('contact-form');
        
        // Validate form
        if (!this.validateContactForm(formData)) {
            return;
        }
        
        // Show loading state
        this.showFormLoading('contact-form');
        
        // Simulate API call
        setTimeout(() => {
            this.showSuccessMessage('Thank you for your message! I\'ll get back to you within 2 hours.');
            document.getElementById('contact-form').reset();
            this.hideFormLoading('contact-form');
            
            // In a real application, you would send this data to your server
            console.log('Contact form data:', formData);
        }, 1000);
    }

    handleBookingForm(e) {
        e.preventDefault();
        
        const bookingData = this.getBookingFormData();
        
        // Validate form
        if (!this.validateBookingForm(bookingData)) {
            return;
        }
        
        // Show loading state
        this.showFormLoading('booking-form');
        
        // Simulate API call
        setTimeout(() => {
            this.showSuccessMessage('Thank you for your booking request! I\'ll confirm your appointment within 2 hours during business hours.');
            document.getElementById('booking-form').reset();
            this.hideFormLoading('booking-form');
            
            // In a real application, you would send this data to your server
            console.log('Booking form data:', bookingData);
        }, 1000);
    }

    getFormData(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to regular object
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Manual field extraction for contact form
        if (formId === 'contact-form') {
            data.firstName = document.getElementById('firstName').value;
            data.lastName = document.getElementById('lastName').value;
            data.email = document.getElementById('email').value;
            data.phone = document.getElementById('phone').value;
            data.service = document.getElementById('service').value;
            data.message = document.getElementById('message').value;
        }
        
        return data;
    }

    getBookingFormData() {
        return {
            ownerName: document.getElementById('ownerName').value,
            ownerPhone: document.getElementById('ownerPhone').value,
            dogName: document.getElementById('dogName').value,
            dogBreed: document.getElementById('dogBreed').value,
            service: document.getElementById('bookingService').value,
            date: document.getElementById('preferredDate').value,
            time: document.getElementById('preferredTime').value,
            address: document.getElementById('address').value,
            instructions: document.getElementById('instructions').value,
            terms: document.getElementById('terms').checked
        };
    }

    validateContactForm(data) {
        let isValid = true;
        
        // Required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'message'];
        requiredFields.forEach(field => {
            if (!data[field] || data[field].trim() === '') {
                const input = document.getElementById(field);
                this.showFieldError(input, 'This field is required');
                isValid = false;
            }
        });
        
        // Email validation
        if (data.email && !this.validateEmail(document.getElementById('email'))) {
            isValid = false;
        }
        
        return isValid;
    }

    validateBookingForm(data) {
        let isValid = true;
        
        // Required fields
        const requiredFields = ['ownerName', 'ownerPhone', 'dogName', 'service', 'date', 'time', 'address'];
        requiredFields.forEach(field => {
            if (!data[field] || data[field].trim() === '') {
                const input = document.getElementById(field === 'service' ? 'bookingService' : field);
                this.showFieldError(input, 'This field is required');
                isValid = false;
            }
        });
        
        // Terms checkbox
        if (!data.terms) {
            const checkbox = document.getElementById('terms');
            this.showFieldError(checkbox, 'You must agree to the terms and conditions');
            isValid = false;
        }
        
        // Phone validation
        if (data.ownerPhone && !this.validatePhone(document.getElementById('ownerPhone'))) {
            isValid = false;
        }
        
        // Date validation (must be today or future)
        if (data.date) {
            const selectedDate = new Date(data.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                const input = document.getElementById('preferredDate');
                this.showFieldError(input, 'Please select today or a future date');
                isValid = false;
            }
        }
        
        return isValid;
    }

    showFormLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
            submitBtn.classList.add('opacity-75');
        }
    }

    hideFormLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75');
            
            // Restore original text
            if (formId === 'contact-form') {
                submitBtn.textContent = 'Send Message';
            } else if (formId === 'booking-form') {
                submitBtn.textContent = 'Submit Booking Request';
            }
        }
    }

    showSuccessMessage(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    setMinimumDate() {
        const dateInput = document.getElementById('preferredDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }
    }

    setupNavigationHighlighting() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        
        const highlightNavigation = () => {
            let current = '';
            const scrollY = window.scrollY;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.clientHeight;
                
                if (scrollY >= sectionTop && scrollY <= sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('text-primary', 'font-semibold');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('text-primary', 'font-semibold');
                }
            });
        };

        // Throttle scroll events for better performance
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(highlightNavigation, 10);
        });
    }

    initializeNavigation() {
        // Add scroll behavior for header
        let lastScrollTop = 0;
        const header = document.querySelector('nav');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, false);
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmpireStateWalkers();
});

// Add some additional utility functions
window.EmpireStateWalkers = {
    // Public API for potential integrations
    scrollToSection: (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },
    
    openBookingForm: () => {
        window.EmpireStateWalkers.scrollToSection('booking');
    },
    
    openContactForm: () => {
        window.EmpireStateWalkers.scrollToSection('contact');
    }
};
