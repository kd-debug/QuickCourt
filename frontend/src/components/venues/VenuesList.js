import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, Filter, MapPin, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Rating = ({ value = 0, count = 0 }) => (
    <div className="flex items-center text-sm text-yellow-600">
        <span className="mr-1">★</span>
        <span className="font-medium">{Number(value || 0).toFixed(1)}</span>
        {count ? <span className="text-gray-500 ml-1">({count})</span> : null}
    </div>
);

const VenuesList = () => {
    const { user } = useAuth();
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [priceRange, setPriceRange] = useState([100, 2000]);
    const [ratingFilter, setRatingFilter] = useState('all');

    // Debounced search term
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    // Debounced price range
    const [debouncedPriceRange, setDebouncedPriceRange] = useState([100, 2000]);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Debounce price range
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedPriceRange(priceRange);
        }, 1000); // 1 second delay for price range

        return () => clearTimeout(timer);
    }, [priceRange]);

    useEffect(() => {
        loadFacilities();
    }, [debouncedSearchTerm, categoryFilter, typeFilter, debouncedPriceRange, ratingFilter]);

    const loadFacilities = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (debouncedSearchTerm) params.append('q', debouncedSearchTerm);
            if (categoryFilter !== 'all') params.append('category', categoryFilter);
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (debouncedPriceRange[0] > 100) params.append('minPrice', debouncedPriceRange[0]);
            if (debouncedPriceRange[1] < 2000) params.append('maxPrice', debouncedPriceRange[1]);
            if (ratingFilter !== 'all') params.append('minRating', ratingFilter);

            const res = await axios.get(`/api/facilities?${params.toString()}`);
            setFacilities(res.data.facilities || []);
        } catch (e) {
            setFacilities([]);
        } finally {
            setLoading(false);
        }
    };

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

    const toggleFavorite = async (facilityId, e) => {
        e.stopPropagation(); // Prevent card click
        if (user?.role !== 'user') return;

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

    const handlePriceRangeChange = (e, index) => {
        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
        const newRange = [...priceRange];
        newRange[index] = value;
        setPriceRange(newRange);
    };

    const handleRatingFilter = (rating) => {
        setRatingFilter(ratingFilter === rating ? 'all' : rating);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('all');
        setTypeFilter('all');
        setPriceRange([100, 2000]);
        setRatingFilter('all');
    };

    if (loading) {
        return <div className="p-6">Loading venues...</div>;
    }

    return (
        <div className="p-6">
            {/* Header with Filter Toggle */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Find Venues</h2>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Filter className="w-4 h-4" />
                    Filters
                </button>
            </div>

            <div className="flex gap-6">
                {/* Filter Sidebar */}
                {showFilters && (
                    <div className="w-80 bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Filters</h3>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-primary-600 hover:text-primary-700"
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Search by venue name */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search by venue name</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search venues..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Filter by sport type */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by sport type</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Sports</option>
                                <option value="table tennis">Table Tennis</option>
                                <option value="tennis">Tennis</option>
                                <option value="badminton">Badminton</option>
                                <option value="cricket">Cricket</option>
                                <option value="swimming pool">Swimming Pool</option>
                                <option value="football">Football</option>
                                <option value="basketball">Basketball</option>
                            </select>
                        </div>

                        {/* Price range */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price range (per hour)</label>
                            <div className="space-y-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={priceRange[0]}
                                    onChange={(e) => handlePriceRangeChange(e, 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={priceRange[1]}
                                    onChange={(e) => handlePriceRangeChange(e, 1)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Choose Venue Type */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Choose Venue Type</label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="all"
                                        checked={typeFilter === 'all'}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="mr-2"
                                    />
                                    All Types
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="indoor"
                                        checked={typeFilter === 'indoor'}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="mr-2"
                                    />
                                    Indoor
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="outdoor"
                                        checked={typeFilter === 'outdoor'}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="mr-2"
                                    />
                                    Outdoor
                                </label>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <label key={rating} className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={ratingFilter === rating.toString()}
                                            onChange={() => handleRatingFilter(rating.toString())}
                                            className="mr-2"
                                        />
                                        <div className="flex items-center">
                                            {[...Array(rating)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                            ))}
                                            <span className="ml-1 text-sm text-gray-600">& up</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Confirm Button */}
                        <button
                            onClick={() => setShowFilters(false)}
                            className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                            Confirm
                        </button>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1">
                    {facilities.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No venues found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {facilities.map((f) => {
                                const isTopRated = (f.rating || 0) >= 4.5 && (f.ratingCount || 0) >= 5;
                                const isBudget = typeof f.pricePerHour === 'number' && f.pricePerHour <= 500;
                                const isFavorite = favorites.has(f._id);

                                return (
                                    <div key={f._id} className="relative card p-0 overflow-hidden group cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/dashboard/venues/${f._id}`)}>
                                        {/* Favorite Button */}
                                        {user?.role === 'user' && (
                                            <button
                                                onClick={(e) => toggleFavorite(f._id, e)}
                                                className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${isFavorite
                                                    ? 'bg-red-500 text-white shadow-lg'
                                                    : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
                                                    }`}
                                            >
                                                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                                            </button>
                                        )}

                                        {Array.isArray(f.images) && f.images.length > 0 ? (
                                            <img src={f.images[0]} alt={`${f.name} image`} className="h-48 w-full object-cover" />
                                        ) : (
                                            <div className="h-48 w-full bg-secondary-100 flex items-center justify-center text-secondary-400">Image</div>
                                        )}
                                        <div className="p-4 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{f.name}</h3>
                                                    <p className="text-sm text-gray-600">{f.address?.city}, {f.address?.state}</p>
                                                </div>
                                                <Rating value={f.rating || 0} count={f.ratingCount || 0} />
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {f.category && <span className="px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700 border border-primary-100 capitalize">{f.category}</span>}
                                                {f.sportType && <span className="px-2 py-1 text-xs rounded-full bg-secondary-50 text-secondary-700 border border-secondary-100 capitalize">{f.sportType}</span>}
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex gap-2">
                                                    {isTopRated && <span className="px-2 py-1 text-xs rounded-md bg-yellow-50 text-yellow-700 border border-yellow-100">Top Rated</span>}
                                                    {isBudget && <span className="px-2 py-1 text-xs rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">Budget</span>}
                                                </div>
                                                <div className="text-sm font-semibold">₹{f.pricePerHour}/hr</div>
                                            </div>
                                            <div className="mt-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/dashboard/venues/${f._id}`);
                                                    }}
                                                    className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VenuesList;
