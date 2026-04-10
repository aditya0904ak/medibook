import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, addDays, isSameDay } from 'date-fns'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'

export default function BookAppointment() {
    const { doctorId } = useParams()
    const navigate = useNavigate()
    const [doctor, setDoctor] = useState(null)
    const [availability, setAvailability] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedSlot, setSelectedSlot] = useState('')
    const [reason, setReason] = useState('')
    const [weekStart, setWeekStart] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dRes, aRes] = await Promise.all([
                    api.get(`/doctors/${doctorId}`),
                    api.get(`/doctors/${doctorId}/availability`),
                ])
                setDoctor(dRes.data)
                setAvailability(aRes.data)
            } catch {
                toast.error('Doctor not found')
                navigate('/doctors')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [doctorId])

    const visibleDays = availability.slice(weekStart, weekStart + 7)
    const selectedDayData = selectedDate ? availability.find(d => isSameDay(new Date(d.date), selectedDate)) : null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedDate || !selectedSlot || !reason.trim()) {
            return toast.error('Please select a date, time slot, and reason')
        }
        setSubmitting(true)
        try {
            await api.post('/appointments', {
                doctorId,
                appointmentDate: selectedDate.toISOString(),
                timeSlot: selectedSlot,
                reason,
            })
            toast.success('Appointment booked successfully!')
            navigate('/patient/appointments')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="py-20"><Spinner /></div>
    if (!doctor) return null

    const docUser = doctor.userId || {}

    return (
        <div className="page-container animate-fadeIn max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Appointment</h1>
            <p className="text-gray-500 mb-6">Select your preferred date and time slot</p>

            {/* Doctor info */}
            <div className="card bg-blue-50 border-blue-100 mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                        {(docUser.name || 'D')?.[0]}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{docUser.name}</h3>
                        <p className="text-blue-600 text-sm">{doctor.specialization}</p>
                        <p className="text-gray-500 text-sm">Consultation fee: <span className="font-semibold text-gray-700">₹{doctor.consultationFee}</span></p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date selection */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-500" />Select Date</h3>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setWeekStart(Math.max(0, weekStart - 1))} disabled={weekStart === 0}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => setWeekStart(Math.min(availability.length - 1, weekStart + 1))} disabled={weekStart >= availability.length - 4}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {visibleDays.map(day => {
                            const date = new Date(day.date)
                            const isSelected = selectedDate && isSameDay(date, selectedDate)
                            const hasSlots = day.slots.length > 0
                            return (
                                <button key={day.date} type="button"
                                    disabled={!hasSlots}
                                    onClick={() => { setSelectedDate(date); setSelectedSlot('') }}
                                    className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all text-sm font-medium ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : hasSlots ? 'border-gray-200 hover:border-blue-300 text-gray-700' : 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'}`}>
                                    <span className="text-xs">{day.dayName?.slice(0, 3)}</span>
                                    <span className="text-lg font-bold mt-0.5">{format(date, 'd')}</span>
                                    <span className="text-xs mt-0.5">{hasSlots ? `${day.slots.length} slots` : 'Full'}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Time slot */}
                {selectedDate && selectedDayData && (
                    <div className="card animate-fadeIn">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4"><Clock className="h-5 w-5 text-blue-500" />Select Time</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {selectedDayData.slots.map(slot => (
                                <button key={slot} type="button" onClick={() => setSelectedSlot(slot)}
                                    className={`py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all ${selectedSlot === slot ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 hover:border-blue-300 text-gray-700'}`}>
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reason */}
                <div className="card">
                    <label className="form-label text-base font-semibold text-gray-900">Reason for Visit</label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                        className="form-input mt-2" placeholder="Please describe your symptoms or reason for this appointment..." required />
                </div>

                {/* Summary */}
                {selectedDate && selectedSlot && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fadeIn">
                        <p className="text-sm font-semibold text-green-700 mb-2">Appointment Summary</p>
                        <p className="text-sm text-gray-700">📅 {format(selectedDate, 'EEEE, dd MMMM yyyy')}</p>
                        <p className="text-sm text-gray-700">⏰ {selectedSlot}</p>
                        <p className="text-sm text-gray-700">💰 ₹{doctor.consultationFee}</p>
                    </div>
                )}

                <div className="flex gap-4">
                    <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Back</button>
                    <button type="submit" disabled={submitting || !selectedDate || !selectedSlot} className="btn-primary flex-1 flex items-center justify-center gap-2">
                        {submitting ? <Spinner size="sm" /> : 'Confirm Booking'}
                    </button>
                </div>
            </form>
        </div>
    )
}
