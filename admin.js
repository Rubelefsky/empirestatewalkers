// Empire State Walkers - Admin Dashboard

const API_URL = 'http://localhost:5001/api';

class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.allBookings = [];
        this.allMessages = [];
        this.init();
    }

    init() {
        this.checkAuthState();
        this.setupEventListeners();
    }

    async checkAuthState() {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include'
            });

            if (!response.ok) {
                alert('You must be logged in to access the admin dashboard.');
                window.location.href = 'index.html';
                return;
            }

            const data = await response.json();
            this.currentUser = data.data;

            // Check if user is admin
            if (this.currentUser.role !== 'admin') {
                alert('Access denied. Admin privileges required.');
                window.location.href = 'index.html';
                return;
            }

            this.updateUI();
            await this.loadData();
        } catch (error) {
            console.error('Auth check error:', error);
            window.location.href = 'index.html';
        }
    }

    setupEventListeners() {
        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Filters
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterBookings());
        }

        const messageFilter = document.getElementById('message-filter');
        if (messageFilter) {
            messageFilter.addEventListener('change', () => this.filterMessages());
        }

        // Status modal
        const closeStatusModal = document.getElementById('close-status-modal');
        const cancelStatusBtn = document.getElementById('cancel-status-btn');
        if (closeStatusModal) {
            closeStatusModal.addEventListener('click', () => this.hideStatusModal());
        }
        if (cancelStatusBtn) {
            cancelStatusBtn.addEventListener('click', () => this.hideStatusModal());
        }

        const statusForm = document.getElementById('status-form');
        if (statusForm) {
            statusForm.addEventListener('submit', (e) => this.handleStatusUpdate(e));
        }

        // Details modal
        const closeDetailsModal = document.getElementById('close-details-modal');
        const closeDetailsBtn = document.getElementById('close-details-btn');
        if (closeDetailsModal) {
            closeDetailsModal.addEventListener('click', () => this.hideDetailsModal());
        }
        if (closeDetailsBtn) {
            closeDetailsBtn.addEventListener('click', () => this.hideDetailsModal());
        }

        // Close modals on outside click
        const statusModal = document.getElementById('status-modal');
        const detailsModal = document.getElementById('details-modal');
        if (statusModal) {
            statusModal.addEventListener('click', (e) => {
                if (e.target === statusModal) this.hideStatusModal();
            });
        }
        if (detailsModal) {
            detailsModal.addEventListener('click', (e) => {
                if (e.target === detailsModal) this.hideDetailsModal();
            });
        }
    }

    updateUI() {
        const adminUserName = document.getElementById('admin-user-name');
        if (adminUserName && this.currentUser) {
            adminUserName.textContent = this.currentUser.name;
        }
    }

    async loadData() {
        await Promise.all([
            this.fetchBookings(),
            this.fetchMessages()
        ]);
        this.updateStats();
    }

    async fetchBookings() {
        try {
            const response = await fetch(`${API_URL}/bookings/all?limit=1000`, {
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                this.allBookings = data.data;
                this.renderBookings(this.allBookings);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    }

    async fetchMessages() {
        try {
            const response = await fetch(`${API_URL}/contact`, {
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                this.allMessages = data.data;
                this.renderMessages(this.allMessages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    updateStats() {
        const totalBookings = this.allBookings.length;
        const pending = this.allBookings.filter(b => b.status === 'pending').length;
        const confirmed = this.allBookings.filter(b => b.status === 'confirmed').length;
        const completed = this.allBookings.filter(b => b.status === 'completed').length;

        document.getElementById('stat-total-bookings').textContent = totalBookings;
        document.getElementById('stat-pending').textContent = pending;
        document.getElementById('stat-confirmed').textContent = confirmed;
        document.getElementById('stat-completed').textContent = completed;
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }

    filterBookings() {
        const statusFilter = document.getElementById('status-filter').value;

        let filtered = this.allBookings;
        if (statusFilter) {
            filtered = this.allBookings.filter(b => b.status === statusFilter);
        }

        this.renderBookings(filtered);
    }

    filterMessages() {
        const messageFilter = document.getElementById('message-filter').value;

        let filtered = this.allMessages;
        if (messageFilter) {
            filtered = this.allMessages.filter(m => m.status === messageFilter);
        }

        this.renderMessages(filtered);
    }

    renderBookings(bookings) {
        const bookingsList = document.getElementById('bookings-list');
        if (!bookingsList) return;

        bookingsList.innerHTML = '';

        if (bookings.length === 0) {
            const emptyState = document.createElement('p');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No bookings found';
            bookingsList.appendChild(emptyState);
            return;
        }

        // Sort by date (most recent first)
        bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        bookings.forEach(booking => {
            const bookingDiv = document.createElement('div');
            bookingDiv.className = 'admin-booking-item';

            // Header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'admin-booking-header';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'admin-booking-title';
            titleDiv.textContent = booking.dogName;

            const statusSpan = document.createElement('span');
            statusSpan.className = `booking-status ${booking.status}`;
            statusSpan.textContent = booking.status;

            headerDiv.appendChild(titleDiv);
            headerDiv.appendChild(statusSpan);

            // User info
            const userDiv = document.createElement('div');
            userDiv.className = 'admin-booking-user';
            const userName = booking.user?.name || 'Unknown User';
            const userEmail = booking.user?.email || '';
            userDiv.textContent = `${userName} (${userEmail})`;

            // Booking info grid
            const infoGrid = document.createElement('div');
            infoGrid.className = 'admin-booking-info';

            const infoItems = [
                { label: 'Service', value: booking.service },
                { label: 'Breed', value: booking.dogBreed },
                { label: 'Date', value: new Date(booking.date).toLocaleDateString() },
                { label: 'Time', value: booking.time },
                { label: 'Duration', value: `${booking.duration} min` },
                { label: 'Price', value: `$${booking.price || 'N/A'}` },
                { label: 'Payment Status', value: booking.paymentStatus || 'pending' },
                { label: 'Payment Method', value: booking.paymentMethod || 'N/A' }
            ];

            infoItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'admin-info-item';

                const labelSpan = document.createElement('span');
                labelSpan.className = 'admin-info-label';
                labelSpan.textContent = item.label;

                const valueSpan = document.createElement('span');
                valueSpan.className = 'admin-info-value';
                valueSpan.textContent = item.value;

                itemDiv.appendChild(labelSpan);
                itemDiv.appendChild(valueSpan);
                infoGrid.appendChild(itemDiv);
            });

            // Actions
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'admin-booking-actions';

            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn-minimal btn-small';
            viewBtn.textContent = 'View Details';
            viewBtn.addEventListener('click', () => this.showBookingDetails(booking));

            const updateStatusBtn = document.createElement('button');
            updateStatusBtn.className = 'btn-minimal btn-small';
            updateStatusBtn.textContent = 'Update Status';
            updateStatusBtn.addEventListener('click', () => this.showStatusModal(booking));

            actionsDiv.appendChild(viewBtn);
            actionsDiv.appendChild(updateStatusBtn);

            // Add refund button if payment succeeded
            if (booking.paymentStatus === 'succeeded') {
                const refundBtn = document.createElement('button');
                refundBtn.className = 'btn-minimal btn-small btn-danger';
                refundBtn.textContent = 'Issue Refund';
                refundBtn.addEventListener('click', () => this.handleRefund(booking));
                actionsDiv.appendChild(refundBtn);
            }

            // Append all
            bookingDiv.appendChild(headerDiv);
            bookingDiv.appendChild(userDiv);
            bookingDiv.appendChild(infoGrid);
            bookingDiv.appendChild(actionsDiv);

            bookingsList.appendChild(bookingDiv);
        });
    }

    renderMessages(messages) {
        const messagesList = document.getElementById('messages-list');
        if (!messagesList) return;

        messagesList.innerHTML = '';

        if (messages.length === 0) {
            const emptyState = document.createElement('p');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No messages found';
            messagesList.appendChild(emptyState);
            return;
        }

        // Sort by date (most recent first)
        messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `admin-message-item ${message.status}`;

            // Header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'admin-message-header';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'admin-message-title';
            titleDiv.textContent = message.name;

            const statusSpan = document.createElement('span');
            statusSpan.className = `message-status ${message.status}`;
            statusSpan.textContent = message.status;

            headerDiv.appendChild(titleDiv);
            headerDiv.appendChild(statusSpan);

            // Meta
            const metaDiv = document.createElement('div');
            metaDiv.className = 'admin-message-meta';
            const date = new Date(message.createdAt).toLocaleString();
            metaDiv.textContent = `${message.email} • ${message.phone || 'No phone'} • ${date}`;

            // Content
            const contentDiv = document.createElement('div');
            contentDiv.className = 'admin-message-content';
            contentDiv.textContent = message.message;

            // Actions
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'admin-message-actions';

            if (message.status === 'new') {
                const markReadBtn = document.createElement('button');
                markReadBtn.className = 'btn-minimal btn-small';
                markReadBtn.textContent = 'Mark as Read';
                markReadBtn.addEventListener('click', () => this.updateMessageStatus(message._id, 'read'));
                actionsDiv.appendChild(markReadBtn);
            }

            if (message.status !== 'resolved') {
                const resolveBtn = document.createElement('button');
                resolveBtn.className = 'btn-minimal btn-small';
                resolveBtn.textContent = 'Mark as Resolved';
                resolveBtn.addEventListener('click', () => this.updateMessageStatus(message._id, 'resolved'));
                actionsDiv.appendChild(resolveBtn);
            }

            // Append all
            messageDiv.appendChild(headerDiv);
            messageDiv.appendChild(metaDiv);
            messageDiv.appendChild(contentDiv);
            if (actionsDiv.children.length > 0) {
                messageDiv.appendChild(actionsDiv);
            }

            messagesList.appendChild(messageDiv);
        });
    }

    showBookingDetails(booking) {
        const modal = document.getElementById('details-modal');
        const content = document.getElementById('booking-details-content');

        if (!modal || !content) return;

        content.innerHTML = '';

        // Dog Information Section
        const dogSection = this.createDetailsSection('Dog Information', [
            { label: 'Name', value: booking.dogName },
            { label: 'Breed', value: booking.dogBreed },
            { label: 'Age', value: `${booking.dogAge} years` }
        ]);

        // Booking Information Section
        const bookingSection = this.createDetailsSection('Booking Information', [
            { label: 'Service', value: booking.service },
            { label: 'Date', value: new Date(booking.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) },
            { label: 'Time', value: booking.time },
            { label: 'Duration', value: `${booking.duration} minutes` },
            { label: 'Status', value: booking.status },
            { label: 'Price', value: `$${booking.price || 'N/A'}` }
        ]);

        // Customer Information Section
        const customerSection = this.createDetailsSection('Customer Information', [
            { label: 'Name', value: booking.user?.name || 'N/A' },
            { label: 'Email', value: booking.user?.email || 'N/A' },
            { label: 'Phone', value: booking.user?.phone || 'N/A' }
        ]);

        // Notes Section
        if (booking.notes) {
            const notesSection = document.createElement('div');
            notesSection.className = 'details-section';

            const notesTitle = document.createElement('h4');
            notesTitle.textContent = 'Special Notes';

            const notesText = document.createElement('p');
            notesText.textContent = booking.notes;

            notesSection.appendChild(notesTitle);
            notesSection.appendChild(notesText);

            content.appendChild(notesSection);
        }

        content.appendChild(dogSection);
        content.appendChild(bookingSection);
        content.appendChild(customerSection);

        modal.classList.remove('hidden');
    }

    createDetailsSection(title, items) {
        const section = document.createElement('div');
        section.className = 'details-section';

        const titleEl = document.createElement('h4');
        titleEl.textContent = title;
        section.appendChild(titleEl);

        const grid = document.createElement('div');
        grid.className = 'details-grid';

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'details-item';

            const label = document.createElement('span');
            label.className = 'details-label';
            label.textContent = item.label;

            const value = document.createElement('span');
            value.className = 'details-value';
            value.textContent = item.value;

            itemDiv.appendChild(label);
            itemDiv.appendChild(value);
            grid.appendChild(itemDiv);
        });

        section.appendChild(grid);
        return section;
    }

    hideDetailsModal() {
        const modal = document.getElementById('details-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showStatusModal(booking) {
        const modal = document.getElementById('status-modal');
        const currentStatus = document.getElementById('current-status');
        const bookingId = document.getElementById('status-booking-id');
        const newStatus = document.getElementById('new-status');

        if (!modal) return;

        bookingId.value = booking._id;
        currentStatus.textContent = booking.status;
        newStatus.value = '';

        modal.classList.remove('hidden');
    }

    hideStatusModal() {
        const modal = document.getElementById('status-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async handleStatusUpdate(e) {
        e.preventDefault();

        const bookingId = document.getElementById('status-booking-id').value;
        const newStatus = document.getElementById('new-status').value;

        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (data.success) {
                alert('Booking status updated successfully!');
                this.hideStatusModal();
                await this.fetchBookings();
                this.updateStats();
            } else {
                alert('Error updating status: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status. Please try again.');
        }
    }

    async updateMessageStatus(messageId, status) {
        try {
            const response = await fetch(`${API_URL}/contact/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (data.success) {
                alert('Message status updated!');
                await this.fetchMessages();
            } else {
                alert('Error updating message: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating message:', error);
            alert('Error updating message. Please try again.');
        }
    }

    async handleLogout() {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'GET',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    async handleRefund(booking) {
        if (!confirm(`Are you sure you want to issue a refund for $${booking.price}?\n\nThis action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/payments/refund/${booking._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                alert('Refund issued successfully!');
                await this.fetchBookings();
                this.updateStats();
            } else {
                alert('Error issuing refund: ' + data.error);
            }
        } catch (error) {
            console.error('Error issuing refund:', error);
            alert('Error issuing refund. Please try again.');
        }
    }
}

// Initialize the admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});
