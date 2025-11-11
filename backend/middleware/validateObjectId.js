const mongoose = require('mongoose');
const logger = require('../config/logger');

/**
 * Middleware to validate MongoDB ObjectId in route parameters
 * Prevents CastError exceptions and provides clear error messages
 */
const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!id) {
            logger.warn(`Missing ${paramName} parameter in request`);
            return res.status(400).json({
                success: false,
                message: `${paramName} parameter is required`
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.warn(`Invalid ObjectId format for ${paramName}: ${id}`);
            return res.status(400).json({
                success: false,
                message: `Invalid ${paramName} format`
            });
        }

        next();
    };
};

module.exports = validateObjectId;
