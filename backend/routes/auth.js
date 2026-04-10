const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @access  Public
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').isIn(['patient', 'doctor']).withMessage('Role must be patient or doctor'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { name, email, password, role, phone } = req.body;
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ message: 'Email already registered' });

            const user = await User.create({ name, email, password, role, phone });

            // If registering as doctor, create a doctor profile
            if (role === 'doctor') {
                await Doctor.create({
                    userId: user._id,
                    specialization: req.body.specialization || 'General',
                    qualifications: [],
                    experience: 0,
                    consultationFee: 0,
                    availability: [],
                });
            }

            const token = generateToken(user._id);
            res.status(201).json({ token, user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @route   POST /api/auth/login
// @access  Public
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user || !(await user.matchPassword(password))) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = generateToken(user._id);
            res.json({ token, user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let doctorProfile = null;
        if (user.role === 'doctor') {
            doctorProfile = await Doctor.findOne({ userId: user._id });
        }

        res.json({ user, doctorProfile });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone, profilePicture } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (profilePicture) user.profilePicture = profilePicture;

        if (req.body.password) {
            user.password = req.body.password;
        }

        await user.save();

        // Update doctor profile fields if applicable
        if (user.role === 'doctor') {
            const { specialization, about, clinicAddress, consultationFee, experience, qualifications } = req.body;
            const doctorProfile = await Doctor.findOne({ userId: user._id });
            if (doctorProfile) {
                if (specialization) doctorProfile.specialization = specialization;
                if (about) doctorProfile.about = about;
                if (clinicAddress) doctorProfile.clinicAddress = clinicAddress;
                if (consultationFee !== undefined) doctorProfile.consultationFee = consultationFee;
                if (experience !== undefined) doctorProfile.experience = experience;
                if (qualifications) doctorProfile.qualifications = qualifications;
                await doctorProfile.save();
            }
        }

        res.json({ message: 'Profile updated', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
