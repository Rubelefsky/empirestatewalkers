const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Auth validation rules
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Please provide a valid phone number'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    handleValidationErrors
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

const updateDetailsValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Please provide a valid phone number'),
    handleValidationErrors
];

// Booking validation rules
const createBookingValidation = [
    body('service')
        .notEmpty().withMessage('Service is required')
        .isIn(['Daily Walk (30 min)', 'Daily Walk (60 min)', 'Pet Sitting', 'Emergency Visit', 'Other'])
        .withMessage('Invalid service type'),
    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Please provide a valid date')
        .custom((value) => {
            const bookingDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (bookingDate < today) {
                throw new Error('Booking date cannot be in the past');
            }
            return true;
        }),
    body('time')
        .notEmpty().withMessage('Time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please provide a valid time in HH:MM format'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
    handleValidationErrors
];

const updateBookingValidation = [
    body('service')
        .optional()
        .isIn(['Daily Walk (30 min)', 'Daily Walk (60 min)', 'Pet Sitting', 'Emergency Visit', 'Other'])
        .withMessage('Invalid service type'),
    body('date')
        .optional()
        .isISO8601().withMessage('Please provide a valid date'),
    body('time')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please provide a valid time in HH:MM format'),
    body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
    handleValidationErrors
];

// Contact validation rules
const contactValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Please provide a valid phone number'),
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
    handleValidationErrors
];

const updateContactStatusValidation = [
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['new', 'in-progress', 'resolved'])
        .withMessage('Invalid status'),
    handleValidationErrors
];

module.exports = {
    registerValidation,
    loginValidation,
    updateDetailsValidation,
    createBookingValidation,
    updateBookingValidation,
    contactValidation,
    updateContactStatusValidation
};
