import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyFacilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: '', pricePerHour: 0, city: '', state: '', pincode: '' });

    const load = async () => {
        try {
            const res = await axios.get('/api/facilities/mine');
            setFacilities(res.data.facilities || []);
        } catch (e) {
            setFacilities([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/facilities', {
                name: form.name,
                pricePerHour: Number(form.pricePerHour),
                address: { city: form.city, state: form.state, pincode: form.pincode, line1: form.name },
                sports: [],
            });
            setForm({ name: '', pricePerHour: 0, city: '', state: '', pincode: '' });
            load();
        } catch (e) { }
    };

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">My Facilities</h2>

            <form onSubmit={handleCreate} className="card p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
                <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="input-field" placeholder="Price/hr" type="number" value={form.pricePerHour} onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })} />
                <input className="input-field" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <input className="input-field" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                <input className="input-field" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                <button className="btn-primary col-span-1 md:col-span-5">Add Facility</button>
            </form>

            {loading ? (
                <div>Loading...</div>
            ) : facilities.length === 0 ? (
                <p className="text-gray-600">You have not added any facilities yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {facilities.map((f) => (
                        <div key={f._id} className="card p-4">
                            <h3 className="font-semibold text-lg">{f.name}</h3>
                            <p className="text-sm text-gray-600">{f.address?.city}, {f.address?.state}</p>
                            <p className="text-sm mt-1">Price/hr: ₹{f.pricePerHour}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyFacilities;
