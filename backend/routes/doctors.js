const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// @route   GET /api/doctors
// @access  Public - List doctors with optional filters
router.get('/', async (req, res) => {
    try {
        const { specialization, minRating, maxFee, search } = req.query;
        const filter = {};

        if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
        if (minRating) filter.rating = { $gte: parseFloat(minRating) };
        if (maxFee) filter.consultationFee = { $lte: parseFloat(maxFee) };

        let doctors = await Doctor.find(filter).populate('userId', 'name email phone profilePicture');

        // Filter by name search if provided
        if (search) {
            const searchLower = search.toLowerCase();
            doctors = doctors.filter(
                (d) =>
                    d.userId?.name?.toLowerCase().includes(searchLower) ||
                    d.specialization?.toLowerCase().includes(searchLower)
            );
        }

        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/doctors/dashboard/stats
// @access  Doctor only
router.get('/dashboard/stats', protect, authorize('doctor'), async (req, res) => {
    try {
        const doctorProfile = await Doctor.findOne({ userId: req.user._id });
        if (!doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [totalAppointments, todayAppointments, pendingAppointments, completedAppointments] =
            await Promise.all([
                Appointment.countDocuments({ doctorId: doctorProfile._id }),
                Appointment.countDocuments({
                    doctorId: doctorProfile._id,
                    appointmentDate: { $gte: today, $lt: tomorrow },
                }),
                Appointment.countDocuments({ doctorId: doctorProfile._id, status: 'pending' }),
                Appointment.countDocuments({ doctorId: doctorProfile._id, status: 'completed' }),
            ]);

        res.json({
            totalAppointments,
            todayAppointments,
            pendingAppointments,
            completedAppointments,
            rating: doctorProfile.rating,
            totalReviews: doctorProfile.totalReviews,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/doctors/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate(
            'userId',
            'name email phone profilePicture'
        );
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/doctors/:id/availability
// @access  Public - Get available slots for next 7 days
router.get('/:id/availability', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const slots = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            date.setHours(0, 0, 0, 0);

            const dayName = days[date.getDay()];

            // Check if the date is in unavailable dates
            const isUnavailable = doctor.unavailableDates.some((d) => {
                const d2 = new Date(d);
                d2.setHours(0, 0, 0, 0);
                return d2.getTime() === date.getTime();
            });

            if (isUnavailable) {
                slots.push({ date: date.toISOString(), dayName, slots: [] });
                continue;
            }

            // Get the doctor's availability for this day
            const dayAvailability = doctor.availability.find((a) => a.day === dayName);

            if (!dayAvailability || dayAvailability.slots.length === 0) {
                slots.push({ date: date.toISOString(), dayName, slots: [] });
                continue;
            }

            // Get booked slots for this date
            const bookedAppointments = await Appointment.find({
                doctorId: doctor._id,
                appointmentDate: {
                    $gte: date,
                    $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
                },
                status: { $in: ['pending', 'confirmed'] },
            });
            const bookedSlots = bookedAppointments.map((a) => a.timeSlot);

            const availableSlots = dayAvailability.slots.filter((s) => !bookedSlots.includes(s));
            slots.push({ date: date.toISOString(), dayName, slots: availableSlots });
        }

        res.json(slots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/doctors/availability
// @access  Doctor only
router.put('/availability', protect, authorize('doctor'), async (req, res) => {
    try {
        const { availability, unavailableDates, consultationFee } = req.body;
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        if (availability) doctor.availability = availability;
        if (unavailableDates) doctor.unavailableDates = unavailableDates;
        if (consultationFee !== undefined) doctor.consultationFee = consultationFee;

        await doctor.save();
        res.json({ message: 'Availability updated', doctor });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
