import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Heart, Eye, EyeOff } from 'lucide-react'
import Spinner from '../components/Spinner'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'patient', specialization: '' })
    const [loading, setLoading] = useState(false)
    const [showPwd, setShowPwd] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.password) return toast.error('Please fill in all required fields')
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
        setLoading(true)
        try {
            const user = await register(form)
            toast.success('Account created successfully!')
            const routes = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' }
            navigate(routes[user.role] || '/')
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left: Visual */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-cyan-500 items-center justify-center relative overflow-hidden">
                <div className="text-white text-center p-12 relative z-10">
                    <h2 className="text-4xl font-bold mb-4">Join MediBook Today</h2>
                    <p className="text-blue-100 text-lg">Access India's largest network of verified doctors and specialists.</p>
                    <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                        {[['50+', 'Doctors'], ['1000+', 'Patients'], ['100%', 'Verified'], ['4.8★', 'Rating']].map(([n, l]) => (
                            <div key={l} className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <div className="text-2xl font-bold">{n}</div>
                                <div className="text-blue-200 text-sm">{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-white blur-3xl" />
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex-1 flex items-center justify-center px-8 py-12">
                <div className="w-full max-w-md">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-blue-600 p-2 rounded-xl"><Heart className="h-6 w-6 text-white" /></div>
                        <span className="font-bold text-xl text-blue-600">MediBook</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
                    <p className="text-gray-500 text-sm mb-8">Join thousands of patients and doctors on MediBook</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="form-label">I am a</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['patient', 'doctor'].map(r => (
                                    <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                                        className={`py-3 rounded-xl border-2 font-medium text-sm capitalize transition-all ${form.role === r ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Full Name <span className="text-red-500">*</span></label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="Dr. John Smith" className="form-input" required />
                        </div>

                        <div>
                            <label className="form-label">Email Address <span className="text-red-500">*</span></label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="you@example.com" className="form-input" required />
                        </div>

                        <div>
                            <label className="form-label">Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input type={showPwd ? 'text' : 'password'} value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder="Min. 6 characters" className="form-input pr-10" required />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Phone Number</label>
                            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                placeholder="+91 98765 43210" className="form-input" />
                        </div>

                        {form.role === 'doctor' && (
                            <div>
                                <label className="form-label">Specialization</label>
                                <select value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} className="form-input">
                                    <option value="">Select specialization</option>
                                    {['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist', 'General Physician', 'Gynecologist'].map(s =>
                                        <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                            {loading ? <Spinner size="sm" /> : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
