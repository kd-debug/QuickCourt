const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user data' });
  }
});

// Update profile photo
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Convert file to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: base64Image },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ success: false, message: 'Failed to update avatar' });
  }
});

// Update profile information
router.patch('/profile', protect, async (req, res) => {
  try {
    const { fullName } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName: fullName.trim() },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Change password
router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// Toggle favorite venue
router.patch('/favorites/:facilityId', protect, async (req, res) => {
  try {
    const { facilityId } = req.params;
    const user = await User.findById(req.user._id);

    const isFavorite = user.favorites.includes(facilityId);

    if (isFavorite) {
      // Remove from favorites
      user.favorites = user.favorites.filter(id => id.toString() !== facilityId);
    } else {
      // Add to favorites
      user.favorites.push(facilityId);
    }

    await user.save();

    res.json({
      success: true,
      isFavorite: !isFavorite,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites'
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ success: false, message: 'Failed to update favorites' });
  }
});

// Get user favorites
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch favorites' });
  }
});

// Get bookings for facility owner
router.get('/owner-bookings', protect, async (req, res) => {
  try {
    if (req.user.role !== 'facility_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only facility owners can view this data.'
      });
    }

    const Facility = require('../models/Facility');
    const myFacilities = await Facility.find({ owner: req.user._id }).select('_id name');
    const facilityIds = myFacilities.map(f => f._id);

    const bookings = await Booking.find({
      facility: { $in: facilityIds }
    })
      .populate('user', 'fullName email')
      .populate('facility', 'name category sportType')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// Stats for current user
router.get('/stats', protect, async (req, res) => {
  try {
    let activeBookings = 0;
    let totalBookings = 0;
    let todayBookings = 0;
    let favoriteCount = req.user.favorites ? req.user.favorites.length : 0;
    let reviewsGiven = 0;

    const userId = req.user._id;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (req.user.role === 'facility_owner') {
      // For facility owners, get bookings for their facilities
      const Facility = require('../models/Facility');
      const myFacilities = await Facility.find({ owner: userId }).select('_id');
      const facilityIds = myFacilities.map(f => f._id);

      // Total bookings (all bookings for their facilities, excluding cancelled)
      totalBookings = await Booking.countDocuments({
        facility: { $in: facilityIds },
        status: { $ne: 'cancelled' }
      });

      // Today's bookings (bookings made today for their facilities, excluding cancelled)
      todayBookings = await Booking.countDocuments({
        facility: { $in: facilityIds },
        status: { $ne: 'cancelled' },
        createdAt: { $gte: today, $lt: tomorrow }
      });

      // Active bookings (future bookings, excluding cancelled)
      activeBookings = await Booking.countDocuments({
        facility: { $in: facilityIds },
        startTime: { $gte: now },
        status: { $in: ['pending', 'confirmed'] }
      });

      // Reviews given by users for their facilities
      reviewsGiven = await Booking.countDocuments({
        facility: { $in: facilityIds },
        rating: { $exists: true, $ne: null }
      });
    } else {
      // For regular users
      totalBookings = await Booking.countDocuments({ user: userId, status: { $ne: 'cancelled' } });
      todayBookings = await Booking.countDocuments({
        user: userId,
        status: { $ne: 'cancelled' },
        createdAt: { $gte: today, $lt: tomorrow }
      });
      activeBookings = await Booking.countDocuments({
        user: userId,
        startTime: { $gte: now },
        status: { $in: ['pending', 'confirmed'] }
      });
      reviewsGiven = await Booking.countDocuments({
        user: userId,
        rating: { $exists: true, $ne: null }
      });
    }

    // For owners, provide facility count
    let myFacilities = 0;
    if (req.user.role === 'facility_owner') {
      const Facility = require('../models/Facility');
      myFacilities = await Facility.countDocuments({ owner: userId });
    }

    res.json({
      success: true,
      stats: {
        activeBookings,
        totalBookings,
        todayBookings,
        favoriteCount,
        reviewsGiven,
        myFacilities
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

module.exports = router;
