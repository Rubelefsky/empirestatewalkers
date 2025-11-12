const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dogName: {
        type: String,
        required: [true, 'Please provide dog name'],
        trim: true
    },
    dogBreed: {
        type: String,
        trim: true
    },
    service: {
        type: String,
        required: [true, 'Please select a service'],
        enum: ['Daily Walk (30 min)', 'Daily Walk (60 min)', 'Pet Sitting', 'Emergency Visit', 'Other']
    },
    date: {
        type: Date,
        required: [true, 'Please provide a date']
    },
    time: {
        type: String,
        required: [true, 'Please provide a time']
    },
    duration: {
        type: Number,
        required: [true, 'Please provide duration in minutes'],
        min: [15, 'Duration must be at least 15 minutes'],
        max: [480, 'Duration cannot exceed 480 minutes (8 hours)']
    },
    dogAge: {
        type: Number,
        min: [0, 'Age cannot be negative'],
        max: [30, 'Please enter a valid age']
    },
    notes: {
        type: String,
        trim: true
    },
    specialInstructions: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    price: {
        type: Number,
        required: true
    },
    // Payment-related fields
    paymentStatus: {
        type: String,
        enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'],
        default: 'pending'
    },
    stripePaymentIntentId: {
        type: String,
        sparse: true // Allows multiple null values while maintaining uniqueness for non-null values
    },
    stripeChargeId: {
        type: String
    },
    paymentMethod: {
        type: String // e.g., 'card', 'link', etc.
    },
    paidAt: {
        type: Date
    },
    refundedAt: {
        type: Date
    },
    refundAmount: {
        type: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
