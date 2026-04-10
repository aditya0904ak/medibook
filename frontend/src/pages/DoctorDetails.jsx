import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, Award, DollarSign, MapPin, Calendar, ChevronLeft, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import api from '../api/axios'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'

export default function DoctorDetails() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [doctor, setDoctor] = useState(null)
    const [reviews, setReviews] = useState([])
    const [availability, setAvailability] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [dRes, rRes, aRes] = await Promise.all([
                    api.get(`/doctors/${id}`),
                    api.get(`/reviews/doctor/${id}`),
                    api.get(`/doctors/${id}/availability`),
                ])
                setDoctor(dRes.data)
                setReviews(rRes.data)
                setAvailability(aRes.data)
            } catch {
                navigate('/doctors')
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [id])

    if (loading) return <div className="py-20"><Spinner /></div>
    if (!doctor) return null

    const doctorUser = doctor.userId || {}
    const initials = doctorUser.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'
    const hasSlots = availability.some(d => d.slots.length > 0)

    return (
        <div className="page-container animate-fadeIn">
            {/* Back */}
            <Link to="/doctors" className="flex items-center gap-1 text-gray-500 hover:text-blue-600 text-sm mb-6 transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back to Doctors
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Profile */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile card */}
                    <div className="card">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                                {initials}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900">{doctorUser.name}</h1>
                                <p className="text-blue-600 font-semibold text-lg">{doctor.specialization}</p>
                                <div className="flex flex-wrap gap-4 mt-3">
                                    <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className={`h-4 w-4 ${i <= Math.round(doctor.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                        ))}
                                        <span className="text-sm text-gray-500">{doctor.rating} ({doctor.totalReviews} reviews)</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                                    <span className="flex items-center gap-1"><Award className="h-4 w-4 text-blue-400" />{doctor.experience} years experience</span>
                                    <span className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-green-500" />₹{doctor.consultationFee} consultation</span>
                                    {doctor.clinicAddress && <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-red-400" />{doctor.clinicAddress}</span>}
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        {doctor.about && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{doctor.about}</p>
                            </div>
                        )}

                        {/* Qualifications */}
                        {doctor.qualifications?.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Qualifications</h3>
                                <div className="flex flex-wrap gap-2">
                                    {doctor.qualifications.map(q => (
                                        <span key={q} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{q}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reviews */}
                    <div className="card">
                        <h2 className="section-title flex items-center gap-2"><MessageSquare className="h-5 w-5 text-blue-500" /> Patient Reviews</h2>
                        {reviews.length === 0 ? (
                            <p className="text-gray-500 text-sm">No reviews yet</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map(review => (
                                    <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                                                {review.patientId?.name?.[0] || 'P'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{review.patientId?.name || 'Patient'}</p>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`h-3 w-3 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}
                                                </div>
                                            </div>
                                            <span className="ml-auto text-xs text-gray-400">{format(new Date(review.createdAt), 'dd MMM yyyy')}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2 ml-11">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Booking */}
                <div>
                    <div className="card sticky top-24">
                        <h2 className="section-title flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-500" /> Availability</h2>

                        {!hasSlots ? (
                            <p className="text-gray-500 text-sm">No available slots in the next 7 days</p>
                        ) : (
                            <div className="space-y-3 mb-6">
                                {availability.filter(d => d.slots.length > 0).slice(0, 3).map(day => (
                                    <div key={day.date} className="bg-blue-50 rounded-lg p-3">
                                        <p className="text-sm font-semibold text-blue-700">{day.dayName} · {format(new Date(day.date), 'dd MMM')}</p>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {day.slots.slice(0, 4).map(slot => (
                                                <span key={slot} className="bg-white text-blue-600 border border-blue-200 px-2 py-0.5 rounded text-xs">{slot}</span>
                                            ))}
                                            {day.slots.length > 4 && <span className="text-xs text-gray-400">+{day.slots.length - 4} more</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {user ? (
                            user.role === 'patient' ? (
                                <Link to={`/patient/book/${doctor._id}`} className="btn-primary w-full text-center block">
                                    Book Appointment
                                </Link>
                            ) : (
                                <p className="text-sm text-gray-500 text-center">Only patients can book appointments</p>
                            )
                        ) : (
                            <Link to="/login" className="btn-primary w-full text-center block">Login to Book</Link>
                        )}

                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400">Consultation fee: <span className="font-semibold text-gray-700">₹{doctor.consultationFee}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
