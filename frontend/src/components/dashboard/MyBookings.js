import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Star, X, MessageSquare, Calendar, Clock, MapPin, User } from 'lucide-react';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [reviewData, setReviewData] = useState({ rating: 0, review: '' });

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const res = await axios.get('/api/bookings/mine');
            if (res.data.success) {
                setBookings(res.data.bookings);
            }
        } catch (error) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    // Check if booking can be cancelled (at least 1 hour before start time)
    const canCancelBooking = (booking) => {
        if (booking.status === 'cancelled') return false;

        const now = new Date();
        const bookingStart = new Date(booking.startTime);
        const oneHourBefore = new Date(bookingStart.getTime() - 60 * 60 * 1000);

        return now < oneHourBefore;
    };

    // Check if booking can be reviewed (after the booking date)
    const canReviewBooking = (booking) => {
        if (booking.rating) return false; // Already reviewed

        const now = new Date();
        const bookingStart = new Date(booking.startTime);

        return now >= bookingStart;
    };

    // Check if booking is in the past
    const isPastBooking = (booking) => {
        const now = new Date();
        const bookingStart = new Date(booking.startTime);
        return now > bookingStart;
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            const res = await axios.patch(`/api/bookings/${bookingId}/cancel`);
            if (res.data.success) {
                toast.success('Booking cancelled successfully');
                loadBookings(); // Reload bookings
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const handleReviewSubmit = async () => {
        if (!reviewData.rating) {
            toast.error('Please select a rating');
            return;
        }

        try {
            const res = await axios.patch(`/api/bookings/${selectedBooking._id}/review`, reviewData);
            if (res.data.success) {
                toast.success('Review submitted successfully');
                setShowReviewModal(false);
                setSelectedBooking(null);
                setReviewData({ rating: 0, review: '' });
                loadBookings(); // Reload bookings
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    };

    const openReviewModal = (booking) => {
        setSelectedBooking(booking);
        setShowReviewModal(true);
    };

    const renderStars = (rating, interactive = false, onStarClick = null) => {
        return (
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type={interactive ? "button" : undefined}
                        onClick={interactive ? () => onStarClick(star) : undefined}
                        className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
                        disabled={!interactive}
                    >
                        <Star
                            className={`w-5 h-5 ${star <= rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                                }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-xl">Loading your bookings...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-gray-600 mt-2">View and manage all your venue bookings</p>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                    <p className="text-gray-600">You haven't made any venue bookings yet. Start exploring venues to make your first booking!</p>
                    <button
                        onClick={() => window.location.href = '/dashboard/venues'}
                        className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                    >
                        Explore Venues
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {booking.facility?.name || 'Venue'}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                            {getStatusText(booking.status)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500">Date</p>
                                                <p className="font-medium">{formatDate(booking.startTime)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500">Time</p>
                                                <p className="font-medium">
                                                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Duration</p>
                                            <p className="font-medium">
                                                {Math.round((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60))} hours
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Amount</p>
                                            <p className="font-medium text-green-600">₹{booking.amount}</p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                                            <span className="flex items-center space-x-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{booking.facility?.address?.line1}, {booking.facility?.address?.city}</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <User className="w-4 h-4" />
                                                <span>{booking.sport}</span>
                                            </span>
                                        </div>

                                        {/* Review Section */}
                                        {booking.rating && (
                                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Your Review:</span>
                                                    {renderStars(booking.rating)}
                                                </div>
                                                {booking.review && (
                                                    <p className="text-sm text-gray-600">{booking.review}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2">
                                            {canCancelBooking(booking) && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking._id)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>Cancel Booking</span>
                                                </button>
                                            )}

                                            {canReviewBooking(booking) && (
                                                <button
                                                    onClick={() => openReviewModal(booking)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span>Write Review</span>
                                                </button>
                                            )}

                                            {!canCancelBooking(booking) && booking.status !== 'cancelled' && !isPastBooking(booking) && (
                                                <span className="text-sm text-gray-500 px-4 py-2">
                                                    Cancellation available until 1 hour before booking
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Review {selectedBooking.facility?.name}</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            {renderStars(reviewData.rating, true, (rating) => setReviewData({ ...reviewData, rating }))}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Review (Optional)</label>
                            <textarea
                                value={reviewData.review}
                                onChange={(e) => setReviewData({ ...reviewData, review: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="3"
                                placeholder="Share your experience..."
                                maxLength="500"
                            />
                            <p className="text-xs text-gray-500 mt-1">{reviewData.review.length}/500 characters</p>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setSelectedBooking(null);
                                    setReviewData({ rating: 0, review: '' });
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReviewSubmit}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
