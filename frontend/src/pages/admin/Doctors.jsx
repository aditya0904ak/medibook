import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, Star, Award } from 'lucide-react'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'

export default function AdminDoctors() {
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('all')

    const fetchDoctors = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/doctors')
            setDoctors(data)
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchDoctors() }, [])

    const handleVerify = async (id) => {
        try {
            await api.put(`/admin/doctors/${id}/verify`)
            toast.success('Doctor verified!')
            fetchDoctors()
        } catch {
            toast.error('Failed to verify')
        }
    }

    const filtered = tab === 'pending' ? doctors.filter(d => !d.isVerified) : doctors

    return (
        <div className="page-container animate-fadeIn">
            <h1 className="page-title">Manage Doctors</h1>

            <div className="flex gap-2 mb-6">
                {[['all', 'All Doctors'], ['pending', 'Pending Verification']].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${tab === key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {loading ? <Spinner /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(doctor => {
                        const docUser = doctor.userId || {}
                        return (
                            <div key={doctor._id} className="card">
                                <div className="flex items-start gap-4">
                                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                        {(docUser.name || 'D')?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-gray-900 truncate">{docUser.name}</h3>
                                            {doctor.isVerified ? (
                                                <span className="badge-completed flex items-center gap-0.5"><CheckCircle className="h-3 w-3" /> Verified</span>
                                            ) : (
                                                <span className="badge-pending">Pending</span>
                                            )}
                                        </div>
                                        <p className="text-blue-600 text-sm">{doctor.specialization}</p>
                                        <p className="text-xs text-gray-400">{docUser.email}</p>
                                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" />{doctor.experience}y</span>
                                            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />{doctor.rating}</span>
                                            <span>₹{doctor.consultationFee}</span>
                                        </div>
                                    </div>
                                </div>

                                {!doctor.isVerified && (
                                    <button onClick={() => handleVerify(doctor._id)} className="btn-primary w-full mt-4 py-2 text-sm flex items-center justify-center gap-1">
                                        <CheckCircle className="h-4 w-4" /> Verify Doctor
                                    </button>
                                )}
                            </div>
                        )
                    })}
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-16 text-gray-400">
                            {tab === 'pending' ? 'No pending verifications' : 'No doctors found'}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
