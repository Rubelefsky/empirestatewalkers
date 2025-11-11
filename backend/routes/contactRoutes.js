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
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/')
    .post(contactValidation, submitContact)
    .get(protect, authorize('admin'), getContactMessages);

// Apply ObjectId validation to routes with :id parameter
router.route('/:id')
    .put(protect, authorize('admin'), validateObjectId(), updateContactStatusValidation, updateContactStatus);

module.exports = router;
