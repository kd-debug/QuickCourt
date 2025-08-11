import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, Users, Settings, BookOpen, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';
import VenuesCarousel from './VenuesCarousel';
import PopularSports from './PopularSports';

const DashboardHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ activeBookings: 0, totalBookings: 0, favoriteCount: 0, myFacilities: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await axios.get('/api/users/stats');
                setStats(res.data.stats);
            } catch (e) {
                setStats({ activeBookings: 0, totalBookings: 0, favoriteCount: 0, myFacilities: 0 });
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const getQuickActions = () => {
        switch (user?.role) {
            case 'admin':
                return [
                    { icon: Users, label: 'User Management', href: '/dashboard/users', color: 'bg-blue-500' },
                    { icon: Settings, label: 'System Settings', href: '/dashboard/settings', color: 'bg-purple-500' },
                    { icon: TrendingUp, label: 'Analytics', href: '/dashboard/analytics', color: 'bg-green-500' }
                ];
            case 'facility_owner':
                return [
                    { icon: MapPin, label: 'My Facilities', href: '/dashboard/facilities', color: 'bg-indigo-500' },
                    { icon: Calendar, label: 'Bookings', href: '/dashboard/bookings', color: 'bg-orange-500' },
                    { icon: TrendingUp, label: 'Revenue', href: '/dashboard/revenue', color: 'bg-green-500' }
                ];
            default:
                return [
                    { icon: Calendar, label: 'My Bookings', href: '/dashboard/bookings', color: 'bg-blue-500' },
                    { icon: MapPin, label: 'Find Venues', href: '/dashboard/venues', color: 'bg-indigo-500' },
                    { icon: BookOpen, label: 'Booking History', href: '/dashboard/history', color: 'bg-purple-500' }
                ];
        }
    };

    const buildStatsCards = () => {
        if (user?.role === 'admin') {
            // Placeholder zeros for admin; could be extended for admin stats
            return [
                { label: 'Total Users', value: 0, icon: Users, color: 'text-blue-600' },
                { label: 'Active Facilities', value: 0, icon: MapPin, color: 'text-green-600' },
                { label: 'Total Bookings', value: 0, icon: Calendar, color: 'text-purple-600' }
            ];
        }

        if (user?.role === 'facility_owner') {
            return [
                { label: 'My Facilities', value: stats.myFacilities || 0, icon: MapPin, color: 'text-indigo-600' },
                { label: "Today's Bookings", value: stats.activeBookings || 0, icon: Calendar, color: 'text-orange-600' },
                { label: 'Total Bookings', value: stats.totalBookings || 0, icon: TrendingUp, color: 'text-green-600' }
            ];
        }

        return [
            { label: 'Active Bookings', value: stats.activeBookings || 0, icon: Calendar, color: 'text-blue-600' },
            { label: 'Total Bookings', value: stats.totalBookings || 0, icon: BookOpen, color: 'text-indigo-600' },
            { label: 'Favorite Courts', value: stats.favoriteCount || 0, icon: MapPin, color: 'text-purple-600' }
        ];
    };

    return (
        user?.role === 'user' ? (
            <div className="min-h-screen flex flex-col bg-secondary-50">
                {/* Top Bar */}
                <div className="bg-white border-b border-secondary-100 px-6 py-4 flex items-center justify-between">

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
                        {/* Optionally add a search bar here */}
                    </div>

                    {/* Book Venues Carousel */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Book Venues</h2>
                            <a href="/dashboard/venues" className="text-primary-600 hover:underline text-sm">See all venues &rarr;</a>
                        </div>
                        <VenuesCarousel />
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
        ) : (
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
                                <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {getQuickActions().map((action, index) => (
                            <button key={index} className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group">
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
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                            <div className="p-2 rounded-full bg-blue-100">
                                <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{user?.role === 'facility_owner' ? 'No bookings yet' : 'Account created successfully'}</p>
                                <p className="text-xs text-gray-500">Just now</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default DashboardHome;
