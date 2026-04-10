import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import AppointmentCard from '../../components/AppointmentCard'

const TABS = ['All', 'pending', 'confirmed', 'completed', 'cancelled']

export default function DoctorAppointments() {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('All')
    const [notesModal, setNotesModal] = useState(null)
    const [notes, setNotes] = useState('')

    const fetchAppointments = () => {
        setLoading(true)
        api.get('/appointments/doctor-appointments').then(({ data }) => setAppointments(data)).finally(() => setLoading(false))
    }

    useEffect(() => { fetchAppointments() }, [])

    const filtered = tab === 'All' ? appointments : appointments.filter(a => a.status === tab)

    const updateStatus = async (id, status, notesVal = '') => {
        try {
            await api.put(`/appointments/${id}/status`, { status, notes: notesVal })
            toast.success(`Appointment ${status}`)
            fetchAppointments()
            setNotesModal(null)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed')
        }
    }

    return (
        <div className="page-container animate-fadeIn">
            <h1 className="page-title">Manage Appointments</h1>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                        {t} {t === 'All' ? `(${appointments.length})` : `(${appointments.filter(a => a.status === t).length})`}
                    </button>
                ))}
            </div>

            {loading ? <Spinner /> : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-500"><p>No appointments found</p></div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(appt => (
                        <AppointmentCard key={appt._id} appointment={appt} actions={
                            <div className="flex flex-col gap-2 min-w-[100px]">
                                {appt.status === 'pending' && (
                                    <>
                                        <button onClick={() => updateStatus(appt._id, 'confirmed')} className="text-xs bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700">Confirm</button>
                                        <button onClick={() => updateStatus(appt._id, 'cancelled')} className="text-xs text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">Cancel</button>
                                    </>
                                )}
                                {appt.status === 'confirmed' && (
                                    <button onClick={() => setNotesModal(appt)} className="text-xs bg-green-600 text-white rounded-lg px-3 py-1.5 hover:bg-green-700">Complete</button>
                                )}
                            </div>
                        } />
                    ))}
                </div>
            )}

            {/* Complete + Notes Modal */}
            {notesModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setNotesModal(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-gray-900 text-lg mb-4">Complete Appointment</h3>
                        <div>
                            <label className="form-label">Consultation Notes (optional)</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                                className="form-input" placeholder="Add diagnosis, prescription, or follow-up instructions..." />
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => updateStatus(notesModal._id, 'completed', notes)} className="btn-primary flex-1">Mark Completed</button>
                            <button onClick={() => setNotesModal(null)} className="btn-secondary flex-1">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
