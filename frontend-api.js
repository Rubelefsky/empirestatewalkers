// Empire State Walkers - Frontend with API Integration
// Replace script.js with this file or rename to script.js when backend is running

const API_URL = 'http://localhost:5001/api';

class EmpireStateWalkers {
    constructor() {
        this.currentUser = null;
        this.stripe = null;
        this.elements = null;
        this.paymentElement = null;
        this.currentBookingId = null;
        this.init();
    }

    init() {
        this.checkAuthState();
        this.setupEventListeners();
        this.updateUIBasedOnAuth();
        this.initializeStripe();
    }

    initializeStripe() {
        // Initialize Stripe with your publishable key
        // IMPORTANT: Replace with your actual Stripe publishable key
        // This should be loaded from environment variables in production
        const stripePublishableKey = 'pk_test_YOUR_PUBLISHABLE_KEY';

        // Only initialize if Stripe is loaded
        if (typeof Stripe !== 'undefined') {
            try {
                this.stripe = Stripe(stripePublishableKey);
                console.log('Stripe initialized successfully');
            } catch (error) {
                console.error('Error initializing Stripe:', error);
            }
        } else {
            console.warn('Stripe.js not loaded');
        }
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

        // Payment event listeners
        const submitPaymentBtn = document.getElementById('submit-payment');
        if (submitPaymentBtn) {
            submitPaymentBtn.addEventListener('click', (e) => this.handlePaymentSubmit(e));
        }

        const cancelPaymentBtn = document.getElementById('cancel-payment-btn');
        if (cancelPaymentBtn) {
            cancelPaymentBtn.addEventListener('click', () => this.hideBookingModal());
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

            // Add payment status badge if available
            if (booking.paymentStatus) {
                const paymentStatusSpan = document.createElement('span');
                paymentStatusSpan.className = `booking-status payment-${booking.paymentStatus}`;
                paymentStatusSpan.textContent = booking.paymentStatus === 'succeeded' ? 'Paid' : booking.paymentStatus;
                headerDiv.appendChild(paymentStatusSpan);
            }

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
                const booking = data.data;

                if (bookingId) {
                    // Edit mode - just close and refresh
                    alert('Booking updated successfully!');
                    this.hideBookingModal();
                    await this.fetchAndRenderBookings();
                } else {
                    // New booking - proceed to payment
                    // Check if the service requires payment (not "Other")
                    if (booking.service !== 'Other' && booking.price > 0) {
                        await this.showPaymentForm(booking);
                    } else {
                        alert('Booking created successfully! Our team will contact you regarding payment.');
                        this.hideBookingModal();
                        await this.fetchAndRenderBookings();
                    }
                }
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

    /**
     * Payment Methods
     */

    async showPaymentForm(booking) {
        if (!this.stripe) {
            alert('Payment system is not available. Please contact support.');
            return;
        }

        try {
            // Store current booking ID
            this.currentBookingId = booking._id;

            // Update modal title
            const modalTitle = document.getElementById('booking-modal-title');
            if (modalTitle) {
                modalTitle.textContent = 'Complete Payment';
            }

            // Hide booking form, show payment section
            const bookingFormSection = document.getElementById('booking-form-section');
            const paymentSection = document.getElementById('payment-section');

            if (bookingFormSection) bookingFormSection.classList.add('hidden');
            if (paymentSection) paymentSection.classList.remove('hidden');

            // Update payment summary
            document.getElementById('payment-service').textContent = booking.service;
            const bookingDate = new Date(booking.date);
            document.getElementById('payment-datetime').textContent =
                `${bookingDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })} at ${booking.time}`;
            document.getElementById('payment-amount').textContent = `$${booking.price.toFixed(2)}`;

            // Create payment intent
            const response = await fetch(`${API_URL}/payments/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ bookingId: booking._id })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to create payment intent');
            }

            const { clientSecret } = data;

            // Initialize Stripe Elements
            const appearance = {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#000000',
                    fontFamily: 'Space Mono, monospace',
                    borderRadius: '0px'
                }
            };

            this.elements = this.stripe.elements({ clientSecret, appearance });
            this.paymentElement = this.elements.create('payment');
            this.paymentElement.mount('#payment-element');

            // Handle loading state
            this.paymentElement.on('ready', () => {
                console.log('Payment element ready');
            });

            this.paymentElement.on('change', (event) => {
                const displayError = document.getElementById('payment-errors');
                if (event.error) {
                    displayError.textContent = event.error.message;
                } else {
                    displayError.textContent = '';
                }
            });

        } catch (error) {
            console.error('Error showing payment form:', error);
            this.showPaymentMessage(error.message, 'error');
        }
    }

    async handlePaymentSubmit(e) {
        e.preventDefault();

        if (!this.stripe || !this.elements) {
            alert('Payment system is not ready. Please try again.');
            return;
        }

        // Show loading state
        this.setPaymentLoading(true);

        try {
            // Confirm the payment
            const { error, paymentIntent } = await this.stripe.confirmPayment({
                elements: this.elements,
                confirmParams: {
                    return_url: window.location.origin + window.location.pathname,
                },
                redirect: 'if_required'
            });

            if (error) {
                // Payment failed
                this.showPaymentMessage(error.message, 'error');
                this.setPaymentLoading(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Payment succeeded
                this.showPaymentMessage('Payment successful! Your booking is confirmed.', 'success');

                // Wait a moment for user to see the message
                setTimeout(() => {
                    this.hideBookingModal();
                    this.fetchAndRenderBookings();
                }, 2000);
            } else {
                // Payment requires additional action or is processing
                this.showPaymentMessage('Payment is processing...', 'info');
                this.setPaymentLoading(false);
            }
        } catch (error) {
            console.error('Payment error:', error);
            this.showPaymentMessage('An unexpected error occurred. Please try again.', 'error');
            this.setPaymentLoading(false);
        }
    }

    setPaymentLoading(isLoading) {
        const submitButton = document.getElementById('submit-payment');
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('spinner');

        if (submitButton) {
            submitButton.disabled = isLoading;
        }

        if (buttonText) {
            buttonText.textContent = isLoading ? 'Processing...' : 'Pay Now';
        }

        if (spinner) {
            if (isLoading) {
                spinner.classList.remove('hidden');
            } else {
                spinner.classList.add('hidden');
            }
        }
    }

    showPaymentMessage(message, type = 'info') {
        const messageElement = document.getElementById('payment-message');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = 'payment-message payment-message-' + type;

            // Clear error message area
            if (type === 'success') {
                const errorElement = document.getElementById('payment-errors');
                if (errorElement) {
                    errorElement.textContent = '';
                }
            }
        }
    }

    hideBookingModal() {
        const modal = document.getElementById('booking-modal');
        const bookingFormSection = document.getElementById('booking-form-section');
        const paymentSection = document.getElementById('payment-section');

        // Reset modal state
        if (bookingFormSection) bookingFormSection.classList.remove('hidden');
        if (paymentSection) paymentSection.classList.add('hidden');

        // Clear payment element
        if (this.paymentElement) {
            this.paymentElement.unmount();
            this.paymentElement = null;
        }
        this.elements = null;
        this.currentBookingId = null;

        // Clear messages
        const paymentErrors = document.getElementById('payment-errors');
        const paymentMessage = document.getElementById('payment-message');
        if (paymentErrors) paymentErrors.textContent = '';
        if (paymentMessage) paymentMessage.textContent = '';

        // Hide modal
        if (modal) {
            modal.classList.add('hidden');
        }
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EmpireStateWalkers();
});
