import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VenuesList = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {facilities.map((f) => (
                        <div key={f._id} className="card p-0 overflow-hidden">
                            {Array.isArray(f.images) && f.images.length > 0 ? (
                                <img src={f.images[0]} alt={`${f.name} image`} className="h-40 w-full object-cover" />
                            ) : (
                                <div className="h-40 w-full bg-secondary-100 flex items-center justify-center text-secondary-400">Image</div>
                            )}
                            <div className="p-4">
                                <h3 className="font-semibold text-lg">{f.name}</h3>
                                <p className="text-sm text-gray-600">{f.address?.city}, {f.address?.state}</p>
                                <p className="text-sm mt-2">Sports: {(f.sports || []).join(', ')}</p>
                                <p className="text-sm mt-1">Price/hr: ₹{f.pricePerHour}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VenuesList;
