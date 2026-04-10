const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// @route   POST /api/reviews
// @access  Patient only
router.post('/', protect, authorize('patient'), async (req, res) => {
    try {
        const { appointmentId, rating, comment } = req.body;
        if (!appointmentId || !rating || !comment) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (appointment.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed appointments' });
        }

        const existingReview = await Review.findOne({ appointmentId });
        if (existingReview) return res.status(400).json({ message: 'Already reviewed this appointment' });

        const review = await Review.create({
            appointmentId,
            patientId: req.user._id,
            doctorId: appointment.doctorId,
            rating,
            comment,
        });

        // Update doctor's average rating
        const reviews = await Review.find({ doctorId: appointment.doctorId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Doctor.findByIdAndUpdate(appointment.doctorId, {
            rating: Math.round(avgRating * 10) / 10,
            totalReviews: reviews.length,
        });

        await review.populate('patientId', 'name profilePicture');
        res.status(201).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const reviews = await Review.find({ doctorId: req.params.doctorId })
            .populate('patientId', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/reviews/:id
// @access  Patient (own review)
router.put('/:id', protect, authorize('patient'), async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { rating, comment } = req.body;
        if (rating) review.rating = rating;
        if (comment) review.comment = comment;
        await review.save();

        // Recalculate doctor rating
        const reviews = await Review.find({ doctorId: review.doctorId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Doctor.findByIdAndUpdate(review.doctorId, {
            rating: Math.round(avgRating * 10) / 10,
        });

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/reviews/:id
// @access  Patient (own) or Admin
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (req.user.role !== 'admin' && review.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await review.deleteOne();

        // Recalculate doctor rating
        const reviews = await Review.find({ doctorId: review.doctorId });
        const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
        await Doctor.findByIdAndUpdate(review.doctorId, {
            rating: Math.round(avgRating * 10) / 10,
            totalReviews: reviews.length,
        });

        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
