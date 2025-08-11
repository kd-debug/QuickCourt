import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, BarChart3, Building, Clock, User, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react';
import axios from 'axios';
import VenuesCarousel from './VenuesCarousel';
import PopularSports from './PopularSports';

const DashboardHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalBookings: 0, todayBookings: 0, totalFacilities: 0 });
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        loadStats();
        if (user?.role === 'facility_owner' || user?.role === 'admin') {
            loadRecentActivities();
        }
    }, [user]);

    const loadStats = async () => {
        try {
            setLoading(true);
            let statsRes;

            if (user?.role === 'admin') {
                // Load admin stats
                statsRes = await axios.get('/api/admin/stats');
            } else {
                // Load user stats
                statsRes = await axios.get('/api/users/stats');
            }

            if (statsRes.data.success) {
                setStats(statsRes.data.stats);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRecentActivities = async () => {
        try {
            if (user?.role === 'admin') {
                // Load admin recent activities
                const [usersRes, facilitiesRes, bookingsRes] = await Promise.all([
                    axios.get('/api/admin/users'),
                    axios.get('/api/facilities'),
                    axios.get('/api/bookings')
                ]);

                const activities = [];

                // Add recent user registrations
                if (usersRes.data.success) {
                    const recentUsers = usersRes.data.users.slice(0, 3);
                    recentUsers.forEach(userItem => {
                        activities.push({
                            id: userItem._id,
                            type: 'user_registration',
                            status: 'completed',
                            user: userItem.fullName,
                            facility: null,
                            date: new Date(userItem.createdAt),
                            amount: 0,
                            description: `New ${userItem.role.replace('_', ' ')} registered`
                        });
                    });
                }

                // Add recent facility additions
                if (facilitiesRes.data.success) {
                    const recentFacilities = facilitiesRes.data.facilities.slice(0, 2);
                    recentFacilities.forEach(facility => {
                        activities.push({
                            id: facility._id,
                            type: 'facility_added',
                            status: 'completed',
                            user: facility.owner?.fullName || 'Unknown Owner',
                            facility: facility.name,
                            date: new Date(facility.createdAt),
                            amount: 0,
                            description: `New facility "${facility.name}" added`
                        });
                    });
                }

                // Add recent bookings
                if (bookingsRes.data.success) {
                    const recentBookings = bookingsRes.data.bookings.slice(0, 2);
                    recentBookings.forEach(booking => {
                        activities.push({
                            id: booking._id,
                            type: 'booking',
                            status: booking.status,
                            user: booking.user?.fullName || 'Unknown User',
                            facility: booking.facility?.name || 'Unknown Facility',
                            date: new Date(booking.createdAt),
                            amount: booking.totalAmount || 0,
                            description: `Booking for ${booking.facility?.name || 'Unknown Facility'}`
                        });
                    });
                }

                // Sort by date and take top 5
                activities.sort((a, b) => b.date - a.date);
                setRecentActivities(activities.slice(0, 5));
            } else if (user?.role === 'facility_owner') {
                // Load owner recent activities (existing logic)
                const res = await axios.get('/api/users/owner-bookings');
                if (res.data.success) {
                    const activities = res.data.bookings.slice(0, 5).map(booking => ({
                        id: booking._id,
                        type: 'booking',
                        status: booking.status,
                        user: booking.user?.fullName || 'Unknown User',
                        facility: booking.facility?.name || 'Unknown Facility',
                        date: new Date(booking.createdAt),
                        amount: booking.totalAmount || 0,
                        description: `Booking for ${booking.facility?.name || 'Unknown Facility'}`
                    }));
                    setRecentActivities(activities);
                }
            } else {
                // Load regular user recent activities
                const res = await axios.get('/api/users/my-bookings');
                if (res.data.success) {
                    const activities = res.data.bookings.slice(0, 5).map(booking => ({
                        id: booking._id,
                        type: 'booking',
                        status: booking.status,
                        user: booking.user?.fullName || 'Unknown User',
                        facility: booking.facility?.name || 'Unknown Facility',
                        date: new Date(booking.createdAt),
                        amount: booking.totalAmount || 0,
                        description: `Booking for ${booking.facility?.name || 'Unknown Facility'}`
                    }));
                    setRecentActivities(activities);
                }
            }
        } catch (error) {
            console.error('Failed to load recent activities:', error);
        }
    };

    const getQuickActions = () => {
        if (user?.role === 'admin') {
            return [
                { label: 'User Management', href: '/dashboard/user-management', icon: MapPin, color: 'bg-blue-500' },
                { label: 'Platform Analytics', href: '/dashboard/platform-analytics', icon: BarChart3, color: 'bg-green-500' }
            ];
        } else if (user?.role === 'facility_owner') {
            return [
                { label: 'My Facilities', href: '/dashboard/facilities', icon: Building, color: 'bg-purple-500' },
                { label: 'Bookings', href: '/dashboard/owner-bookings', icon: Calendar, color: 'bg-orange-500' },
                { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, color: 'bg-green-500' }
            ];
        }
        return [
            { label: 'Find Venues', href: '/dashboard/venues', icon: MapPin, color: 'bg-blue-500' },
            { label: 'My Bookings', href: '/dashboard/my-bookings', icon: Calendar, color: 'bg-green-500' },
            { label: 'Profile', href: '/dashboard/profile', icon: User, color: 'bg-purple-500' }
        ];
    };

    const buildStatsCards = () => {
        console.log('Building stats cards for user role:', user?.role);
        console.log('Current stats:', stats);

        if (user?.role === 'admin') {
            const adminStats = [
                { label: 'Total Bookings', value: stats.totalBookings || 0, icon: Calendar, color: 'bg-blue-100' },
                { label: 'Total Reviews', value: stats.totalReviews || 0, icon: Star, color: 'bg-yellow-100' },
                { label: 'Total Users', value: stats.totalUsers || 0, icon: MapPin, color: 'bg-purple-100' }
            ];
            console.log('Admin stats cards:', adminStats);
            return adminStats;
        } else if (user?.role === 'facility_owner') {
            const ownerStats = [
                { label: 'My Facilities', value: stats.totalFacilities || 0, icon: Building, color: 'bg-purple-100' },
                { label: "Today's Bookings", value: stats.todayBookings || 0, icon: Calendar, color: 'bg-orange-100' },
                { label: 'Total Bookings', value: stats.totalBookings || 0, icon: BarChart3, color: 'bg-green-100' }
            ];
            console.log('Facility owner stats cards:', ownerStats);
            return ownerStats;
        }
        const userStats = [
            { label: 'Total Bookings', value: stats.totalBookings || 0, icon: Calendar, color: 'bg-blue-100' },
            { label: 'Favorite Venues', value: stats.favoriteCount || 0, icon: MapPin, color: 'bg-red-100' },
            { label: 'Reviews Given', value: stats.reviewsGiven || 0, icon: User, color: 'bg-purple-500' }
        ];
        console.log('User stats cards:', userStats);
        return userStats;
    };

    const getStatusIcon = (status, type) => {
        if (type === 'user_registration') {
            return <User className="w-4 h-4 text-blue-600" />;
        } else if (type === 'facility_added') {
            return <Building className="w-4 h-4 text-green-600" />;
        }

        switch (status) {
            case 'confirmed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-blue-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-yellow-600" />;
        }
    };

    const getStatusColor = (status, type) => {
        if (type === 'user_registration') {
            return 'bg-blue-100';
        } else if (type === 'facility_added') {
            return 'bg-green-100';
        }

        switch (status) {
            case 'confirmed':
                return 'bg-green-100';
            case 'cancelled':
                return 'bg-red-100';
            case 'completed':
                return 'bg-blue-100';
            default:
                return 'bg-yellow-100';
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
    };

    if (user?.role === 'user') {
        return (
            <div className="flex flex-col h-screen">
                {/* Top Bar */}
                <div className="bg-white border-b border-secondary-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-lg">QUICKCOURT</span>
                        <span className="ml-4 flex items-center bg-secondary-100 px-3 py-1 rounded-full">
                            <span className="text-xs text-secondary-700 mr-2">📍</span>
                            <span className="text-sm font-medium">Ahmedabad</span>
                        </span>
                    </div>
                    <div>
                        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium">Book</button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 px-6 py-8 space-y-8">
                    {/* Find Players & Venues Nearby */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-xl font-bold mb-2">Find Players & Venues Nearby</h2>
                        <p className="text-gray-600 mb-4">Seamlessly explore sports venues and play with sports enthusiasts just like you!</p>
                    </div>

                    {/* Book Venues Carousel + Categories */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Book Venues</h2>
                            <a href="/dashboard/venues" className="text-primary-600 hover:underline text-sm">See all venues &rarr;</a>
                        </div>

                        {/* Category chips */}
                        <CategoryFilter />
                    </div>

                    {/* Popular Sports */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4">Popular Sports</h2>
                        <PopularSports />
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-secondary-900 text-white py-8 mt-auto">
                    <div className="text-center text-secondary-400">
                        &copy; 2024 QuickCourt. All rights reserved.
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋</h1>
                <p className="text-primary-100">Ready to make some moves? Here's what's happening with your QuickCourt account.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {buildStatsCards().map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{loading ? '—' : stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.color}`}>
                                <stat.icon className="w-6 h-6 text-gray-600" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getQuickActions().map((action, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(action.href)}
                            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
                        >
                            <div className={`p-2 rounded-lg ${action.color} text-white`}>
                                <action.icon className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                                <div className={`p-2 rounded-full ${getStatusColor(activity.status, activity.type)}`}>
                                    {getStatusIcon(activity.status, activity.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {activity.type === 'booking' ? `₹${activity.amount} • ` : ''}{formatTimeAgo(activity.date)}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status, activity.type)} text-gray-700 capitalize`}>
                                    {activity.type === 'user_registration' ? 'New User' :
                                        activity.type === 'facility_added' ? 'New Facility' :
                                            activity.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                            <div className="p-2 rounded-full bg-blue-100">
                                <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">No recent activity</p>
                                <p className="text-xs text-gray-500">Bookings will appear here</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;

// Helper component for category filter + carousel
const CategoryFilter = () => {
    const categories = ['all', 'cricket', 'badminton', 'basketball', 'football', 'tennis', 'table tennis', 'swimming pool'];
    const [active, setActive] = useState('all');

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <div className="flex gap-2 pb-2">
                    {categories.map((c) => (
                        <button
                            key={c}
                            onClick={() => setActive(c)}
                            className={`px-3 py-1 rounded-full text-sm border ${active === c ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-secondary-700 border-secondary-200'}`}
                        >
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <VenuesCarousel category={active === 'all' ? '' : active} />
        </div>
    );
};
