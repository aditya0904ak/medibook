import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Menu, X, Heart, User, LogOut, Calendar, LayoutDashboard, Users, Stethoscope } from 'lucide-react'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/')
        setMobileOpen(false)
    }

    const getDashboardLink = () => {
        if (!user) return '/login'
        const routes = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' }
        return routes[user.role] || '/login'
    }

    const isActive = (path) => location.pathname === path

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Heart className="h-5 w-5 text-white" />
                        </div>
                        MediBook
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Home</Link>
                        <Link to="/doctors" className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/doctors') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Find Doctors</Link>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link to={getDashboardLink()} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                        {user.name?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-blue-700">{user.name?.split(' ')[0]}</span>
                                </div>
                                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1">
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Login</Link>
                                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Register</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button className="md:hidden p-2 text-gray-500" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-fadeIn">
                        <Link to="/" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg">Home</Link>
                        <Link to="/doctors" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg">Find Doctors</Link>
                        {user ? (
                            <>
                                <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg">Dashboard</Link>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg">Login</Link>
                                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Register</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}
