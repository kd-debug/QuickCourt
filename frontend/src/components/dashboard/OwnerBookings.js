import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User, MapPin, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const OwnerBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const res = await axios.get('/api/users/owner-bookings');
            if (res.data.success) {
                setBookings(res.data.bookings);
            }
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-blue-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        return booking.status === filter;
    });

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
                    <p className="text-gray-600">Manage and view all bookings for your facilities</p>
                </div>
                <div className="text-sm text-gray-500">
                    Total: {bookings.length} bookings
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 p-1">
                <div className="flex space-x-1">
                    {[
                        { key: 'all', label: 'All Bookings', count: bookings.length },
                        { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
                        { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
                        { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
                    ].map(({ key, label, count }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === key
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            {label}
                            <span className="ml-2 px-2 py-1 text-xs bg-white bg-opacity-20 rounded-full">
                                {count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings List */}
            <div className="bg-white rounded-lg border border-gray-200">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-500">
                            {filter === 'all'
                                ? 'No bookings have been made for your facilities yet.'
                                : `No ${filter} bookings found.`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredBookings.map((booking) => (
                            <div key={booking._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="flex items-center space-x-2">
                                                {getStatusIcon(booking.status)}
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                Booking ID: {booking._id.slice(-8)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {/* User Info */}
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {booking.user?.fullName || 'Unknown User'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {booking.user?.email || 'No email'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Facility Info */}
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {booking.facility?.name || 'Unknown Facility'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 capitalize">
                                                        {booking.facility?.category || 'Unknown Sport'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Date & Time */}
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {formatDate(booking.startTime)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Duration & Price */}
                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {booking.duration} hour{booking.duration > 1 ? 's' : ''}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        ₹{booking.totalAmount || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-sm text-gray-500">
                                                        Booked on: {formatDate(booking.createdAt)}
                                                    </span>
                                                    {booking.rating && (
                                                        <div className="flex items-center space-x-1">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                            <span className="text-sm text-gray-600">
                                                                {booking.rating}/5
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        ₹{booking.totalAmount || 0}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Total Amount</p>
                                                </div>
                                            </div>

                                            {/* Review */}
                                            {booking.review && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-700 italic">
                                                        "{booking.review}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerBookings;
