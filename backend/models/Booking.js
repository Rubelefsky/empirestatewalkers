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
        type: String,
        enum: ['30 min', '60 min', 'Full day'],
        default: '30 min'
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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
