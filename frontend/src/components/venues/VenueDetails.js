import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, MessageSquare, Calendar, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Rating = ({ value = 0, count = 0 }) => (
    <div className="flex items-center text-sm text-yellow-600">
        <span className="mr-1">★</span>
        <span className="font-medium">{Number(value || 0).toFixed(1)}</span>
        {count ? <span className="text-gray-500 ml-1">({count})</span> : null}
    </div>
);

const StarRating = ({ rating }) => {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                        }`}
                />
            ))}
        </div>
    );
};

const VenueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [facility, setFacility] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get(`/api/facilities/${id}`);
                setFacility(res.data.facility || null);
            } catch (e) {
                setFacility(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    useEffect(() => {
        const loadReviews = async () => {
            try {
                const res = await axios.get(`/api/bookings/facility/${id}/reviews`);
                if (res.data.success) {
                    setReviews(res.data.reviews);
                    setAverageRating(res.data.averageRating);
                    setTotalReviews(res.data.totalReviews);
                }
            } catch (error) {
                console.error('Failed to load reviews:', error);
                setReviews([]);
                setAverageRating(0);
                setTotalReviews(0);
            } finally {
                setReviewsLoading(false);
            }
        };
        loadReviews();
    }, [id]);

    useEffect(() => {
        const checkFavorite = async () => {
            try {
                const res = await axios.get('/api/users/favorites');
                if (res.data.success) {
                    const favoriteIds = res.data.favorites.map(fav => fav._id);
                    setIsFavorite(favoriteIds.includes(id));
                }
            } catch (error) {
                console.error('Failed to check favorite status:', error);
            }
        };
        checkFavorite();
    }, [id]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const toggleFavorite = async () => {
        try {
            const res = await axios.patch(`/api/users/favorites/${id}`);
            if (res.data.success) {
                setIsFavorite(res.data.isFavorite);
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to update favorites');
        }
    };

    if (loading) return <div className="p-6">Loading venue...</div>;
    if (!facility) return <div className="p-6">Venue not found.</div>;

    return (
        <div className="p-6 space-y-6">
            {/* Main Venue Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{facility.name}</h1>
                        <p className="text-sm text-gray-600">{facility.address?.line1}, {facility.address?.city}, {facility.address?.state}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleFavorite}
                            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
                        >
                            <Heart
                                className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                            />
                        </button>
                        <Rating value={averageRating} count={totalReviews} />
                    </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-lg border">
                    {Array.isArray(facility.images) && facility.images.length > 0 ? (
                        <img src={facility.images[0]} alt={`${facility.name}`} className="w-full h-72 object-cover" />
                    ) : (
                        <div className="w-full h-72 bg-secondary-100 flex items-center justify-center text-secondary-400">Images / Videos</div>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-6">
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {facility.category && <span className="px-3 py-1 rounded-full text-xs bg-primary-50 text-primary-700 border border-primary-100 capitalize">{facility.category}</span>}
                            {facility.sportType && <span className="px-3 py-1 rounded-full text-xs bg-secondary-50 text-secondary-700 border border-secondary-100 capitalize">{facility.sportType}</span>}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{facility.description || 'No description added.'}</p>
                    </div>
                    <aside className="space-y-3">
                        <button
                            onClick={() => navigate(`/dashboard/venues/${id}/book`, {
                                state: { sport: facility?.category }
                            })}
                            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
                        >
                            Book This Venue
                        </button>
                        <div className="p-4 border rounded-lg">
                            <div className="font-semibold mb-1">Open Hours</div>
                            <div className="text-sm text-gray-700">{facility.openHours?.open || '--'} - {facility.openHours?.close || '--'}</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="font-semibold mb-1">Address</div>
                            <div className="text-sm text-gray-700">
                                {facility.address?.line1}<br />
                                {facility.address?.city}, {facility.address?.state} - {facility.address?.pincode}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <MessageSquare className="w-6 h-6 text-gray-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                        {totalReviews > 0 && (
                            <span className="text-sm text-gray-500">({totalReviews} reviews)</span>
                        )}
                    </div>
                    {averageRating > 0 && (
                        <div className="flex items-center space-x-2">
                            <StarRating rating={Math.round(averageRating)} />
                            <span className="text-sm font-medium text-gray-700">
                                {averageRating.toFixed(1)} out of 5
                            </span>
                        </div>
                    )}
                </div>

                {reviewsLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews posted</h3>
                        <p className="text-gray-500">Be the first to review this venue after your booking!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review._id} className="border-b border-gray-100 pb-6 last:border-b-0">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold text-sm">
                                                {review.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {review.user?.fullName || 'Anonymous User'}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <StarRating rating={review.rating} />
                                                <span className="text-sm text-gray-500">
                                                    {review.rating} out of 5
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(review.reviewedAt)}</span>
                                    </div>
                                </div>
                                {review.review && (
                                    <p className="text-gray-700 leading-relaxed">{review.review}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VenueDetails;
