import React, { useEffect, useState } from 'react';
import axios from 'axios';

const indoorCategories = ['table tennis', 'tennis', 'badminton'];
const outdoorCategories = ['cricket', 'swimming pool', 'football', 'basketball'];

const MyFacilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        name: '',
        pricePerHour: 0,
        sportType: 'indoor',
        category: 'table tennis',
        openHours: { open: '', close: '' },
        address: { line1: '', city: '', state: '', pincode: '' },
        description: '',
        images: [],
    });

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

    const handleImages = async (e) => {
        const files = Array.from(e.target.files || []);
        const readers = files.map(file => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        }));
        const base64Images = await Promise.all(readers);
        setForm((prev) => ({ ...prev, images: base64Images }));
    };

    const categories = form.sportType === 'indoor' ? indoorCategories : outdoorCategories;

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/facilities', {
                name: form.name,
                pricePerHour: Number(form.pricePerHour),
                sportType: form.sportType,
                category: form.category,
                openHours: form.openHours,
                address: {
                    line1: form.address.line1,
                    city: form.address.city,
                    state: form.address.state,
                    pincode: form.address.pincode,
                },
                description: form.description,
                images: form.images,
                sports: [form.category],
            });
            setForm({
                name: '', pricePerHour: 0, sportType: 'indoor', category: 'table tennis',
                openHours: { open: '', close: '' }, address: { line1: '', city: '', state: '', pincode: '' },
                description: '', images: []
            });
            load();
        } catch (e) { }
    };

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">My Facilities</h2>

            <form onSubmit={handleCreate} className="card p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                <input className="input-field md:col-span-6" placeholder="Facility Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="input-field md:col-span-3" placeholder="Price/hr" type="number" value={form.pricePerHour} onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })} />

                <select className="input-field md:col-span-3" value={form.sportType} onChange={(e) => {
                    const newType = e.target.value;
                    setForm((prev) => ({ ...prev, sportType: newType, category: (newType === 'indoor' ? indoorCategories[0] : outdoorCategories[0]) }));
                }}>
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                </select>

                <select className="input-field md:col-span-4" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                <input className="input-field md:col-span-2" placeholder="Opens (e.g., 08:00 AM)" value={form.openHours.open} onChange={(e) => setForm({ ...form, openHours: { ...form.openHours, open: e.target.value } })} />
                <input className="input-field md:col-span-2" placeholder="Closes (e.g., 10:00 PM)" value={form.openHours.close} onChange={(e) => setForm({ ...form, openHours: { ...form.openHours, close: e.target.value } })} />

                <input className="input-field md:col-span-6" placeholder="Address Line" value={form.address.line1} onChange={(e) => setForm({ ...form, address: { ...form.address, line1: e.target.value } })} />
                <input className="input-field md:col-span-2" placeholder="City" value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
                <input className="input-field md:col-span-2" placeholder="State" value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
                <input className="input-field md:col-span-2" placeholder="Pincode" value={form.address.pincode} onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })} />

                <textarea className="input-field md:col-span-12" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

                <div className="md:col-span-12">
                    <label className="block text-sm font-medium mb-1">Upload Photos</label>
                    <input type="file" accept="image/*" multiple onChange={handleImages} />
                    {form.images.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {form.images.map((src, idx) => (
                                <img key={idx} src={src} alt={`preview-${idx}`} className="h-16 w-24 object-cover rounded-md border" />
                            ))}
                        </div>
                    )}
                </div>

                <button className="btn-primary md:col-span-12">Add Facility</button>
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
                            <p className="text-sm text-gray-600 capitalize">{f.sportType} • {f.category}</p>
                            <p className="text-sm text-gray-600">{f.address?.city}, {f.address?.state}</p>
                            <p className="text-sm mt-1">Price/hr: ₹{f.pricePerHour}</p>
                            {Array.isArray(f.images) && f.images.length > 0 && (
                                <img src={f.images[0]} alt="facility" className="mt-2 h-32 w-full object-cover rounded-md" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyFacilities;
