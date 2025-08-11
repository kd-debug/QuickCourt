import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Rating = ({ value = 0, count = 0 }) => (
    <div className="flex items-center text-sm text-yellow-600">
        <span className="mr-1">★</span>
        <span className="font-medium">{Number(value || 0).toFixed(1)}</span>
        {count ? <span className="text-gray-500 ml-1">({count})</span> : null}
    </div>
);

const VenueCard = ({ facility, favorites, onToggleFavorite }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isTopRated = (facility.rating || 0) >= 4.5 && (facility.ratingCount || 0) >= 5;
    const isBudget = typeof facility.pricePerHour === 'number' && facility.pricePerHour <= 500;
    const isFavorite = favorites.has(facility._id);

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        if (user?.role === 'user') {
            onToggleFavorite(facility._id);
        }
    };

    return (
        <button
            onClick={() => navigate(`/dashboard/venues/${facility._id}`)}
            className="text-left min-w-[320px] max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0 hover:shadow-md transition-shadow relative"
        >
            {/* Favorite Button */}
            {user?.role === 'user' && (
                <button
                    onClick={handleFavoriteClick}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${isFavorite
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
                        }`}
                >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
            )}

            {Array.isArray(facility.images) && facility.images.length > 0 ? (
                <img src={facility.images[0]} alt={facility.name} className="h-48 w-full object-cover" />
            ) : (
                <div className="h-48 w-full bg-secondary-100 flex items-center justify-center text-secondary-400">Image</div>
            )}
            <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-lg leading-tight">{facility.name}</h3>
                        <p className="text-sm text-gray-600">{facility.address?.city}, {facility.address?.state}</p>
                    </div>
                    <Rating value={facility.rating || 0} count={facility.ratingCount || 0} />
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                    {facility.category && (
                        <span className="px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700 border border-primary-100 capitalize">{facility.category}</span>
                    )}
                    {facility.sportType && (
                        <span className="px-2 py-1 text-xs rounded-full bg-secondary-50 text-secondary-700 border border-secondary-100 capitalize">{facility.sportType}</span>
                    )}
                </div>
                <div className="flex items-center justify-between mt-1">
                    <div className="flex gap-2">
                        {isTopRated && <span className="px-2 py-1 text-xs rounded-md bg-yellow-50 text-yellow-700 border border-yellow-100">Top Rated</span>}
                        {isBudget && <span className="px-2 py-1 text-xs rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">Budget</span>}
                    </div>
                    <div className="text-sm font-semibold">₹{facility.pricePerHour}/hr</div>
                </div>
            </div>
        </button>
    );
};

const VenuesCarousel = ({ category }) => {
    const { user } = useAuth();
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState(new Set());

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const query = category ? `?sport=${encodeURIComponent(category)}` : '';
                const res = await axios.get(`/api/facilities${query}`);
                setFacilities(res.data.facilities || []);
            } catch (e) {
                setFacilities([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [category]);

    useEffect(() => {
        if (user?.role === 'user') {
            loadFavorites();
        }
    }, [user]);

    const loadFavorites = async () => {
        try {
            const res = await axios.get('/api/users/favorites');
            if (res.data.success) {
                const favoriteIds = res.data.favorites.map(fav => fav._id);
                setFavorites(new Set(favoriteIds));
            }
        } catch (error) {
            console.error('Failed to load favorites:', error);
        }
    };

    const toggleFavorite = async (facilityId) => {
        try {
            const res = await axios.patch(`/api/users/favorites/${facilityId}`);
            if (res.data.success) {
                const newFavorites = new Set(favorites);
                if (res.data.isFavorite) {
                    newFavorites.add(facilityId);
                    toast.success('Added to favorites!');
                } else {
                    newFavorites.delete(facilityId);
                    toast.success('Removed from favorites!');
                }
                setFavorites(newFavorites);
            }
        } catch (error) {
            toast.error('Failed to update favorites');
        }
    };

    if (loading) {
        return <div className="p-6">Loading venues...</div>;
    }

    if (facilities.length === 0) {
        return <div className="p-6 text-gray-600">No venues available yet.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <div className="flex space-x-5 pb-2">
                {facilities.map((f) => (
                    <VenueCard
                        key={f._id}
                        facility={f}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                    />
                ))}
            </div>
        </div>
    );
};

export default VenuesCarousel;
