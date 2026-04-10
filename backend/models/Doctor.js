const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
    },
    slots: [String],
});

const doctorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        specialization: {
            type: String,
            required: true,
            trim: true,
        },
        qualifications: [String],
        experience: {
            type: Number,
            default: 0,
        },
        consultationFee: {
            type: Number,
            default: 0,
        },
        availability: [availabilitySchema],
        unavailableDates: [Date],
        about: {
            type: String,
            default: '',
        },
        clinicAddress: {
            type: String,
            default: '',
        },
        rating: {
            type: Number,
            default: 0,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Index for search
doctorSchema.index({ specialization: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);
