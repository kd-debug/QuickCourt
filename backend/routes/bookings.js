const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');

const router = express.Router();

// Create booking
router.post('/', protect, async (req, res) => {
    try {
        const booking = await Booking.create({ ...req.body, user: req.user._id });
        res.status(201).json({ success: true, booking });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(400).json({ success: false, message: 'Failed to create booking' });
    }
});

// Get my bookings
router.get('/mine', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate('facility');
        res.json({ success: true, bookings });
    } catch (error) {
        console.error('My bookings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
});

module.exports = router;
