import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Save, Calendar } from 'lucide-react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import { format } from 'date-fns'

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

export default function DoctorSchedule() {
    const [doctor, setDoctor] = useState(null)
    const [availability, setAvailability] = useState([])
    const [unavailableDates, setUnavailableDates] = useState([])
    const [consultationFee, setConsultationFee] = useState(0)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [newDate, setNewDate] = useState('')

    useEffect(() => {
        api.get('/auth/profile').then(({ data }) => {
            const doc = data.doctorProfile
            if (doc) {
                setDoctor(doc)
                setAvailability(doc.availability || [])
                setUnavailableDates((doc.unavailableDates || []).map(d => format(new Date(d), 'yyyy-MM-dd')))
                setConsultationFee(doc.consultationFee || 0)
            }
        }).finally(() => setLoading(false))
    }, [])

    const toggleDay = (day) => {
        const exists = availability.find(a => a.day === day)
        if (exists) {
            setAvailability(availability.filter(a => a.day !== day))
        } else {
            setAvailability([...availability, { day, slots: ['09:00', '10:00', '11:00'] }])
        }
    }

    const toggleSlot = (day, slot) => {
        setAvailability(availability.map(a => {
            if (a.day !== day) return a
            const hasSlot = a.slots.includes(slot)
            return { ...a, slots: hasSlot ? a.slots.filter(s => s !== slot) : [...a.slots, slot].sort() }
        }))
    }

    const addUnavailableDate = () => {
        if (!newDate || unavailableDates.includes(newDate)) return
        setUnavailableDates([...unavailableDates, newDate])
        setNewDate('')
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.put('/doctors/availability', {
                availability,
                unavailableDates: unavailableDates.map(d => new Date(d).toISOString()),
                consultationFee: Number(consultationFee),
            })
            toast.success('Schedule updated successfully!')
        } catch {
            toast.error('Failed to save schedule')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="py-20"><Spinner /></div>

    return (
        <div className="page-container animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
                <h1 className="page-title mb-0">Manage Schedule</h1>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? <Spinner size="sm" /> : <><Save className="h-4 w-4" /> Save Changes</>}
                </button>
            </div>

            {/* Consultation fee */}
            <div className="card mb-6">
                <h3 className="section-title">Consultation Fee</h3>
                <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-medium">₹</span>
                    <input type="number" value={consultationFee} onChange={e => setConsultationFee(e.target.value)}
                        className="form-input max-w-xs" min="0" step="50" />
                </div>
            </div>

            {/* Weekly availability */}
            <div className="card mb-6">
                <h3 className="section-title">Weekly Availability</h3>
                <p className="text-sm text-gray-500 mb-4">Select your working days and available time slots</p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {ALL_DAYS.map(day => {
                        const active = availability.some(a => a.day === day)
                        return (
                            <button key={day} onClick={() => toggleDay(day)}
                                className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${active ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                                {day.slice(0, 3)}
                            </button>
                        )
                    })}
                </div>

                {availability.length > 0 && (
                    <div className="space-y-5">
                        {ALL_DAYS.filter(d => availability.some(a => a.day === d)).map(day => {
                            const dayData = availability.find(a => a.day === day)
                            return (
                                <div key={day} className="border border-gray-100 rounded-xl p-4">
                                    <p className="font-semibold text-gray-700 mb-3">{day}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {TIME_SLOTS.map(slot => {
                                            const active = dayData.slots.includes(slot)
                                            return (
                                                <button key={slot} onClick={() => toggleSlot(day, slot)}
                                                    className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${active ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                                                    {slot}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Blocked dates */}
            <div className="card">
                <h3 className="section-title flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-500" /> Blocked Dates</h3>
                <p className="text-sm text-gray-500 mb-4">Add dates when you'll be unavailable</p>

                <div className="flex gap-2 mb-4">
                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')} className="form-input flex-1 max-w-xs" />
                    <button onClick={addUnavailableDate} className="btn-primary flex items-center gap-1 px-4">
                        <Plus className="h-4 w-4" /> Add
                    </button>
                </div>

                {unavailableDates.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {unavailableDates.map(d => (
                            <div key={d} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                                <span className="text-sm text-red-700">{format(new Date(d + 'T00:00:00'), 'dd MMM yyyy')}</span>
                                <button onClick={() => setUnavailableDates(unavailableDates.filter(x => x !== d))} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">No blocked dates added</p>
                )}
            </div>
        </div>
    )
}
