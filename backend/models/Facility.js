const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        sports: [{ type: String, trim: true }],
        pricePerHour: { type: Number, required: true, min: 0 },
        phone: { type: String, trim: true },
        email: { type: String, trim: true },
        address: {
            line1: { type: String, required: true },
            line2: { type: String },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            geo: {
                lat: { type: Number },
                lng: { type: Number },
            },
        },
        amenities: [{ type: String }],
        images: [{ type: String }],
        isActive: { type: Boolean, default: true },
        isApproved: { type: Boolean, default: true },
        rating: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Facility', facilitySchema);
