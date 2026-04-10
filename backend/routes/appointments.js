const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// @route   POST /api/appointments
// @access  Patient only
router.post('/', protect, authorize('patient'), async (req, res) => {
    try {
        const { doctorId, appointmentDate, timeSlot, reason } = req.body;
        if (!doctorId || !appointmentDate || !timeSlot || !reason) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        // Check if slot is already booked
        const dateStart = new Date(appointmentDate);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(dateStart);
        dateEnd.setDate(dateEnd.getDate() + 1);

        const existing = await Appointment.findOne({
            doctorId,
            appointmentDate: { $gte: dateStart, $lt: dateEnd },
            timeSlot,
            status: { $in: ['pending', 'confirmed'] },
        });

        if (existing) return res.status(400).json({ message: 'This time slot is already booked' });

        const appointment = await Appointment.create({
            patientId: req.user._id,
            doctorId,
            appointmentDate: new Date(appointmentDate),
            timeSlot,
            reason,
        });

        await appointment.populate([
            { path: 'patientId', select: 'name email phone' },
            { path: 'doctorId', populate: { path: 'userId', select: 'name' } },
        ]);

        res.status(201).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/appointments/my-appointments
// @access  Patient only
router.get('/my-appointments', protect, authorize('patient'), async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user._id })
            .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name profilePicture' } })
            .sort({ appointmentDate: -1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/appointments/doctor-appointments
// @access  Doctor only
router.get('/doctor-appointments', protect, authorize('doctor'), async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        const { status } = req.query;
        const filter = { doctorId: doctor._id };
        if (status) filter.status = status;

        const appointments = await Appointment.find(filter)
            .populate('patientId', 'name email phone profilePicture')
            .sort({ appointmentDate: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/appointments/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId', 'name email phone')
            .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } });
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/appointments/:id/status
// @access  Doctor or Admin
router.put('/:id/status', protect, authorize('doctor', 'admin'), async (req, res) => {
    try {
        const { status, notes } = req.body;
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // Doctors can only update their own appointments
        if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ userId: req.user._id });
            if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }

        appointment.status = status;
        if (notes) appointment.notes = notes;
        await appointment.save();

        res.json({ message: 'Appointment updated', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/appointments/:id
// @access  Patient or Admin
router.delete('/:id', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // Patient can only cancel their own appointments
        if (req.user.role === 'patient') {
            if (appointment.patientId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            // Check 24-hour rule
            const now = new Date();
            const apptTime = new Date(appointment.appointmentDate);
            const hoursDiff = (apptTime - now) / (1000 * 60 * 60);
            if (hoursDiff < 24 && appointment.status === 'confirmed') {
                return res.status(400).json({ message: 'Cannot cancel a confirmed appointment within 24 hours' });
            }
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
