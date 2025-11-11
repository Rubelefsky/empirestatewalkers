const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { csrfSync } = require('csrf-sync');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/logger');
const morganStream = require('./config/morganStream');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Request logging middleware - Morgan + Winston
// Log all requests with HTTP method, URL, status, response time
const morganFormat = process.env.NODE_ENV === 'production'
    ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'
    : ':method :url :status :res[content-length] - :response-time ms';

app.use(morgan(morganFormat, { stream: morganStream }));

// Log server startup
logger.info('Starting Empire State Walkers API server...');

// Security headers middleware - Helmet
// Protects against common web vulnerabilities
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true
    },
    frameguard: {
        action: 'deny'
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    }
}));

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        // Check if request is secure
        if (req.header('x-forwarded-proto') !== 'https') {
            return res.redirect(301, `https://${req.header('host')}${req.url}`);
        }
        next();
    });
}

// CORS configuration - Improved security
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.CORS_ORIGIN || 'https://yourdomain.com']
    : [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://localhost:8000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5000',
        'http://127.0.0.1:8000',
        // Add your local development URLs here
    ];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// CSRF Protection using double-submit cookie pattern
// Protects against Cross-Site Request Forgery attacks
const { csrfSynchronisedProtection } = csrfSync({
    getTokenFromRequest: (req) => {
        // Check multiple sources for CSRF token
        return req.headers['x-csrf-token'] ||
               req.headers['csrf-token'] ||
               req.body._csrf;
    },
    size: 64, // Token size in bytes
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // Don't require CSRF for safe methods
});

// Apply CSRF protection to all routes except health check and auth endpoints
app.use((req, res, next) => {
    // Disable CSRF in development mode for easier testing
    // In production, implement proper CSRF token handling in frontend
    if (process.env.NODE_ENV === 'development') {
        return next();
    }

    // Skip CSRF for health check and auth endpoints (login/register)
    const skipCsrfPaths = [
        '/api/health',
        '/api/auth/login',
        '/api/auth/register',
        '/api/contact' // Public contact form
    ];

    if (skipCsrfPaths.includes(req.path)) {
        return next();
    }
    csrfSynchronisedProtection(req, res, next);
});

// Endpoint to get CSRF token
app.get('/api/csrf-token', (req, res) => {
    res.json({
        success: true,
        csrfToken: req.csrfToken()
    });
});

logger.info('CSRF protection enabled');

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later',
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for contact form - prevent spam
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 contact submissions per hour
    message: 'Too many contact submissions from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Route files
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Cache control and security headers middleware
app.use((req, res, next) => {
    // Prevent caching of API responses by default
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    // Add API version header
    res.set('X-API-Version', '1.0.0');

    next();
});

// Mount routers
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Empire State Walkers API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info('Security features enabled:');
    logger.info('  - Helmet security headers');
    logger.info('  - CSRF protection');
    logger.info('  - Rate limiting (general, auth, contact)');
    logger.info('  - CORS protection');
    logger.info('  - Request logging');
    logger.info('  - HttpOnly cookie authentication');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Promise Rejection: ${err.message}`);
    logger.error(err.stack);
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
});
