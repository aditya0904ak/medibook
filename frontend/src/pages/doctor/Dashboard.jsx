import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Users, Star, CheckCircle } from 'lucide-react'
import { format, isToday } from 'date-fns'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import AppointmentCard from '../../components/AppointmentCard'

export default function DoctorDashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState(null)
    const [todayAppts, setTodayAppts] = useState([])
    const [upcomingAppts, setUpcomingAppts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [sRes, aRes] = await Promise.all([
                    api.get('/doctors/dashboard/stats'),
                    api.get('/appointments/doctor-appointments'),
                ])
                setStats(sRes.data)
                const all = aRes.data
                setTodayAppts(all.filter(a => isToday(new Date(a.appointmentDate))))
                setUpcomingAppts(all.filter(a => new Date(a.appointmentDate) >= new Date() && !isToday(new Date(a.appointmentDate))).slice(0, 5))
            } catch { }
            finally { setLoading(false) }
        }
        fetchAll()
    }, [])

    const statCards = stats ? [
        { label: "Today's Appointments", value: stats.todayAppointments, icon: <Clock className="h-5 w-5" />, color: 'bg-blue-50 text-blue-600' },
        { label: 'Pending Review', value: stats.pendingAppointments, icon: <Calendar className="h-5 w-5" />, color: 'bg-yellow-50 text-yellow-600' },
        { label: 'Completed', value: stats.completedAppointments, icon: <CheckCircle className="h-5 w-5" />, color: 'bg-green-50 text-green-600' },
        { label: 'Rating', value: `${stats.rating} ★`, icon: <Star className="h-5 w-5" />, color: 'bg-purple-50 text-purple-600' },
    ] : []

    if (loading) return <div className="py-20"><Spinner /></div>

    return (
        <div className="page-container animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user?.name?.split(' ').slice(-1)[0]}</p>
                </div>
                <Link to="/doctor/schedule" className="btn-primary flex items-center gap-2"><Calendar className="h-4 w-4" /> Manage Schedule</Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map(s => (
                    <div key={s.label} className="card">
                        <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
                        <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                        <p className="text-sm text-gray-500">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Today's appointments */}
            <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="section-title mb-0">Today's Appointments</h2>
                    <Link to="/doctor/appointments" className="text-sm text-blue-600 hover:underline">View all</Link>
                </div>
                {todayAppts.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4 text-center">No appointments scheduled for today</p>
                ) : (
                    <div className="space-y-3">
                        {todayAppts.map(a => <AppointmentCard key={a._id} appointment={a} />)}
                    </div>
                )}
            </div>

            {/* Upcoming */}
            {upcomingAppts.length > 0 && (
                <div className="card">
                    <h2 className="section-title">Upcoming</h2>
                    <div className="space-y-3">
                        {upcomingAppts.map(a => <AppointmentCard key={a._id} appointment={a} />)}
                    </div>
                </div>
            )}
        </div>
    )
}
