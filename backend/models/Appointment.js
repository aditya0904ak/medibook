const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        appointmentDate: {
            type: Date,
            required: true,
        },
        timeSlot: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            default: 'pending',
        },
        reason: {
            type: String,
            required: true,
        },
        notes: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

// Index for faster queries
appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
