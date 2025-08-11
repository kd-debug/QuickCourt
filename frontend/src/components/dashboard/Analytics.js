import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, DollarSign, Star, MapPin } from 'lucide-react';
import axios from 'axios';

const Analytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState({
        revenue: [],
        bookings: [],
        sports: [],
        facilities: [],
        monthlyStats: [],
        topFacilities: []
    });

    console.log('Analytics component rendered, user:', user);

    useEffect(() => {
        console.log('Analytics useEffect triggered, user role:', user?.role);
        if (user?.role === 'facility_owner') {
            loadAnalytics();
        } else {
            console.log('User is not facility owner, setting loading to false');
            setLoading(false);
        }
    }, [user]);

    const loadAnalytics = async () => {
        console.log('Loading analytics...');
        try {
            setLoading(true);

            // Load owner bookings for analytics
            const bookingsRes = await axios.get('/api/users/owner-bookings');
            console.log('Bookings response:', bookingsRes.data);
            const bookings = bookingsRes.data.success ? bookingsRes.data.bookings : [];

            // Load facilities
            const facilitiesRes = await axios.get('/api/facilities/mine');
            console.log('Facilities response:', facilitiesRes.data);
            const facilities = facilitiesRes.data.success ? facilitiesRes.data.facilities : [];

            // Process data for charts
            const processedData = processAnalyticsData(bookings, facilities);
            console.log('Processed data:', processedData);
            setAnalyticsData(processedData);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const processAnalyticsData = (bookings, facilities) => {
        // Revenue by month (last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const revenue = months.map(month => ({
            month,
            revenue: Math.floor(Math.random() * 50000) + 10000, // Mock data for now
            bookings: Math.floor(Math.random() * 100) + 20
        }));

        // Bookings by status
        const statusCounts = {};
        bookings.forEach(booking => {
            statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
        });
        const bookingsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
            status: status.charAt(0).toUpperCase() + status.slice(1),
            count,
            fill: getStatusColor(status)
        }));

        // Sports popularity
        const sportsCounts = {};
        facilities.forEach(facility => {
            const sport = facility.category || 'Unknown';
            sportsCounts[sport] = (sportsCounts[sport] || 0) + 1;
        });
        const sportsData = Object.entries(sportsCounts).map(([sport, count]) => ({
            sport,
            count,
            fill: getRandomColor()
        }));

        // Monthly stats
        const monthlyStats = months.map(month => ({
            month,
            revenue: Math.floor(Math.random() * 50000) + 10000,
            bookings: Math.floor(Math.random() * 100) + 20,
            facilities: facilities.length
        }));

        // Top performing facilities
        const topFacilities = facilities.slice(0, 5).map(facility => ({
            name: facility.name,
            revenue: Math.floor(Math.random() * 20000) + 5000,
            bookings: Math.floor(Math.random() * 50) + 10,
            rating: (Math.random() * 2 + 3).toFixed(1)
        }));

        return {
            revenue,
            bookings: bookingsByStatus,
            sports: sportsData,
            facilities: facilities,
            monthlyStats,
            topFacilities
        };
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#F59E0B',
            confirmed: '#10B981',
            completed: '#3B82F6',
            cancelled: '#EF4444'
        };
        return colors[status] || '#6B7280';
    };

    const getRandomColor = () => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading analytics...</p>
                </div>
            </div>
        );
    }

    // Fallback display if no data
    if (!analyticsData.facilities || analyticsData.facilities.length === 0) {
        return (
            <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
                    <p className="text-primary-100">Track your facility performance and business insights</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-center py-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                        <p className="text-gray-500">You need to add facilities first to see analytics data.</p>
                        <button
                            onClick={() => window.location.href = '/dashboard/facilities'}
                            className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                        >
                            Add Your First Facility
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-primary-100">Track your facility performance and business insights</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(analyticsData.monthlyStats.reduce((sum, item) => sum + item.revenue, 0))}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {analyticsData.monthlyStats.reduce((sum, item) => sum + item.bookings, 0)}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Facilities</p>
                            <p className="text-2xl font-bold text-gray-900">{analyticsData.facilities.length}</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100">
                            <MapPin className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {analyticsData.topFacilities.length > 0
                                    ? (analyticsData.topFacilities.reduce((sum, f) => sum + parseFloat(f.rating), 0) / analyticsData.topFacilities.length).toFixed(1)
                                    : '0.0'
                                }
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-yellow-100">
                            <Star className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Data Display */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Bookings by Status</h4>
                        <div className="space-y-2">
                            {analyticsData.bookings.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-600">{item.status}</span>
                                    <span className="font-semibold text-gray-900">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Sports Popularity</h4>
                        <div className="space-y-2">
                            {analyticsData.sports.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-600 capitalize">{item.sport}</span>
                                    <span className="font-semibold text-gray-900">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {analyticsData.topFacilities.map((facility, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-primary-600">
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
                                        {formatCurrency(facility.revenue)}
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Insights & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Revenue Growth</h4>
                        <p className="text-sm text-blue-700">
                            Your revenue has been steadily increasing. Consider adding more facilities or expanding operating hours.
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Popular Sports</h4>
                        <p className="text-sm text-blue-700">
                            Focus on your most popular sports categories to maximize bookings and revenue.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
