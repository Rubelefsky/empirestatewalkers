const express = require('express');
const {
    submitContact,
    getContactMessages,
    updateContactStatus
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .post(submitContact)
    .get(protect, authorize('admin'), getContactMessages);

router.route('/:id')
    .put(protect, authorize('admin'), updateContactStatus);

module.exports = router;
