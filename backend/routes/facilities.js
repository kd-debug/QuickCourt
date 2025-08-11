const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Facility = require('../models/Facility');

const router = express.Router();

// Public: list/search facilities
router.get('/', async (req, res) => {
    try {
        const { city, sport, q } = req.query;
        const query = { isActive: true, isApproved: true };
        if (city) query['address.city'] = new RegExp(`^${city}$`, 'i');
        if (sport) query.sports = { $in: [new RegExp(sport, 'i')] };
        if (q) query.name = new RegExp(q, 'i');

        const facilities = await Facility.find(query).sort({ createdAt: -1 });
        res.json({ success: true, facilities });
    } catch (error) {
        console.error('List facilities error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch facilities' });
    }
});

// Owner: create facility
router.post('/', protect, authorize('facility_owner', 'admin'), async (req, res) => {
    try {
        const data = { ...req.body, owner: req.user._id };
        const facility = await Facility.create(data);
        res.status(201).json({ success: true, facility });
    } catch (error) {
        console.error('Create facility error:', error);
        res.status(400).json({ success: false, message: 'Failed to create facility' });
    }
});

// Owner: update facility
router.put('/:id', protect, authorize('facility_owner', 'admin'), async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);

        if (!facility) {
            return res.status(404).json({ success: false, message: 'Facility not found' });
        }

        // Check if user owns this facility
        if (facility.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this facility' });
        }

        const updatedFacility = await Facility.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({ success: true, facility: updatedFacility });
    } catch (error) {
        console.error('Update facility error:', error);
        res.status(400).json({ success: false, message: 'Failed to update facility' });
    }
});

// Owner: list own facilities
router.get('/mine', protect, authorize('facility_owner', 'admin'), async (req, res) => {
    try {
        const facilities = await Facility.find({ owner: req.user._id });
        res.json({ success: true, facilities });
    } catch (error) {
        console.error('My facilities error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch facilities' });
    }
});

// Public: get a single facility by id
router.get('/:id', async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);
        if (!facility || !facility.isActive || !facility.isApproved) {
            return res.status(404).json({ success: false, message: 'Facility not found' });
        }
        res.json({ success: true, facility });
    } catch (error) {
        console.error('Get facility error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch facility' });
    }
});

module.exports = router;
