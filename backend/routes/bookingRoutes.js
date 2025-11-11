const express = require('express');
const {
    getBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking,
    getAllBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const {
    createBookingValidation,
    updateBookingValidation
} = require('../middleware/validators');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/')
    .get(protect, getBookings)
    .post(protect, createBookingValidation, createBooking);

router.route('/admin/all')
    .get(protect, authorize('admin'), getAllBookings);

// Apply ObjectId validation to routes with :id parameter
router.route('/:id')
    .get(protect, validateObjectId(), getBooking)
    .put(protect, validateObjectId(), updateBookingValidation, updateBooking)
    .delete(protect, validateObjectId(), deleteBooking);

module.exports = router;
