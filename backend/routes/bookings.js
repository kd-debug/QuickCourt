const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');

const router = express.Router();

// Create booking
router.post('/', protect, async (req, res) => {
    try {
        const { facility, startTime, endTime, amount, selectedCourts, sport } = req.body;
        
        // Validate required fields
        if (!facility || !startTime || !endTime || !amount) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }

        // Check if time is in the future
        const now = new Date();
        const bookingStart = new Date(startTime);
        if (bookingStart <= now) {
            return res.status(400).json({ 
                success: false, 
                message: 'Booking time must be in the future' 
            });
        }

        // Check availability again before creating booking
        const existingBookings = await Booking.find({
            facility,
            status: { $nin: ['cancelled'] },
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        if (existingBookings.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Selected time slot is no longer available' 
            });
        }

        // Create the booking
        const booking = await Booking.create({ 
            user: req.user._id,
            facility,
            startTime,
            endTime,
            amount,
            selectedCourts,
            sport,
            status: 'confirmed' // Auto-confirm for now
        });

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

// Check availability
router.get('/availability', async (req, res) => {
    try {
        const { facilityId, date, startTime, endTime } = req.query;
        
        if (!facilityId || !date || !startTime || !endTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required parameters' 
            });
        }

        // Check for existing bookings in the time slot
        const existingBookings = await Booking.find({
            facility: facilityId,
            status: { $nin: ['cancelled'] },
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        const isAvailable = existingBookings.length === 0;
        
        // For now, return mock available courts
        const availableCourts = isAvailable ? ['Court 1', 'Court 2', 'Court 3'] : [];

        res.json({ 
            success: true, 
            available: isAvailable,
            availableCourts,
            existingBookings: existingBookings.length
        });
    } catch (error) {
        console.error('Availability check error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to check availability' 
        });
    }
});

module.exports = router;
