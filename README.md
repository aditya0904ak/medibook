# MediBook - Doctor Appointment Booking System

A full-stack MERN application for booking doctor appointments with Patient, Doctor, and Admin roles.

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (running locally on port 27017)

### Setup

**1. Backend**
```bash
cd backend
npm install
# Setup environment
cp .env.example .env   # Or edit .env directly
npm run seed           # Seed database with sample data  
npm run dev            # Start backend on http://localhost:5000
```

**2. Frontend** (in a new terminal)
```bash
cd frontend
npm install
npm run dev            # Start frontend on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## Demo Credentials

| Role    | Email                         | Password    |
|---------|-------------------------------|-------------|
| Admin   | admin@medibook.com            | password123 |
| Doctor  | aarav.sharma@medibook.com     | password123 |
| Patient | aditya.kumar@gmail.com        | password123 |

---

## Project Structure

```
doctor_appointment/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   └── roleCheck.js        # Role-based authorization
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── doctors.js
│   │   ├── appointments.js
│   │   ├── reviews.js
│   │   └── admin.js
│   ├── scripts/seed.js         # Database seeder
│   ├── server.js               # Express entry point
│   └── .env                    # Environment variables
└── frontend/
    └── src/
        ├── api/axios.js         # Axios instance
        ├── context/AuthContext  # Auth state management
        ├── components/          # Shared components
        └── pages/               # All page components
```

## API Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/profile` | User profile | Yes |
| GET | `/api/doctors` | List doctors | No |
| GET | `/api/doctors/:id` | Doctor details | No |
| GET | `/api/doctors/:id/availability` | Get slots | No |
| POST | `/api/appointments` | Book appointment | Patient |
| GET | `/api/appointments/my-appointments` | Patient appointments | Patient |
| GET | `/api/appointments/doctor-appointments` | Doctor appointments | Doctor |
| PUT | `/api/appointments/:id/status` | Update status | Doctor/Admin |
| POST | `/api/reviews` | Add review | Patient |
| GET | `/api/admin/stats` | System stats | Admin |

## Environment Variables (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medibook
JWT_SECRET=medibook_jwt_secret_key_2024
NODE_ENV=development
```

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Auth**: JWT + bcryptjs
- **Icons**: Lucide React
