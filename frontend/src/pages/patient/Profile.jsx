import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { User, Phone, Mail, Save } from 'lucide-react'
import Spinner from '../../components/Spinner'

export default function PatientProfile() {
    const { user, updateProfile } = useAuth()
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', password: '', confirmPassword: '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.password && form.password !== form.confirmPassword) return toast.error('Passwords do not match')
        if (form.password && form.password.length < 6) return toast.error('Password must be at least 6 characters')
        setLoading(true)
        try {
            const updates = { name: form.name, phone: form.phone }
            if (form.password) updates.password = form.password
            await updateProfile(updates)
            toast.success('Profile updated!')
            setForm(f => ({ ...f, password: '', confirmPassword: '' }))
        } catch {
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-container animate-fadeIn max-w-2xl">
            <h1 className="page-title">My Profile</h1>

            {/* Avatar */}
            <div className="card mb-6 text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                    {user?.name?.[0]?.toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-500 text-sm capitalize mt-1">{user?.role}</p>
                <div className="flex justify-center gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Mail className="h-4 w-4 text-blue-400" />{user?.email}</span>
                    {user?.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4 text-blue-400" />{user.phone}</span>}
                </div>
            </div>

            {/* Edit form */}
            <div className="card">
                <h3 className="section-title">Edit Profile</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">Full Name</label>
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="form-input" required />
                    </div>

                    <div>
                        <label className="form-label">Email Address</label>
                        <input type="email" value={user?.email} className="form-input bg-gray-50 cursor-not-allowed" disabled />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="form-label">Phone Number</label>
                        <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="form-input" placeholder="+91 98765 43210" />
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Change Password (optional)</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="form-label">New Password</label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="form-input" placeholder="Leave blank to keep current" />
                            </div>
                            <div>
                                <label className="form-label">Confirm New Password</label>
                                <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                    className="form-input" placeholder="Confirm new password" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                        {loading ? <Spinner size="sm" /> : <><Save className="h-4 w-4" /> Save Changes</>}
                    </button>
                </form>
            </div>
        </div>
    )
}
