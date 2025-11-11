// Empire State Walkers - Frontend with API Integration
// Replace script.js with this file or rename to script.js when backend is running

const API_URL = 'http://localhost:5001/api';

class EmpireStateWalkers {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthState();
        this.setupEventListeners();
        this.updateUIBasedOnAuth();
    }

    setupEventListeners() {
        // Forms
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Authentication
        this.setupAuthEventListeners();
    }

    checkAuthState() {
        const user = localStorage.getItem('currentUser');

        if (user) {
            this.currentUser = JSON.parse(user);
            this.validateToken();
        }
    }

    async validateToken() {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include' // Send cookies with request
            });

            if (!response.ok) {
                // Token is invalid, clear auth
                this.handleLogout();
            } else {
                const data = await response.json();
                this.currentUser = data.data;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
        } catch (error) {
            console.error('Token validation error:', error);
            this.handleLogout();
        }
    }

    updateUIBasedOnAuth() {
        const isLoggedIn = this.currentUser !== null;

        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const dashboardLink = document.getElementById('dashboard-link');

        if (isLoggedIn) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (dashboardLink) dashboardLink.classList.remove('hidden');
            this.updateDashboard();
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
            if (dashboardLink) dashboardLink.classList.add('hidden');

            const dashboardSection = document.getElementById('dashboard');
            if (dashboardSection) dashboardSection.classList.add('hidden');
        }
    }

    setupAuthEventListeners() {
        // Login button
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
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
        if (dashboardLink) {
            dashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboard();
            });
        }
    }

    async handleContactForm(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        // Simple validation
        if (!name || !email || !message) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ name, email, phone, message })
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);
                document.getElementById('contact-form').reset();
            } else {
                alert('Error sending message: ' + data.message);
            }
        } catch (error) {
            console.error('Contact form error:', error);
            alert('Error sending message. Please try again later.');
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

    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Send and receive cookies
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.data;
                localStorage.setItem('currentUser', JSON.stringify(data.data));

                this.hideLoginModal();
                alert('Login successful!');
                this.updateUIBasedOnAuth();
                document.getElementById('login-form').reset();
            } else {
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login error. Please try again.');
        }
    }

    async handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            alert('Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Send and receive cookies
                body: JSON.stringify({ name, email, phone, password })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.data;
                localStorage.setItem('currentUser', JSON.stringify(data.data));

                this.hideRegisterModal();
                alert('Account created successfully!');
                this.updateUIBasedOnAuth();
                document.getElementById('register-form').reset();
            } else {
                // Display detailed error messages
                let errorMessage = data.message;
                if (data.errors && data.errors.length > 0) {
                    errorMessage = data.errors.map(err => `${err.field}: ${err.message}`).join('\n');
                }
                alert('Registration failed:\n' + errorMessage);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration error. Please make sure the backend server is running and try again.');
        }
    }

    async handleLogout() {
        try {
            // Call logout endpoint to clear cookie
            await fetch(`${API_URL}/auth/logout`, {
                method: 'GET',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        // Clear local state
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUIBasedOnAuth();
        alert('Logged out successfully.');
        window.location.hash = '#home';
    }

    showDashboard() {
        // Hide all sections
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

        this.updateDashboard();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async updateDashboard() {
        if (!this.currentUser || !this.token) return;

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

        // Fetch and render bookings
        await this.fetchAndRenderBookings();
    }

    async fetchAndRenderBookings() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(`${API_URL}/bookings`, {
                credentials: 'include' // Send cookies with request
            });

            const data = await response.json();

            if (data.success) {
                const bookings = data.data;

                // Update total bookings
                const dashboardTotalBookings = document.getElementById('dashboard-total-bookings');
                if (dashboardTotalBookings) {
                    dashboardTotalBookings.textContent = bookings.length;
                }

                // Render bookings
                this.renderBookings(bookings);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    }

    renderBookings(bookings) {
        const bookingsList = document.getElementById('bookings-list');
        if (!bookingsList) return;

        // Clear existing content
        bookingsList.innerHTML = '';

        if (bookings.length === 0) {
            const emptyState = document.createElement('p');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No bookings yet';
            bookingsList.appendChild(emptyState);
            return;
        }

        // Create booking elements using DOM manipulation to prevent XSS
        bookings.forEach(booking => {
            const bookingDiv = document.createElement('div');
            bookingDiv.style.cssText = 'border: 1px solid #000; padding: 16px; margin-bottom: 16px;';

            // Dog name and service row
            const headerDiv = document.createElement('div');
            headerDiv.style.marginBottom = '8px';

            const dogNameStrong = document.createElement('strong');
            dogNameStrong.textContent = booking.dogName; // Safe: textContent auto-escapes

            const serviceSpan = document.createElement('span');
            serviceSpan.style.color = '#808080';
            serviceSpan.textContent = ' — ' + booking.service; // Safe: textContent auto-escapes

            headerDiv.appendChild(dogNameStrong);
            headerDiv.appendChild(serviceSpan);

            // Date and time row
            const dateDiv = document.createElement('div');
            dateDiv.style.cssText = 'font-size: 14px; color: #808080;';
            dateDiv.textContent = new Date(booking.date).toLocaleDateString() + ' at ' + booking.time;

            // Status row
            const statusDiv = document.createElement('div');
            statusDiv.style.cssText = 'font-size: 14px; margin-top: 4px;';

            const statusLabel = document.createTextNode('Status: ');
            const statusSpan = document.createElement('span');
            statusSpan.style.textTransform = 'capitalize';
            statusSpan.textContent = booking.status; // Safe: textContent auto-escapes

            statusDiv.appendChild(statusLabel);
            statusDiv.appendChild(statusSpan);

            // Append all elements
            bookingDiv.appendChild(headerDiv);
            bookingDiv.appendChild(dateDiv);
            bookingDiv.appendChild(statusDiv);
            bookingsList.appendChild(bookingDiv);
        });
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EmpireStateWalkers();
});
