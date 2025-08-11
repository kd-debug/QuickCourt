import React, { useEffect, useState } from 'react';
import axios from 'axios';

const indoorCategories = ['table tennis', 'tennis', 'badminton'];
const outdoorCategories = ['cricket', 'swimming pool', 'football', 'basketball'];

const MyFacilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingFacility, setEditingFacility] = useState(null);
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

    const handleEditImages = async (e) => {
        const files = Array.from(e.target.files || []);
        const readers = files.map(file => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        }));
        const base64Images = await Promise.all(readers);
        setEditingFacility((prev) => ({ ...prev, images: base64Images }));
    };

    const categories = form.sportType === 'indoor' ? indoorCategories : outdoorCategories;
    const editCategories = editingFacility?.sportType === 'indoor' ? indoorCategories : outdoorCategories;

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

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/facilities/${editingFacility._id}`, {
                name: editingFacility.name,
                pricePerHour: Number(editingFacility.pricePerHour),
                sportType: editingFacility.sportType,
                category: editingFacility.category,
                openHours: editingFacility.openHours,
                address: {
                    line1: editingFacility.address.line1,
                    city: editingFacility.address.city,
                    state: editingFacility.address.state,
                    pincode: editingFacility.address.pincode,
                },
                description: editingFacility.description,
                images: editingFacility.images,
                sports: [editingFacility.category],
            });
            setShowEditModal(false);
            setEditingFacility(null);
            load();
        } catch (e) { }
    };

    const openEditModal = (facility) => {
        setEditingFacility({
            ...facility,
            openHours: facility.openHours || { open: '', close: '' },
            address: facility.address || { line1: '', city: '', state: '', pincode: '' },
            images: facility.images || []
        });
        setShowEditModal(true);
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
                        <div key={f._id} className="card p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEditModal(f)}>
                            <h3 className="font-semibold text-lg">{f.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{f.sportType} • {f.category}</p>
                            <p className="text-sm text-gray-600">{f.address?.city}, {f.address?.state}</p>
                            <p className="text-sm mt-1">Price/hr: ₹{f.pricePerHour}</p>
                            {Array.isArray(f.images) && f.images.length > 0 && (
                                <img src={f.images[0]} alt="facility" className="mt-2 h-32 w-full object-cover rounded-md" />
                            )}
                            <div className="mt-2 text-xs text-primary-600">Click to edit</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Facility Modal */}
            {showEditModal && editingFacility && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Edit Facility: {editingFacility.name}</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEdit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="input-field" placeholder="Facility Name" value={editingFacility.name} onChange={(e) => setEditingFacility({ ...editingFacility, name: e.target.value })} />
                                <input className="input-field" placeholder="Price/hr" type="number" value={editingFacility.pricePerHour} onChange={(e) => setEditingFacility({ ...editingFacility, pricePerHour: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select className="input-field" value={editingFacility.sportType} onChange={(e) => {
                                    const newType = e.target.value;
                                    setEditingFacility((prev) => ({ ...prev, sportType: newType, category: (newType === 'indoor' ? indoorCategories[0] : outdoorCategories[0]) }));
                                }}>
                                    <option value="indoor">Indoor</option>
                                    <option value="outdoor">Outdoor</option>
                                </select>

                                <select className="input-field" value={editingFacility.category} onChange={(e) => setEditingFacility({ ...editingFacility, category: e.target.value })}>
                                    {editCategories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="input-field" placeholder="Opens (e.g., 08:00 AM)" value={editingFacility.openHours.open} onChange={(e) => setEditingFacility({ ...editingFacility, openHours: { ...editingFacility.openHours, open: e.target.value } })} />
                                <input className="input-field" placeholder="Closes (e.g., 10:00 PM)" value={editingFacility.openHours.close} onChange={(e) => setEditingFacility({ ...editingFacility, openHours: { ...editingFacility.openHours, close: e.target.value } })} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input className="input-field md:col-span-2" placeholder="Address Line" value={editingFacility.address.line1} onChange={(e) => setEditingFacility({ ...editingFacility, address: { ...editingFacility.address, line1: e.target.value } })} />
                                <input className="input-field" placeholder="City" value={editingFacility.address.city} onChange={(e) => setEditingFacility({ ...editingFacility, address: { ...editingFacility.address, city: e.target.value } })} />
                                <input className="input-field" placeholder="State" value={editingFacility.address.state} onChange={(e) => setEditingFacility({ ...editingFacility, address: { ...editingFacility.address, state: e.target.value } })} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="input-field" placeholder="Pincode" value={editingFacility.address.pincode} onChange={(e) => setEditingFacility({ ...editingFacility, address: { ...editingFacility.address, pincode: e.target.value } })} />
                            </div>

                            <textarea className="input-field w-full" placeholder="Description" value={editingFacility.description} onChange={(e) => setEditingFacility({ ...editingFacility, description: e.target.value })} />

                            <div>
                                <label className="block text-sm font-medium mb-1">Update Photos</label>
                                <input type="file" accept="image/*" multiple onChange={handleEditImages} />
                                {editingFacility.images.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {editingFacility.images.map((src, idx) => (
                                            <img key={idx} src={src} alt={`preview-${idx}`} className="h-16 w-24 object-cover rounded-md border" />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Update Facility
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyFacilities;
