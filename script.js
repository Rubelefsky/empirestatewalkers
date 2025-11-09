// Empire State Walkers - Website JavaScript
class EmpireStateWalkers {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthState();
        this.setupEventListeners();
        this.setMinimumDate();
        this.initializeNavigation();
        this.updateUIBasedOnAuth();
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

        // Authentication
        this.setupAuthEventListeners();
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
            // If user is logged in, save the booking
            if (this.currentUser) {
                const booking = {
                    id: Date.now().toString(),
                    ...bookingData,
                    createdAt: new Date().toISOString()
                };

                // Get users from localStorage
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const userIndex = users.findIndex(u => u.id === this.currentUser.id);

                if (userIndex !== -1) {
                    if (!users[userIndex].bookings) {
                        users[userIndex].bookings = [];
                    }
                    users[userIndex].bookings.push(booking);
                    localStorage.setItem('users', JSON.stringify(users));

                    // Update current user
                    this.currentUser = users[userIndex];
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                }

                this.showSuccessMessage('Booking created successfully! View it in your dashboard.');
                document.getElementById('booking-form').reset();
                this.hideFormLoading('booking-form');

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    this.showDashboard();
                }, 2000);
            } else {
                this.showSuccessMessage('Thank you for your booking request! I\'ll confirm your appointment within 2 hours during business hours.');
                document.getElementById('booking-form').reset();
                this.hideFormLoading('booking-form');
            }

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

    // Authentication Methods
    checkAuthState() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
        }
    }

    updateUIBasedOnAuth() {
        const isLoggedIn = this.currentUser !== null;

        // Desktop navigation
        const loginBtn = document.getElementById('login-btn');
        const bookNowBtn = document.getElementById('book-now-btn');
        const dashboardLink = document.getElementById('dashboard-link');
        const logoutBtn = document.getElementById('logout-btn');
        const userGreeting = document.getElementById('user-greeting');

        // Mobile navigation
        const mobileLoginBtn = document.getElementById('mobile-login-btn');
        const mobileBookNowBtn = document.getElementById('mobile-book-now-btn');
        const mobileDashboardLink = document.getElementById('mobile-dashboard-link');
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

        if (isLoggedIn) {
            // Hide login/book now buttons
            if (loginBtn) loginBtn.classList.add('hidden');
            if (bookNowBtn) bookNowBtn.classList.add('hidden');
            if (mobileLoginBtn) mobileLoginBtn.classList.add('hidden');
            if (mobileBookNowBtn) mobileBookNowBtn.classList.add('hidden');

            // Show dashboard/logout buttons
            if (dashboardLink) dashboardLink.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (userGreeting) {
                userGreeting.classList.remove('hidden');
                userGreeting.textContent = `Hi, ${this.currentUser.name.split(' ')[0]}`;
            }
            if (mobileDashboardLink) mobileDashboardLink.classList.remove('hidden');
            if (mobileLogoutBtn) mobileLogoutBtn.classList.remove('hidden');

            // Update dashboard
            this.updateDashboard();
        } else {
            // Show login/book now buttons
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (bookNowBtn) bookNowBtn.classList.remove('hidden');
            if (mobileLoginBtn) mobileLoginBtn.classList.remove('hidden');
            if (mobileBookNowBtn) mobileBookNowBtn.classList.remove('hidden');

            // Hide dashboard/logout buttons
            if (dashboardLink) dashboardLink.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
            if (userGreeting) userGreeting.classList.add('hidden');
            if (mobileDashboardLink) mobileDashboardLink.classList.add('hidden');
            if (mobileLogoutBtn) mobileLogoutBtn.classList.add('hidden');

            // Hide dashboard section
            const dashboardSection = document.getElementById('dashboard');
            if (dashboardSection) dashboardSection.classList.add('hidden');
        }
    }

    setupAuthEventListeners() {
        // Login button
        const loginBtn = document.getElementById('login-btn');
        const mobileLoginBtn = document.getElementById('mobile-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }
        if (mobileLoginBtn) {
            mobileLoginBtn.addEventListener('click', () => this.showLoginModal());
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Modal close buttons
        const closeLoginModal = document.getElementById('close-login-modal');
        const closeRegisterModal = document.getElementById('close-register-modal');
        if (closeLoginModal) {
            closeLoginModal.addEventListener('click', () => this.hideLoginModal());
        }
        if (closeRegisterModal) {
            closeRegisterModal.addEventListener('click', () => this.hideRegisterModal());
        }

        // Switch between login and register
        const showRegisterModal = document.getElementById('show-register-modal');
        const showLoginModal = document.getElementById('show-login-modal');
        if (showRegisterModal) {
            showRegisterModal.addEventListener('click', () => {
                this.hideLoginModal();
                this.showRegisterModal();
            });
        }
        if (showLoginModal) {
            showLoginModal.addEventListener('click', () => {
                this.hideRegisterModal();
                this.showLoginModal();
            });
        }

        // Close modal on outside click
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        if (loginModal) {
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) {
                    this.hideLoginModal();
                }
            });
        }
        if (registerModal) {
            registerModal.addEventListener('click', (e) => {
                if (e.target === registerModal) {
                    this.hideRegisterModal();
                }
            });
        }

        // Dashboard link
        const dashboardLink = document.getElementById('dashboard-link');
        const mobileDashboardLink = document.getElementById('mobile-dashboard-link');
        if (dashboardLink) {
            dashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboard();
            });
        }
        if (mobileDashboardLink) {
            mobileDashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboard();
            });
        }

        // View bookings button
        const viewBookingsBtn = document.getElementById('view-bookings-btn');
        if (viewBookingsBtn) {
            viewBookingsBtn.addEventListener('click', () => {
                this.renderBookings();
            });
        }
    }

    showLoginModal() {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.classList.remove('hidden');
        }
    }

    hideLoginModal() {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.classList.add('hidden');
        }
    }

    showRegisterModal() {
        const registerModal = document.getElementById('register-modal');
        if (registerModal) {
            registerModal.classList.remove('hidden');
        }
    }

    hideRegisterModal() {
        const registerModal = document.getElementById('register-modal');
        if (registerModal) {
            registerModal.classList.add('hidden');
        }
    }

    handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Login successful
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.hideLoginModal();
            this.showSuccessMessage('Login successful! Welcome back.');
            this.updateUIBasedOnAuth();

            // Reset form
            document.getElementById('login-form').reset();
        } else {
            // Login failed
            this.showErrorMessage('Invalid email or password. Please try again.');
        }
    }

    handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            this.showErrorMessage('Passwords do not match. Please try again.');
            return;
        }

        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
            this.showErrorMessage('An account with this email already exists.');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            password,
            memberSince: new Date().toISOString(),
            bookings: []
        };

        // Save to localStorage
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Auto-login
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        this.hideRegisterModal();
        this.showSuccessMessage('Account created successfully! Welcome to Empire State Walkers.');
        this.updateUIBasedOnAuth();

        // Reset form
        document.getElementById('register-form').reset();
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUIBasedOnAuth();
        this.showSuccessMessage('Logged out successfully. See you soon!');

        // Redirect to home
        window.location.hash = '#home';
    }

    showDashboard() {
        // Hide all other sections
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            if (section.id !== 'dashboard') {
                section.style.display = 'none';
            }
        });

        // Show dashboard
        const dashboardSection = document.getElementById('dashboard');
        if (dashboardSection) {
            dashboardSection.classList.remove('hidden');
            dashboardSection.style.display = 'block';
        }

        // Update dashboard content
        this.updateDashboard();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateDashboard() {
        if (!this.currentUser) return;

        // Update user name
        const dashboardUserName = document.getElementById('dashboard-user-name');
        if (dashboardUserName) {
            dashboardUserName.textContent = this.currentUser.name.split(' ')[0];
        }

        // Update email
        const dashboardEmail = document.getElementById('dashboard-email');
        if (dashboardEmail) {
            dashboardEmail.textContent = this.currentUser.email;
        }

        // Update member since
        const dashboardMemberSince = document.getElementById('dashboard-member-since');
        if (dashboardMemberSince) {
            const date = new Date(this.currentUser.memberSince);
            dashboardMemberSince.textContent = date.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        }

        // Update total bookings
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUserData = users.find(u => u.id === this.currentUser.id);
        const bookings = currentUserData?.bookings || [];

        const dashboardTotalBookings = document.getElementById('dashboard-total-bookings');
        if (dashboardTotalBookings) {
            dashboardTotalBookings.textContent = bookings.length;
        }

        // Render bookings
        this.renderBookings();
    }

    renderBookings() {
        if (!this.currentUser) return;

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUserData = users.find(u => u.id === this.currentUser.id);
        const bookings = currentUserData?.bookings || [];

        const bookingsList = document.getElementById('bookings-list');
        if (!bookingsList) return;

        if (bookings.length === 0) {
            bookingsList.innerHTML = '<p class="text-gray-500 text-center py-8">No bookings yet. Book your first walk!</p>';
            return;
        }

        // Sort bookings by date (newest first)
        bookings.sort((a, b) => new Date(b.date) - new Date(a.date));

        bookingsList.innerHTML = bookings.map(booking => `
            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="text-lg font-semibold text-gray-800">${booking.dogName}</h4>
                        <p class="text-gray-600">${booking.service}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getBookingStatusClass(booking.date)}">
                        ${this.getBookingStatus(booking.date)}
                    </span>
                </div>
                <div class="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-sm text-gray-600">Date</p>
                        <p class="font-medium">${new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Time</p>
                        <p class="font-medium">${this.formatTimeSlot(booking.time)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Address</p>
                        <p class="font-medium">${booking.address}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Phone</p>
                        <p class="font-medium">${booking.ownerPhone}</p>
                    </div>
                </div>
                ${booking.instructions ? `
                    <div class="mb-4">
                        <p class="text-sm text-gray-600">Special Instructions</p>
                        <p class="text-gray-800">${booking.instructions}</p>
                    </div>
                ` : ''}
                <div class="flex space-x-2">
                    <button onclick="app.cancelBooking('${booking.id}')" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300">
                        <i class="fas fa-times mr-2"></i>Cancel Booking
                    </button>
                </div>
            </div>
        `).join('');
    }

    getBookingStatus(date) {
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (bookingDate < today) {
            return 'Completed';
        } else if (bookingDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else {
            return 'Upcoming';
        }
    }

    getBookingStatusClass(date) {
        const status = this.getBookingStatus(date);
        switch (status) {
            case 'Completed':
                return 'bg-gray-200 text-gray-700';
            case 'Today':
                return 'bg-green-100 text-green-700';
            case 'Upcoming':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-200 text-gray-700';
        }
    }

    formatTimeSlot(time) {
        switch (time) {
            case 'morning':
                return 'Morning (7am-11am)';
            case 'afternoon':
                return 'Afternoon (12pm-4pm)';
            case 'evening':
                return 'Evening (5pm-8pm)';
            default:
                return time;
        }
    }

    cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);

        if (userIndex !== -1) {
            users[userIndex].bookings = users[userIndex].bookings.filter(b => b.id !== bookingId);
            localStorage.setItem('users', JSON.stringify(users));

            // Update current user
            this.currentUser = users[userIndex];
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            this.showSuccessMessage('Booking cancelled successfully.');
            this.updateDashboard();
        }
    }

    showErrorMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
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
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EmpireStateWalkers();
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
