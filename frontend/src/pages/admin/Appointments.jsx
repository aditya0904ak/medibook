import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Search, X } from 'lucide-react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'

const STATUS_TABS = ['All', 'pending', 'confirmed', 'completed', 'cancelled']

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('All')
    const [search, setSearch] = useState('')

    const fetchAppointments = () => {
        setLoading(true)
        const params = tab !== 'All' ? { status: tab } : {}
        api.get('/admin/appointments', { params }).then(({ data }) => setAppointments(data)).finally(() => setLoading(false))
    }

    useEffect(() => { fetchAppointments() }, [tab])

    const handleCancel = async (id) => {
        if (!confirm('Cancel this appointment?')) return
        try {
            await api.put(`/appointments/${id}/status`, { status: 'cancelled' })
            toast.success('Appointment cancelled')
            fetchAppointments()
        } catch {
            toast.error('Failed to cancel')
        }
    }

    const filtered = appointments.filter(a =>
        (a.patientId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.doctorId?.userId?.name || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="page-container animate-fadeIn">
            <h1 className="page-title">All Appointments</h1>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or doctor..."
                        className="form-input pl-10" />
                </div>
                <div className="flex flex-wrap gap-2">
                    {STATUS_TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <Spinner /> : (
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Patient</th>
                                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Doctor</th>
                                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Date & Time</th>
                                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(a => (
                                    <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{a.patientId?.name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-400">{a.patientId?.email}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{a.doctorId?.userId?.name || '-'}</p>
                                            <p className="text-xs text-blue-500">{a.doctorId?.specialization}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <p>{format(new Date(a.appointmentDate), 'dd MMM yyyy')}</p>
                                            <p className="text-xs text-gray-400">{a.timeSlot}</p>
                                        </td>
                                        <td className="px-4 py-3"><span className={`badge-${a.status}`}>{a.status}</span></td>
                                        <td className="px-4 py-3">
                                            {a.status !== 'cancelled' && a.status !== 'completed' && (
                                                <button onClick={() => handleCancel(a._id)} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 transition-colors">
                                                    <X className="h-3.5 w-3.5" /> Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-10 text-gray-400">No appointments found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
