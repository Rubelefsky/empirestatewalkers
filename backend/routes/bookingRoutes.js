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

const router = express.Router();

router.route('/')
    .get(protect, getBookings)
    .post(protect, createBookingValidation, createBooking);

router.route('/admin/all')
    .get(protect, authorize('admin'), getAllBookings);

router.route('/:id')
    .get(protect, getBooking)
    .put(protect, updateBookingValidation, updateBooking)
    .delete(protect, deleteBooking);

module.exports = router;
