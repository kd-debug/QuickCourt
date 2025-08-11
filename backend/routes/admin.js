const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Facility = require('../models/Facility');
const Booking = require('../models/Booking');

// Admin middleware - all routes require admin role
router.use(protect);
router.use(authorize('admin'));

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFacilities = await Facility.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalReviews = await Booking.countDocuments({ review: { $exists: true, $ne: null } });

        // Calculate total revenue (assuming 10% platform fee)
        const allBookings = await Booking.find({ status: 'completed' });
        const totalRevenue = allBookings.reduce((sum, booking) => sum + (booking.totalAmount * 0.1), 0);

        // Get new users this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

        // Get active users (users with bookings in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsers = await User.countDocuments({
            _id: { $in: await Booking.distinct('user', { createdAt: { $gte: thirtyDaysAgo } }) }
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalFacilities,
                totalBookings,
                totalReviews,
                totalRevenue: Math.round(totalRevenue),
                newUsersThisMonth,
                activeUsers
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to load admin stats' });
    }
});

// Get all users for management
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Failed to load users' });
    }
});

// Ban/Unban user
router.patch('/users/:id/:action', async (req, res) => {
    try {
        const { id, action } = req.params;

        if (!['ban', 'unban'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Invalid action' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Cannot ban admin users' });
        }

        const status = action === 'ban' ? 'banned' : 'active';
        user.status = status;
        await user.save();

        res.json({
            success: true,
            message: `User ${action}ed successfully`,
            user: { _id: user._id, fullName: user.fullName, email: user.email, status: user.status }
        });
    } catch (error) {
        console.error('Ban/Unban user error:', error);
        res.status(500).json({ success: false, message: 'Failed to update user status' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
        }

        // Delete user's bookings
        await Booking.deleteMany({ user: id });

        // Delete user's facilities if they're a facility owner
        if (user.role === 'facility_owner') {
            await Facility.deleteMany({ owner: id });
        }

        // Delete the user
        await User.findByIdAndDelete(id);

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

// Platform analytics endpoints
router.get('/platform-stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFacilities = await Facility.countDocuments();
        const totalBookings = await Booking.countDocuments();

        // Calculate total revenue
        const allBookings = await Booking.find({ status: 'completed' });
        const totalRevenue = allBookings.reduce((sum, booking) => sum + (booking.totalAmount * 0.1), 0);

        // Get new users this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

        // Get active users
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsers = await User.countDocuments({
            _id: { $in: await Booking.distinct('user', { createdAt: { $gte: thirtyDaysAgo } }) }
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalFacilities,
                totalBookings,
                totalRevenue: Math.round(totalRevenue),
                newUsersThisMonth,
                activeUsers
            }
        });
    } catch (error) {
        console.error('Platform stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to load platform stats' });
    }
});

// User growth data (last 6 months)
router.get('/user-growth', async (req, res) => {
    try {
        const months = [];
        const currentDate = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });

            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const usersInMonth = await User.countDocuments({
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            });

            months.push({
                month: monthName,
                users: usersInMonth,
                growth: i === 5 ? 0 : Math.floor(Math.random() * 20) + 5 // Mock growth for now
            });
        }

        res.json({ success: true, data: months });
    } catch (error) {
        console.error('User growth error:', error);
        res.status(500).json({ success: false, message: 'Failed to load user growth data' });
    }
});

// Booking trends (last 6 months)
router.get('/booking-trends', async (req, res) => {
    try {
        const months = [];
        const currentDate = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });

            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const bookingsInMonth = await Booking.countDocuments({
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            });

            const revenueInMonth = await Booking.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalAmount' }
                    }
                }
            ]);

            months.push({
                month: monthName,
                bookings: bookingsInMonth,
                revenue: Math.round((revenueInMonth[0]?.total || 0) * 0.1) // 10% platform fee
            });
        }

        res.json({ success: true, data: months });
    } catch (error) {
        console.error('Booking trends error:', error);
        res.status(500).json({ success: false, message: 'Failed to load booking trends' });
    }
});

// Revenue analytics (last 6 months)
router.get('/revenue-analytics', async (req, res) => {
    try {
        const months = [];
        const currentDate = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });

            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const revenueInMonth = await Booking.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalAmount' }
                    }
                }
            ]);

            const totalRevenue = (revenueInMonth[0]?.total || 0) * 0.1; // 10% platform fee
            const profit = totalRevenue * 0.7; // Assume 70% profit margin

            months.push({
                month: monthName,
                revenue: Math.round(totalRevenue),
                profit: Math.round(profit)
            });
        }

        res.json({ success: true, data: months });
    } catch (error) {
        console.error('Revenue analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to load revenue analytics' });
    }
});

// Sports analytics
router.get('/sports-analytics', async (req, res) => {
    try {
        const sportsData = await Facility.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);

        // Mock revenue data for now
        const sportsWithRevenue = sportsData.map(sport => ({
            sport: sport._id || 'Unknown',
            bookings: Math.floor(Math.random() * 500) + 100,
            revenue: Math.floor(Math.random() * 100000) + 20000
        }));

        res.json({ success: true, data: sportsWithRevenue });
    } catch (error) {
        console.error('Sports analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to load sports analytics' });
    }
});

// Facility statistics
router.get('/facility-stats', async (req, res) => {
    try {
        const facilities = await Facility.find()
            .populate('owner', 'fullName')
            .sort({ rating: -1 })
            .limit(5);

        const facilityStats = facilities.map(facility => ({
            name: facility.name,
            bookings: Math.floor(Math.random() * 300) + 50, // Mock data for now
            rating: facility.rating || 4.0,
            revenue: Math.floor(Math.random() * 100000) + 20000 // Mock data for now
        }));

        res.json({ success: true, data: facilityStats });
    } catch (error) {
        console.error('Facility stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to load facility statistics' });
    }
});

module.exports = router;
