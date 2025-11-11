const logger = require('./logger');

// Create a stream object for Morgan to write to Winston
const stream = {
    write: (message) => {
        // Use the http severity level
        logger.http(message.trim());
    },
};

module.exports = stream;
