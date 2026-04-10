import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Star } from 'lucide-react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import AppointmentCard from '../../components/AppointmentCard'

const TABS = ['All', 'pending', 'confirmed', 'completed', 'cancelled']

export default function PatientAppointments() {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('All')
    const [reviewModal, setReviewModal] = useState(null)
    const [review, setReview] = useState({ rating: 5, comment: '' })

    const fetchAppointments = () => {
        setLoading(true)
        api.get('/appointments/my-appointments').then(({ data }) => setAppointments(data)).finally(() => setLoading(false))
    }

    useEffect(() => { fetchAppointments() }, [])

    const filtered = tab === 'All' ? appointments : appointments.filter(a => a.status === tab)

    const handleCancel = async (id) => {
        if (!confirm('Cancel this appointment?')) return
        try {
            await api.delete(`/appointments/${id}`)
            toast.success('Appointment cancelled')
            fetchAppointments()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel')
        }
    }

    const handleReview = async (e) => {
        e.preventDefault()
        try {
            await api.post('/reviews', { appointmentId: reviewModal._id, ...review })
            toast.success('Review submitted!')
            setReviewModal(null)
            setReview({ rating: 5, comment: '' })
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review')
        }
    }

    return (
        <div className="page-container animate-fadeIn">
            <h1 className="page-title">My Appointments</h1>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {loading ? <Spinner /> : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <p>No appointments found</p>
                    <Link to="/doctors" className="text-blue-600 hover:underline text-sm mt-2 block">Book your first appointment</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(appt => (
                        <AppointmentCard key={appt._id} appointment={appt} actions={
                            <div className="flex flex-col gap-2">
                                {(appt.status === 'pending' || appt.status === 'confirmed') && (
                                    <button onClick={() => handleCancel(appt._id)} className="text-xs text-red-600 hover:text-red-800 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-all">
                                        Cancel
                                    </button>
                                )}
                                {appt.status === 'completed' && (
                                    <button onClick={() => setReviewModal(appt)} className="text-xs text-yellow-600 hover:text-yellow-800 border border-yellow-200 rounded-lg px-3 py-1.5 hover:bg-yellow-50 transition-all flex items-center gap-1">
                                        <Star className="h-3 w-3" /> Review
                                    </button>
                                )}
                                <Link to={`/patient/book/${appt.doctorId?._id}`} className="text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-all text-center">
                                    Rebook
                                </Link>
                            </div>
                        } />
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {reviewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setReviewModal(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-gray-900 text-lg mb-4">Leave a Review</h3>
                        <form onSubmit={handleReview} className="space-y-4">
                            <div>
                                <label className="form-label">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(r => (
                                        <button key={r} type="button" onClick={() => setReview({ ...review, rating: r })}>
                                            <Star className={`h-8 w-8 transition-colors ${r <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Comment</label>
                                <textarea value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })}
                                    className="form-input" rows={3} placeholder="Share your experience..." required />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary flex-1">Submit Review</button>
                                <button type="button" onClick={() => setReviewModal(null)} className="btn-secondary flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
