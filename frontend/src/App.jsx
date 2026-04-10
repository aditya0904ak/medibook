import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Spinner from './components/Spinner'

// Public pages
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import DoctorDetails from './pages/DoctorDetails'
import Login from './pages/Login'
import Register from './pages/Register'

// Patient pages
import PatientDashboard from './pages/patient/Dashboard'
import PatientAppointments from './pages/patient/Appointments'
import BookAppointment from './pages/patient/BookAppointment'
import PatientProfile from './pages/patient/Profile'

// Doctor pages
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorAppointments from './pages/doctor/Appointments'
import DoctorSchedule from './pages/doctor/Schedule'
import DoctorProfile from './pages/doctor/Profile'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminDoctors from './pages/admin/Doctors'
import AdminAppointments from './pages/admin/Appointments'

function RoleHome() {
    const { user } = useAuth()
    if (!user) return <Navigate to="/" />
    const routes = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' }
    return <Navigate to={routes[user.role] || '/'} />
}

export default function App() {
    const { loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Spinner size="lg" />
                    <p className="mt-4 text-gray-500 text-sm">Loading MediBook...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/doctors/:id" element={<DoctorDetails />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<RoleHome />} />

                    {/* Patient routes */}
                    <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                    <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><PatientAppointments /></ProtectedRoute>} />
                    <Route path="/patient/book/:doctorId" element={<ProtectedRoute allowedRoles={['patient']}><BookAppointment /></ProtectedRoute>} />
                    <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['patient']}><PatientProfile /></ProtectedRoute>} />

                    {/* Doctor routes */}
                    <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
                    <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
                    <Route path="/doctor/schedule" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorSchedule /></ProtectedRoute>} />
                    <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>} />

                    {/* Admin routes */}
                    <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
                    <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><AdminDoctors /></ProtectedRoute>} />
                    <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><AdminAppointments /></ProtectedRoute>} />

                    {/* 404 */}
                    <Route path="*" element={
                        <div className="flex items-center justify-center min-h-96 text-center">
                            <div>
                                <h1 className="text-6xl font-bold text-blue-600">404</h1>
                                <p className="text-xl text-gray-600 mt-4">Page not found</p>
                                <a href="/" className="btn-primary mt-6 inline-block">Go Home</a>
                            </div>
                        </div>
                    } />
                </Routes>
            </main>
            <Footer />
        </div>
    )
}
