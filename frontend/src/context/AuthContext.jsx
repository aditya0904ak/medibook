import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [doctorProfile, setDoctorProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('medibook_token')
        if (token) {
            fetchProfile()
        } else {
            setLoading(false)
        }
    }, [])

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/profile')
            setUser(data.user)
            if (data.doctorProfile) setDoctorProfile(data.doctorProfile)
        } catch {
            localStorage.removeItem('medibook_token')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        localStorage.setItem('medibook_token', data.token)
        setUser(data.user)
        if (data.doctorProfile) setDoctorProfile(data.doctorProfile)
        return data.user
    }

    const register = async (formData) => {
        const { data } = await api.post('/auth/register', formData)
        localStorage.setItem('medibook_token', data.token)
        setUser(data.user)
        return data.user
    }

    const logout = () => {
        localStorage.removeItem('medibook_token')
        setUser(null)
        setDoctorProfile(null)
    }

    const updateProfile = async (updates) => {
        const { data } = await api.put('/auth/profile', updates)
        setUser(data.user)
        await fetchProfile()
        return data
    }

    return (
        <AuthContext.Provider value={{ user, doctorProfile, loading, login, register, logout, updateProfile, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
