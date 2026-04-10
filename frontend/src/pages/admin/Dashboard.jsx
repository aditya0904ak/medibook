import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Stethoscope, Calendar, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [recentAppts, setRecentAppts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            api.get('/admin/stats'),
            api.get('/admin/appointments'),
        ]).then(([sRes, aRes]) => {
            setStats(sRes.data)
            setRecentAppts(aRes.data.slice(0, 5))
        }).finally(() => setLoading(false))
    }, [])

    const statCards = stats ? [
        { label: 'Total Users', value: stats.totalUsers, icon: <Users className="h-5 w-5" />, color: 'bg-blue-50 text-blue-600', link: '/admin/users' },
        { label: 'Doctors', value: stats.totalDoctors, icon: <Stethoscope className="h-5 w-5" />, color: 'bg-cyan-50 text-cyan-600', link: '/admin/doctors' },
        { label: 'Patients', value: stats.totalPatients, icon: <Users className="h-5 w-5" />, color: 'bg-purple-50 text-purple-600', link: '/admin/users' },
        { label: 'Appointments', value: stats.totalAppointments, icon: <Calendar className="h-5 w-5" />, color: 'bg-green-50 text-green-600', link: '/admin/appointments' },
    ] : []

    const statusSection = stats?.appointmentsByStatus || []

    return (
        <div className="page-container animate-fadeIn">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-500 mb-8">System overview and management</p>

            {loading ? <Spinner /> : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {statCards.map(s => (
                            <Link key={s.label} to={s.link} className="card hover:shadow-lg transition-all group">
                                <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>{s.icon}</div>
                                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                <p className="text-sm text-gray-500">{s.label}</p>
                            </Link>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Appointment Status Breakdown */}
                        <div className="card">
                            <h2 className="section-title flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-500" /> Appointment Status</h2>
                            <div className="space-y-3">
                                {statusSection.map(s => (
                                    <div key={s._id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`badge-${s._id}`}>{s._id}</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{s.count}</span>
                                    </div>
                                ))}
                            </div>
                            {stats?.pendingDoctors > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-yellow-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{stats.pendingDoctors} doctor(s) pending verification</span>
                                    <Link to="/admin/doctors" className="text-blue-600 hover:underline ml-auto">Review</Link>
                                </div>
                            )}
                        </div>

                        {/* Recent Appointments */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="section-title mb-0">Recent Appointments</h2>
                                <Link to="/admin/appointments" className="text-sm text-blue-600 hover:underline">View all</Link>
                            </div>
                            <div className="space-y-3">
                                {recentAppts.map(a => (
                                    <div key={a._id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                                            {(a.patientId?.name || 'P')?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{a.patientId?.name}</p>
                                            <p className="text-xs text-gray-400 truncate">with {a.doctorId?.userId?.name}</p>
                                        </div>
                                        <span className={`badge-${a.status}`}>{a.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
