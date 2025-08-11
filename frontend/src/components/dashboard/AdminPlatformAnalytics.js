import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Users, Calendar, DollarSign, TrendingUp, MapPin, Star, Activity } from 'lucide-react';
import axios from 'axios';

const AdminPlatformAnalytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState({
        platformStats: {},
        userGrowth: [],
        bookingTrends: [],
        revenueData: [],
        topSports: [],
        facilityStats: []
    });

    useEffect(() => {
        if (user?.role === 'admin') {
            loadPlatformAnalytics();
        }
    }, [user]);

    const loadPlatformAnalytics = async () => {
        try {
            setLoading(true);

            // Load platform-wide analytics
            const statsRes = await axios.get('/api/admin/platform-stats');
            const userGrowthRes = await axios.get('/api/admin/user-growth');
            const bookingTrendsRes = await axios.get('/api/admin/booking-trends');
            const revenueRes = await axios.get('/api/admin/revenue-analytics');
            const sportsRes = await axios.get('/api/admin/sports-analytics');
            const facilitiesRes = await axios.get('/api/admin/facility-stats');

            setAnalyticsData({
                platformStats: statsRes.data.success ? statsRes.data.stats : {},
                userGrowth: userGrowthRes.data.success ? userGrowthRes.data.data : [],
                bookingTrends: bookingTrendsRes.data.success ? bookingTrendsRes.data.data : [],
                revenueData: revenueRes.data.success ? revenueRes.data.data : [],
                topSports: sportsRes.data.success ? sportsRes.data.data : [],
                facilityStats: facilitiesRes.data.success ? facilitiesRes.data.data : []
            });
        } catch (error) {
            console.error('Failed to load platform analytics:', error);
            // Use mock data for now
            setMockData();
        } finally {
            setLoading(false);
        }
    };

    const setMockData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const mockData = {
            platformStats: {
                totalUsers: 1250,
                totalFacilities: 89,
                totalBookings: 3456,
                totalRevenue: 1250000,
                activeUsers: 890,
                newUsersThisMonth: 45
            },
            userGrowth: months.map((month, index) => ({
                month,
                users: Math.floor(Math.random() * 200) + 100,
                growth: Math.floor(Math.random() * 20) + 5
            })),
            bookingTrends: months.map((month, index) => ({
                month,
                bookings: Math.floor(Math.random() * 500) + 200,
                revenue: Math.floor(Math.random() * 200000) + 100000
            })),
            revenueData: months.map((month, index) => ({
                month,
                revenue: Math.floor(Math.random() * 300000) + 150000,
                profit: Math.floor(Math.random() * 100000) + 50000
            })),
            topSports: [
                { sport: 'Badminton', bookings: 456, revenue: 89000 },
                { sport: 'Cricket', bookings: 389, revenue: 120000 },
                { sport: 'Football', bookings: 234, revenue: 67000 },
                { sport: 'Basketball', bookings: 198, revenue: 45000 },
                { sport: 'Tennis', bookings: 167, revenue: 38000 }
            ],
            facilityStats: [
                { name: 'Sports Hub Central', bookings: 234, rating: 4.8, revenue: 89000 },
                { name: 'Elite Sports Complex', bookings: 198, rating: 4.6, revenue: 76000 },
                { name: 'Community Ground', bookings: 167, rating: 4.4, revenue: 54000 },
                { name: 'Premium Courts', bookings: 145, rating: 4.7, revenue: 67000 },
                { name: 'Sports Arena', bookings: 123, rating: 4.5, revenue: 45000 }
            ]
        };
        setAnalyticsData(mockData);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getRandomColor = () => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading platform analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
                <p className="text-purple-100">Comprehensive insights into platform performance and user behavior</p>
            </div>

            {/* Key Platform Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.platformStats.totalUsers)}</p>
                            <p className="text-sm text-green-600">+{analyticsData.platformStats.newUsersThisMonth} this month</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Facilities</p>
                            <p className="text-2xl font-bold text-gray-900">{analyticsData.platformStats.totalFacilities}</p>
                            <p className="text-sm text-blue-600">Active venues</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100">
                            <MapPin className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.platformStats.totalBookings)}</p>
                            <p className="text-sm text-purple-600">All time</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.platformStats.totalRevenue)}</p>
                            <p className="text-sm text-green-600">Platform earnings</p>
                        </div>
                        <div className="p-3 rounded-full bg-yellow-100">
                            <DollarSign className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Trend */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analyticsData.userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatNumber(value)} />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#3B82F6"
                                fill="#3B82F6"
                                fillOpacity={0.3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Booking Trends */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analyticsData.bookingTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatNumber(value)} />
                            <Line
                                type="monotone"
                                dataKey="bookings"
                                stroke="#10B981"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Analytics */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Bar dataKey="revenue" fill="#8B5CF6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Sports Performance */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Sports Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.topSports} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="sport" type="category" width={80} />
                            <Tooltip formatter={(value) => formatNumber(value)} />
                            <Bar dataKey="bookings" fill="#F59E0B" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Performing Facilities */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Facilities</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {analyticsData.facilityStats.map((facility, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                                    <span className="text-white font-semibold text-sm">
                                                        {facility.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {facility.bookings}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                            <span className="text-sm text-gray-900">{facility.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(facility.revenue)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{ width: `${(facility.bookings / 250) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="ml-2 text-xs text-gray-500">
                                                {Math.round((facility.bookings / 250) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Platform Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Platform Insights & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">User Growth</h4>
                        <p className="text-sm text-blue-700">
                            User growth is steady. Consider implementing referral programs and social media campaigns to accelerate growth.
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Revenue Optimization</h4>
                        <p className="text-sm text-blue-700">
                            Focus on high-performing sports categories and facilities to maximize platform revenue and user satisfaction.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPlatformAnalytics;
