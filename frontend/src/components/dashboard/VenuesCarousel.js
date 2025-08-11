import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Rating = ({ value = 0, count = 0 }) => (
    <div className="flex items-center text-sm text-yellow-600">
        <span className="mr-1">★</span>
        <span className="font-medium">{Number(value || 0).toFixed(1)}</span>
        {count ? <span className="text-gray-500 ml-1">({count})</span> : null}
    </div>
);

const VenueCard = ({ facility }) => {
    const navigate = useNavigate();
    const isTopRated = (facility.rating || 0) >= 4.5 && (facility.ratingCount || 0) >= 5;
    const isBudget = typeof facility.pricePerHour === 'number' && facility.pricePerHour <= 500;

    return (
        <button
            onClick={() => navigate(`/dashboard/venues/${facility._id}`)}
            className="text-left min-w-[320px] max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0 hover:shadow-md transition-shadow"
        >
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
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    <VenueCard key={f._id} facility={f} />
                ))}
            </div>
        </div>
    );
};

export default VenuesCarousel;
