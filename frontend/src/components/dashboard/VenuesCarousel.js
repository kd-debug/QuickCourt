import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VenuesCarousel = () => {
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

    if (facilities.length === 0) {
        return <div className="p-6 text-gray-600">No venues available yet.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-2">
                {facilities.map((f) => (
                    <div key={f._id} className="min-w-[250px] max-w-xs bg-white rounded-xl shadow-sm border border-gray-100 p-0 flex-shrink-0 overflow-hidden">
                        {Array.isArray(f.images) && f.images.length > 0 ? (
                            <img src={f.images[0]} alt={`${f.name} image`} className="h-32 w-full object-cover" />
                        ) : (
                            <div className="h-32 w-full bg-secondary-100 rounded-none flex items-center justify-center text-secondary-400">Image</div>
                        )}
                        <div className="p-4">
                            <h3 className="font-semibold text-lg mb-1">{f.name}</h3>
                            <p className="text-sm text-gray-600">{f.address?.city}, {f.address?.state}</p>
                            <p className="text-xs mt-2 text-gray-500">Sports: {(f.sports || []).join(', ')}</p>
                            <p className="text-sm mt-1 font-medium">Price/hr: ₹{f.pricePerHour}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VenuesCarousel;
