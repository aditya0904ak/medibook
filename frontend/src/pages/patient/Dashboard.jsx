import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp, Plus } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'

export default function PatientDashboard() {
    const { user } = useAuth()
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/appointments/my-appointments').then(({ data }) => setAppointments(data)).finally(() => setLoading(false))
    }, [])

    const upcoming = appointments.filter(a => !isPast(new Date(a.appointmentDate)) && a.status !== 'cancelled')
    const today = appointments.filter(a => isToday(new Date(a.appointmentDate)))
    const completed = appointments.filter(a => a.status === 'completed').length
    const cancelled = appointments.filter(a => a.status === 'cancelled').length

    const stats = [
        { label: 'Upcoming', value: upcoming.length, icon: <Calendar className="h-5 w-5" />, color: 'bg-blue-50 text-blue-600' },
        { label: "Today's", value: today.length, icon: <Clock className="h-5 w-5" />, color: 'bg-cyan-50 text-cyan-600' },
        { label: 'Completed', value: completed, icon: <CheckCircle className="h-5 w-5" />, color: 'bg-green-50 text-green-600' },
        { label: 'Cancelled', value: cancelled, icon: <XCircle className="h-5 w-5" />, color: 'bg-red-50 text-red-600' },
    ]

    return (
        <div className="page-container animate-fadeIn">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="text-gray-500 mt-1">Here's your health overview for today</p>
                </div>
                <Link to="/doctors" className="btn-primary flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Book Appointment
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map(s => (
                    <div key={s.label} className="card">
                        <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
                        <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                        <p className="text-sm text-gray-500">{s.label} Appointments</p>
                    </div>
                ))}
            </div>

            {/* Upcoming appointments */}
            <div className="card">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="section-title mb-0">Upcoming Appointments</h2>
                    <Link to="/patient/appointments" className="text-sm text-blue-600 hover:underline">View all</Link>
                </div>

                {loading ? <Spinner /> : upcoming.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p>No upcoming appointments</p>
                        <Link to="/doctors" className="text-blue-600 hover:underline text-sm mt-2 block">Find a doctor now</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcoming.slice(0, 3).map(appt => {
                            const doc = appt.doctorId
                            const docUser = doc?.userId || {}
                            return (
                                <div key={appt._id} className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                                    <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                                        {(docUser.name || 'D')?.[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{docUser.name || 'Doctor'}</p>
                                        <p className="text-sm text-blue-600">{doc?.specialization}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {format(new Date(appt.appointmentDate), 'EEE, dd MMM yyyy')} · {appt.timeSlot}
                                        </p>
                                    </div>
                                    <span className={`badge-${appt.status}`}>{appt.status}</span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 18) return 'afternoon'
    return 'evening'
}
