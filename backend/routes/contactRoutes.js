const express = require('express');
const {
    submitContact,
    getContactMessages,
    updateContactStatus
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');
const {
    contactValidation,
    updateContactStatusValidation
} = require('../middleware/validators');

const router = express.Router();

router.route('/')
    .post(contactValidation, submitContact)
    .get(protect, authorize('admin'), getContactMessages);

router.route('/:id')
    .put(protect, authorize('admin'), updateContactStatusValidation, updateContactStatus);

module.exports = router;
