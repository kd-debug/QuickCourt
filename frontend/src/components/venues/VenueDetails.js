import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Rating = ({ value = 0, count = 0 }) => (
    <div className="flex items-center text-sm text-yellow-600">
        <span className="mr-1">★</span>
        <span className="font-medium">{Number(value || 0).toFixed(1)}</span>
        {count ? <span className="text-gray-500 ml-1">({count})</span> : null}
    </div>
);

const VenueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [facility, setFacility] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-6">Loading venue...</div>;
    if (!facility) return <div className="p-6">Venue not found.</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{facility.name}</h1>
                        <p className="text-sm text-gray-600">{facility.address?.line1}, {facility.address?.city}, {facility.address?.state}</p>
                    </div>
                    <Rating value={facility.rating || 0} count={facility.ratingCount || 0} />
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
        </div>
    );
};

export default VenueDetails;
