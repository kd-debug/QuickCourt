const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Facility = require('../models/Facility');

const router = express.Router();

router.get('/profile', protect, async (req, res) => {
  return res.json({ success: true, user: req.user });
});

router.put('/profile', protect, async (req, res) => {
  return res.json({ success: true, message: 'Profile update placeholder' });
});

// Stats for current user
router.get('/stats', protect, async (req, res) => {
  try {
    let activeBookings = 0;
    let totalBookings = 0;
    let favoriteCount = req.user.favorites ? req.user.favorites.length : 0;

    const userId = req.user._id;
    const now = new Date();

    totalBookings = await Booking.countDocuments({ user: userId });
    activeBookings = await Booking.countDocuments({ user: userId, startTime: { $gte: now }, status: { $in: ['pending', 'confirmed'] } });

    // For owners, provide facility count and bookings across owned facilities
    let myFacilities = 0;
    if (req.user.role === 'facility_owner') {
      myFacilities = await Facility.countDocuments({ owner: userId });
    }

    res.json({ success: true, stats: { activeBookings, totalBookings, favoriteCount, myFacilities } });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

module.exports = router;
