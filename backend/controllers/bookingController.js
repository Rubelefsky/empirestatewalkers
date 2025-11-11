const Booking = require('../models/Booking');
const { SERVICE_PRICING } = require('../config/services');

// Helper to check booking ownership
const checkBookingOwnership = (booking, userId, userRole) => {
    return booking.user.toString() === userId || userRole === 'admin';
};

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).sort('-createdAt');

        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve bookings'
        });
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!checkBookingOwnership(booking, req.user.id, req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this booking'
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve booking'
        });
    }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const bookingData = {
            ...req.body,
            user: req.user.id,
            price: SERVICE_PRICING[req.body.service] || 0
        };

        const booking = await Booking.create(bookingData);

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking'
        });
    }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!checkBookingOwnership(booking, req.user.id, req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this booking'
            });
        }

        // Whitelist allowed fields to prevent mass assignment vulnerability
        const allowedFields = ['service', 'date', 'time', 'dogName', 'dogBreed', 'specialInstructions', 'duration'];
        const updateData = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Only admins can update status and price
        if (req.user.role === 'admin') {
            if (req.body.status !== undefined) {
                updateData.status = req.body.status;
            }
            if (req.body.price !== undefined) {
                updateData.price = req.body.price;
            }
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: updatedBooking
        });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking'
        });
    }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!checkBookingOwnership(booking, req.user.id, req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this booking'
            });
        }

        await booking.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete booking'
        });
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email phone')
            .sort('-createdAt');

        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve bookings'
        });
    }
};
