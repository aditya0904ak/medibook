import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Save, Plus, X } from 'lucide-react'
import Spinner from '../../components/Spinner'

const SPECIALIZATIONS = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist', 'General Physician', 'Gynecologist']

export default function DoctorProfile() {
    const { user, doctorProfile, updateProfile } = useAuth()
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        specialization: doctorProfile?.specialization || '',
        about: doctorProfile?.about || '',
        clinicAddress: doctorProfile?.clinicAddress || '',
        experience: doctorProfile?.experience || 0,
        consultationFee: doctorProfile?.consultationFee || 0,
        qualifications: doctorProfile?.qualifications || [],
        password: '',
    })
    const [newQual, setNewQual] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const updates = { ...form }
            if (!updates.password) delete updates.password
            await updateProfile(updates)
            toast.success('Profile updated successfully!')
        } catch {
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const addQual = () => {
        if (!newQual.trim()) return
        setForm(f => ({ ...f, qualifications: [...f.qualifications, newQual.trim()] }))
        setNewQual('')
    }

    return (
        <div className="page-container animate-fadeIn max-w-2xl">
            <h1 className="page-title">Doctor Profile</h1>

            {/* Avatar */}
            <div className="card mb-6 text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                    {user?.name?.[0]?.toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-blue-600 font-semibold">{doctorProfile?.specialization}</p>
                <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            </div>

            {/* Edit form */}
            <div className="card">
                <h3 className="section-title">Edit Profile</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Full Name</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="form-input" required />
                        </div>
                        <div>
                            <label className="form-label">Phone</label>
                            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="form-input" />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Specialization</label>
                        <select value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} className="form-input">
                            {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Experience (years)</label>
                            <input type="number" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} className="form-input" min="0" />
                        </div>
                        <div>
                            <label className="form-label">Consultation Fee (₹)</label>
                            <input type="number" value={form.consultationFee} onChange={e => setForm({ ...form, consultationFee: e.target.value })} className="form-input" min="0" step="50" />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">About</label>
                        <textarea value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} rows={3} className="form-input" placeholder="Describe your expertise..." />
                    </div>

                    <div>
                        <label className="form-label">Clinic Address</label>
                        <input type="text" value={form.clinicAddress} onChange={e => setForm({ ...form, clinicAddress: e.target.value })} className="form-input" />
                    </div>

                    {/* Qualifications */}
                    <div>
                        <label className="form-label">Qualifications</label>
                        <div className="flex gap-2 mb-2">
                            <input type="text" value={newQual} onChange={e => setNewQual(e.target.value)} className="form-input flex-1" placeholder="e.g. MBBS, MD" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addQual())} />
                            <button type="button" onClick={addQual} className="btn-secondary px-3"><Plus className="h-4 w-4" /></button>
                        </div>
                        {form.qualifications.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {form.qualifications.map((q, i) => (
                                    <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                        {q}
                                        <button type="button" onClick={() => setForm(f => ({ ...f, qualifications: f.qualifications.filter((_, j) => j !== i) }))}><X className="h-3 w-3" /></button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="form-label">New Password (optional)</label>
                        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="form-input" placeholder="Leave blank to keep current" />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                        {loading ? <Spinner size="sm" /> : <><Save className="h-4 w-4" /> Save Profile</>}
                    </button>
                </form>
            </div>
        </div>
    )
}
