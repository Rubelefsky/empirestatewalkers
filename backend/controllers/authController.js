const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Helper to create user response object
const createUserResponse = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        memberSince: user.memberSince
    };
};

// Helper to send token via httpOnly cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    // Cookie options
    const cookieOptions = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true, // Prevents XSS attacks
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        path: '/'
    };

    res.status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            data: createUserResponse(user)
        });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        // Explicitly whitelist allowed fields to prevent privilege escalation
        // Users cannot set their own role - it defaults to 'user' from schema
        const { name, email, phone, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            // Generic message to prevent user enumeration attack
            return res.status(400).json({
                success: false,
                message: 'Registration failed. Please check your details and try again.'
            });
        }

        // Only create user with whitelisted fields
        // Role will default to 'user' from schema
        const user = await User.create({
            name,
            email,
            phone,
            password
            // Explicitly NOT including 'role' - prevents privilege escalation
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile'
        });
    }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        // Explicitly whitelist allowed fields
        // Users cannot modify their own role
        const { name, email, phone } = req.body;
        const fieldsToUpdate = {
            name,
            email,
            phone
            // Explicitly NOT including 'role' - prevents privilege escalation
        };

        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Update details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 1 * 1000), // Expire in 1 second
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};
