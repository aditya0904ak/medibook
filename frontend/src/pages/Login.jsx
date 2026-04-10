import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Heart, Eye, EyeOff } from 'lucide-react'
import Spinner from '../components/Spinner'

export default function Login() {
    const { login, user } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [showPwd, setShowPwd] = useState(false)

    if (user) {
        const routes = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' }
        navigate(routes[user.role] || '/')
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.email || !form.password) return toast.error('Please fill in all fields')
        setLoading(true)
        try {
            await login(form.email, form.password)
            toast.success('Logged in successfully!')
            // navigation handled by useEffect in App
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const loginAsDemo = async (email) => {
        setForm({ email, password: 'password123' })
        setLoading(true)
        try {
            await login(email, 'password123')
            toast.success('Demo login successful!')
        } catch {
            toast.error('Demo login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left: Form */}
            <div className="flex-1 flex items-center justify-center px-8 py-12">
                <div className="w-full max-w-md">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-blue-600 p-2 rounded-xl"><Heart className="h-6 w-6 text-white" /></div>
                        <span className="font-bold text-xl text-blue-600">MediBook</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
                    <p className="text-gray-500 text-sm mb-8">Sign in to your account to continue</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="form-label">Email address</label>
                            <input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="you@example.com" className="form-input" required />
                        </div>
                        <div>
                            <label className="form-label">Password</label>
                            <div className="relative">
                                <input id="password" type={showPwd ? 'text' : 'password'} value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••" className="form-input pr-10" required />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                            {loading ? <Spinner size="sm" /> : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account? <Link to="/register" className="text-blue-600 hover:underline font-medium">Register here</Link>
                    </p>

                    {/* Demo credentials */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                        <p className="text-xs font-semibold text-gray-600 mb-3">DEMO ACCOUNTS</p>
                        <div className="space-y-2">
                            {[
                                ['Patient', 'aditya.kumar@gmail.com'],
                                ['Doctor', 'aarav.sharma@medibook.com'],
                                ['Admin', 'admin@medibook.com'],
                            ].map(([role, email]) => (
                                <button key={role} onClick={() => loginAsDemo(email)}
                                    className="w-full text-left text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-blue-300 hover:bg-blue-50 transition-all flex justify-between items-center">
                                    <span className="font-medium text-gray-700">{role}</span>
                                    <span className="text-gray-400">{email}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Visual */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-cyan-500 items-center justify-center relative overflow-hidden">
                <div className="text-white text-center p-12 relative z-10">
                    <h2 className="text-4xl font-bold mb-4">Your Health Journey<br />Starts Here</h2>
                    <p className="text-blue-100 text-lg">Book appointments, manage health records, and connect with top specialists.</p>
                </div>
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-white blur-3xl" />
                    <div className="absolute bottom-20 left-20 h-48 w-48 rounded-full bg-cyan-300 blur-3xl" />
                </div>
            </div>
        </div>
    )
}
