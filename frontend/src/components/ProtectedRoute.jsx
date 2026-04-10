import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth()

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>

    if (!user) return <Navigate to="/login" replace />

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const redirects = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' }
        return <Navigate to={redirects[user.role] || '/'} replace />
    }

    return children
}
