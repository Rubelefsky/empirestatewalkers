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

        // Booking management
        this.setupBookingEventListeners();
    }

    setupBookingEventListeners() {
        // Create booking button
        const createBookingBtn = document.getElementById('create-booking-btn');
        if (createBookingBtn) {
            createBookingBtn.addEventListener('click', () => this.showBookingModal());
        }

        // Booking form submit
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => this.handleBookingSubmit(e));
        }

        // Close booking modal
        const closeBookingModal = document.getElementById('close-booking-modal');
        const cancelBookingBtn = document.getElementById('cancel-booking-btn');
        if (closeBookingModal) {
            closeBookingModal.addEventListener('click', () => this.hideBookingModal());
        }
        if (cancelBookingBtn) {
            cancelBookingBtn.addEventListener('click', () => this.hideBookingModal());
        }

        // Close modal on outside click
        const bookingModal = document.getElementById('booking-modal');
        if (bookingModal) {
            bookingModal.addEventListener('click', (e) => {
                if (e.target === bookingModal) {
                    this.hideBookingModal();
                }
            });
        }
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
            const date = new Date(this.currentUser.createdAt || Date.now());
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

        // Sort bookings by date (most recent first)
        bookings.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Create booking elements using DOM manipulation to prevent XSS
        bookings.forEach(booking => {
            const bookingDiv = document.createElement('div');
            bookingDiv.className = 'booking-item';

            // Header with dog name and status
            const headerDiv = document.createElement('div');
            headerDiv.className = 'booking-header';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'booking-title';
            titleDiv.textContent = booking.dogName;

            const statusSpan = document.createElement('span');
            statusSpan.className = `booking-status ${booking.status}`;
            statusSpan.textContent = booking.status;

            headerDiv.appendChild(titleDiv);
            headerDiv.appendChild(statusSpan);

            // Service and breed info
            const infoDiv1 = document.createElement('div');
            infoDiv1.className = 'booking-info';
            infoDiv1.textContent = `${booking.service} • ${booking.dogBreed}`;

            // Date and time info
            const infoDiv2 = document.createElement('div');
            infoDiv2.className = 'booking-info';
            const bookingDate = new Date(booking.date);
            infoDiv2.textContent = `${bookingDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })} at ${booking.time} (${booking.duration} min)`;

            // Notes if available
            let notesDiv = null;
            if (booking.notes) {
                notesDiv = document.createElement('div');
                notesDiv.className = 'booking-info';
                notesDiv.textContent = `Notes: ${booking.notes}`;
            }

            // Action buttons (only for pending bookings)
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'booking-actions';

            if (booking.status === 'pending') {
                const editBtn = document.createElement('button');
                editBtn.className = 'btn-minimal btn-small';
                editBtn.textContent = 'Edit';
                editBtn.addEventListener('click', () => this.showBookingModal(booking));

                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'btn-minimal btn-small btn-danger';
                cancelBtn.textContent = 'Cancel';
                cancelBtn.addEventListener('click', () => this.cancelBooking(booking._id));

                actionsDiv.appendChild(editBtn);
                actionsDiv.appendChild(cancelBtn);
            }

            // Append all elements
            bookingDiv.appendChild(headerDiv);
            bookingDiv.appendChild(infoDiv1);
            bookingDiv.appendChild(infoDiv2);
            if (notesDiv) bookingDiv.appendChild(notesDiv);
            if (actionsDiv.children.length > 0) bookingDiv.appendChild(actionsDiv);

            bookingsList.appendChild(bookingDiv);
        });
    }

    showBookingModal(booking = null) {
        const modal = document.getElementById('booking-modal');
        const modalTitle = document.getElementById('booking-modal-title');
        const form = document.getElementById('booking-form');

        if (!modal || !form) return;

        // Reset form
        form.reset();

        if (booking) {
            // Edit mode
            modalTitle.textContent = 'Edit Booking';
            document.getElementById('booking-id').value = booking._id;
            document.getElementById('booking-dog-name').value = booking.dogName;
            document.getElementById('booking-dog-breed').value = booking.dogBreed;
            document.getElementById('booking-dog-age').value = booking.dogAge;
            document.getElementById('booking-service').value = booking.service;
            // Convert ISO date to YYYY-MM-DD format
            const bookingDate = new Date(booking.date);
            document.getElementById('booking-date').value = bookingDate.toISOString().split('T')[0];
            document.getElementById('booking-time').value = booking.time;
            document.getElementById('booking-duration').value = booking.duration;
            document.getElementById('booking-notes').value = booking.notes || '';
        } else {
            // Create mode
            modalTitle.textContent = 'New Booking';
            document.getElementById('booking-id').value = '';
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('booking-date').min = today;
        }

        modal.classList.remove('hidden');
    }

    hideBookingModal() {
        const modal = document.getElementById('booking-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async handleBookingSubmit(e) {
        e.preventDefault();

        const bookingId = document.getElementById('booking-id').value;
        const bookingData = {
            dogName: document.getElementById('booking-dog-name').value,
            dogBreed: document.getElementById('booking-dog-breed').value,
            dogAge: parseInt(document.getElementById('booking-dog-age').value),
            service: document.getElementById('booking-service').value,
            date: document.getElementById('booking-date').value,
            time: document.getElementById('booking-time').value,
            duration: parseInt(document.getElementById('booking-duration').value),
            notes: document.getElementById('booking-notes').value
        };

        try {
            const url = bookingId
                ? `${API_URL}/bookings/${bookingId}`
                : `${API_URL}/bookings`;

            const method = bookingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (data.success) {
                alert(bookingId ? 'Booking updated successfully!' : 'Booking created successfully!');
                this.hideBookingModal();
                await this.fetchAndRenderBookings();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Booking submission error:', error);
            alert('Error submitting booking. Please try again.');
        }
    }

    async cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                alert('Booking cancelled successfully!');
                await this.fetchAndRenderBookings();
            } else {
                alert('Error cancelling booking: ' + data.message);
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Error cancelling booking. Please try again.');
        }
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EmpireStateWalkers();
});
