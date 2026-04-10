const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const [totalUsers, totalDoctors, totalPatients, totalAppointments, pendingDoctors] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'doctor' }),
            User.countDocuments({ role: 'patient' }),
            Appointment.countDocuments(),
            Doctor.countDocuments({ isVerified: false }),
        ]);

        const appointmentsByStatus = await Appointment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        res.json({
            totalUsers,
            totalDoctors,
            totalPatients,
            totalAppointments,
            pendingDoctors,
            appointmentsByStatus,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const { role } = req.query;
        const filter = {};
        if (role) filter.role = role;
        const users = await User.find(filter).sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin users' });

        await user.deleteOne();
        if (user.role === 'doctor') {
            await Doctor.deleteOne({ userId: user._id });
        }
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/doctors/pending
router.get('/doctors/pending', async (req, res) => {
    try {
        const doctors = await Doctor.find({ isVerified: false }).populate(
            'userId',
            'name email phone createdAt'
        );
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/doctors/:id/verify
router.put('/doctors/:id/verify', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        doctor.isVerified = true;
        await doctor.save();

        // Also mark the user as verified
        await User.findByIdAndUpdate(doctor.userId, { isVerified: true });
        res.json({ message: 'Doctor verified successfully', doctor });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/appointments
router.get('/appointments', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const appointments = await Appointment.find(filter)
            .populate('patientId', 'name email')
            .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
            .sort({ createdAt: -1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
