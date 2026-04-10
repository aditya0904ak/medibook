require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');

const SPECIALIZATIONS = [
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Orthopedic',
    'Pediatrician',
    'Psychiatrist',
    'General Physician',
    'Gynecologist',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DEFAULT_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

const DOCTOR_DATA = [
    {
        name: 'Dr. Aarav Sharma',
        email: 'aarav.sharma@medibook.com',
        specialization: 'Cardiologist',
        experience: 12,
        consultationFee: 800,
        qualifications: ['MBBS', 'MD (Cardiology)', 'DM (Cardiology)'],
        about: 'Expert in heart diseases and cardiac care with 12 years of experience.',
        clinicAddress: '204 Heart Care Center, MG Road, Bangalore',
        rating: 4.8,
        totalReviews: 45,
    },
    {
        name: 'Dr. Priya Nair',
        email: 'priya.nair@medibook.com',
        specialization: 'Dermatologist',
        experience: 8,
        consultationFee: 600,
        qualifications: ['MBBS', 'MD (Dermatology)'],
        about: 'Skin specialist with expertise in acne, eczema, and cosmetic dermatology.',
        clinicAddress: '12 Skin Clinic, Koramangala, Bangalore',
        rating: 4.6,
        totalReviews: 38,
    },
    {
        name: 'Dr. Rajesh Mehta',
        email: 'rajesh.mehta@medibook.com',
        specialization: 'Neurologist',
        experience: 15,
        consultationFee: 1000,
        qualifications: ['MBBS', 'MD (Medicine)', 'DM (Neurology)'],
        about: 'Specialist in neurological disorders including migraines, epilepsy, and stroke.',
        clinicAddress: '501 NeuroLife Hospital, Indiranagar, Bangalore',
        rating: 4.9,
        totalReviews: 62,
    },
    {
        name: 'Dr. Sonia Kapoor',
        email: 'sonia.kapoor@medibook.com',
        specialization: 'Pediatrician',
        experience: 10,
        consultationFee: 500,
        qualifications: ['MBBS', 'MD (Pediatrics)'],
        about: 'Caring for children from newborns to teenagers with compassion and expertise.',
        clinicAddress: '7 Kids Health Clinic, HSR Layout, Bangalore',
        rating: 4.7,
        totalReviews: 55,
    },
    {
        name: 'Dr. Vikram Iyer',
        email: 'vikram.iyer@medibook.com',
        specialization: 'Orthopedic',
        experience: 14,
        consultationFee: 900,
        qualifications: ['MBBS', 'MS (Orthopedics)', 'Fellowship in Joint Replacement'],
        about: 'Expert in joint replacement, sports injuries, and spine disorders.',
        clinicAddress: '23 Bone & Joint Clinic, Whitefield, Bangalore',
        rating: 4.5,
        totalReviews: 41,
    },
    {
        name: 'Dr. Meera Pillai',
        email: 'meera.pillai@medibook.com',
        specialization: 'Gynecologist',
        experience: 11,
        consultationFee: 700,
        qualifications: ['MBBS', 'MS (Obstetrics & Gynecology)'],
        about: 'Women\'s health specialist with expertise in obstetrics and reproductive medicine.',
        clinicAddress: '15 Womens Wellness Center, Jayanagar, Bangalore',
        rating: 4.8,
        totalReviews: 73,
    },
    {
        name: 'Dr. Arjun Reddy',
        email: 'arjun.reddy@medibook.com',
        specialization: 'Psychiatrist',
        experience: 9,
        consultationFee: 750,
        qualifications: ['MBBS', 'MD (Psychiatry)'],
        about: 'Mental health specialist helping patients manage anxiety, depression, and stress.',
        clinicAddress: '8 Mind Care Center, Malleshwaram, Bangalore',
        rating: 4.4,
        totalReviews: 29,
    },
    {
        name: 'Dr. Sunita Bose',
        email: 'sunita.bose@medibook.com',
        specialization: 'General Physician',
        experience: 7,
        consultationFee: 400,
        qualifications: ['MBBS', 'PGDM (Internal Medicine)'],
        about: 'General health care including fever, infections, diabetes, and hypertension management.',
        clinicAddress: '3 Family Health Clinic, Rajajinagar, Bangalore',
        rating: 4.3,
        totalReviews: 82,
    },
];

const PATIENT_DATA = [
    { name: 'Aditya Kumar', email: 'aditya.kumar@gmail.com', phone: '9876543210' },
    { name: 'Sneha Patel', email: 'sneha.patel@gmail.com', phone: '9876543211' },
    { name: 'Rahul Verma', email: 'rahul.verma@gmail.com', phone: '9876543212' },
    { name: 'Ananya Singh', email: 'ananya.singh@gmail.com', phone: '9876543213' },
    { name: 'Karan Malhotra', email: 'karan.malhotra@gmail.com', phone: '9876543214' },
    { name: 'Pooja Gupta', email: 'pooja.gupta@gmail.com', phone: '9876543215' },
    { name: 'Amit Joshi', email: 'amit.joshi@gmail.com', phone: '9876543216' },
    { name: 'Divya Nair', email: 'divya.nair@gmail.com', phone: '9876543217' },
    { name: 'Rohit Shetty', email: 'rohit.shetty@gmail.com', phone: '9876543218' },
    { name: 'Kavya Menon', email: 'kavya.menon@gmail.com', phone: '9876543219' },
];

const REASONS = [
    'Regular check-up',
    'Fever and cold',
    'Back pain',
    'Skin rash',
    'Headache and dizziness',
    'Joint pain',
    'Diabetes management',
    'Blood pressure monitoring',
    'Pre-natal checkup',
    'Mental health consultation',
];

const REVIEW_COMMENTS = [
    'Excellent doctor! Very knowledgeable and patient.',
    'Dr. was very thorough and explained everything clearly.',
    'Very professional and caring. Highly recommended!',
    'Great experience overall. The clinic is clean and well-managed.',
    'The doctor listened carefully and gave a precise diagnosis.',
    'Friendly staff and excellent medical care.',
    'Highly skilled doctor. My condition improved significantly.',
];

async function seedDatabase() {
    try {
        await connectDB();
        console.log('🗑  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Doctor.deleteMany({}),
            Appointment.deleteMany({}),
            Review.deleteMany({}),
        ]);

        console.log('👤 Creating admin user...');
        const admin = await User.create({
            name: 'Admin MediBook',
            email: 'admin@medibook.com',
            password: 'password123',
            role: 'admin',
            phone: '9000000000',
            isVerified: true,
        });

        console.log('🏥 Creating doctor users...');
        const doctorUsers = [];
        const doctorProfiles = [];

        for (const d of DOCTOR_DATA) {
            const user = await User.create({
                name: d.name,
                email: d.email,
                password: 'password123',
                role: 'doctor',
                phone: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
                isVerified: true,
            });
            doctorUsers.push(user);

            const availability = DAYS.map((day) => ({ day, slots: DEFAULT_SLOTS }));
            const doctor = await Doctor.create({
                userId: user._id,
                specialization: d.specialization,
                qualifications: d.qualifications,
                experience: d.experience,
                consultationFee: d.consultationFee,
                availability,
                about: d.about,
                clinicAddress: d.clinicAddress,
                rating: d.rating,
                totalReviews: d.totalReviews,
                isVerified: true,
            });
            doctorProfiles.push(doctor);
        }

        console.log('🧑‍🤝‍🧑 Creating patient users...');
        const patients = [];
        for (const p of PATIENT_DATA) {
            const user = await User.create({
                name: p.name,
                email: p.email,
                password: 'password123',
                role: 'patient',
                phone: p.phone,
            });
            patients.push(user);
        }

        console.log('📅 Creating appointments...');
        const appointments = [];
        const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

        for (let i = 0; i < 30; i++) {
            const patient = patients[Math.floor(Math.random() * patients.length)];
            const doctorProfile = doctorProfiles[Math.floor(Math.random() * doctorProfiles.length)];

            // Mix past and future dates
            const offset = i < 15 ? -(Math.floor(Math.random() * 30) + 1) : Math.floor(Math.random() * 14) + 1;
            const date = new Date();
            date.setDate(date.getDate() + offset);
            date.setHours(0, 0, 0, 0);

            const slot = DEFAULT_SLOTS[Math.floor(Math.random() * DEFAULT_SLOTS.length)];
            const status =
                offset < 0
                    ? statuses[Math.floor(Math.random() * 2) + 2] // completed or cancelled for past
                    : statuses[Math.floor(Math.random() * 2)]; // pending or confirmed for future

            try {
                const appt = await Appointment.create({
                    patientId: patient._id,
                    doctorId: doctorProfile._id,
                    appointmentDate: date,
                    timeSlot: slot,
                    status,
                    reason: REASONS[Math.floor(Math.random() * REASONS.length)],
                    notes: status === 'completed' ? 'Patient responded well to treatment.' : '',
                });
                appointments.push(appt);
            } catch (e) {
                // Skip duplicate slot conflicts
            }
        }

        console.log('⭐ Creating reviews...');
        const completedAppts = appointments.filter((a) => a.status === 'completed');
        for (let i = 0; i < Math.min(10, completedAppts.length); i++) {
            const appt = completedAppts[i];
            await Review.create({
                appointmentId: appt._id,
                patientId: appt.patientId,
                doctorId: appt.doctorId,
                rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
                comment: REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)],
            });
        }

        console.log('\n✅ Database seeded successfully!\n');
        console.log('📧 Login Credentials:');
        console.log('   Admin   → admin@medibook.com / password123');
        console.log('   Doctor  → aarav.sharma@medibook.com / password123');
        console.log('   Patient → aditya.kumar@gmail.com / password123');
        console.log('\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seedDatabase();
