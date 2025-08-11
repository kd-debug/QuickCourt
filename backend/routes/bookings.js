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

// Cancel booking
router.patch('/:id/cancel', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Check if booking is already cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        // Check if booking is in the past
        const now = new Date();
        if (booking.startTime <= now) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel past bookings'
            });
        }

        // Check if booking is within 1 hour of start time
        const oneHourBefore = new Date(booking.startTime.getTime() - 60 * 60 * 1000);
        if (now >= oneHourBefore) {
            return res.status(400).json({
                success: false,
                message: 'Bookings can only be cancelled at least 1 hour before the start time'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ success: true, booking });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel booking' });
    }
});

// Add review and rating
router.patch('/:id/review', protect, async (req, res) => {
    try {
        const { rating, review } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to review this booking'
            });
        }

        // Check if booking is already reviewed
        if (booking.rating) {
            return res.status(400).json({
                success: false,
                message: 'Booking is already reviewed'
            });
        }

        // Check if booking date has passed
        const now = new Date();
        if (booking.startTime > now) {
            return res.status(400).json({
                success: false,
                message: 'Can only review bookings after the booking date'
            });
        }

        booking.rating = rating;
        booking.review = review;
        booking.reviewedAt = now;
        await booking.save();

        // Update facility rating
        const Facility = require('../models/Facility');
        const allReviews = await Booking.find({
            facility: booking.facility,
            rating: { $exists: true, $ne: null }
        });

        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

        await Facility.findByIdAndUpdate(booking.facility, {
            rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            ratingCount: allReviews.length
        });

        res.json({ success: true, booking });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ success: false, message: 'Failed to add review' });
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

// Get reviews for a facility
router.get('/facility/:facilityId/reviews', async (req, res) => {
    try {
        const { facilityId } = req.params;

        // Get facility info for rating
        const Facility = require('../models/Facility');
        const facility = await Facility.findById(facilityId).select('rating ratingCount');

        // Get all reviews for this facility
        const reviews = await Booking.find({
            facility: facilityId,
            rating: { $exists: true, $ne: null },
            review: { $exists: true, $ne: null }
        })
            .populate('user', 'fullName')
            .sort({ reviewedAt: -1 })
            .select('rating review reviewedAt user');

        res.json({
            success: true,
            reviews,
            averageRating: facility?.rating || 0,
            totalReviews: facility?.ratingCount || 0
        });
    } catch (error) {
        console.error('Get facility reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
});

module.exports = router;
