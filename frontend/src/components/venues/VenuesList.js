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

const VenuesList = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get('/api/facilities');
                setFacilities(res.data.facilities || []);
            } catch (e) {
                setFacilities([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return <div className="p-6">Loading venues...</div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Find Venues</h2>
            {facilities.length === 0 ? (
                <p className="text-gray-600">No venues available yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {facilities.map((f) => {
                        const isTopRated = (f.rating || 0) >= 4.5 && (f.ratingCount || 0) >= 5;
                        const isBudget = typeof f.pricePerHour === 'number' && f.pricePerHour <= 500;
                        return (
                            <button key={f._id} onClick={() => navigate(`/dashboard/venues/${f._id}`)} className="text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
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
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default VenuesList;
