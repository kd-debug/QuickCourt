const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        amount: { type: Number, required: true, min: 0 },
        status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
        selectedCourts: [{ type: String }],
        sport: { type: String },
        notes: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
