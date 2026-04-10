import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import api from '../api/axios'
import DoctorCard from '../components/DoctorCard'
import Spinner from '../components/Spinner'

const SPECIALIZATIONS = ['All', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist', 'General Physician', 'Gynecologist']

export default function Doctors() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '')
    const [maxFee, setMaxFee] = useState('')
    const [minRating, setMinRating] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        fetchDoctors()
    }, [specialization, maxFee, minRating])

    const fetchDoctors = async () => {
        setLoading(true)
        try {
            const params = {}
            if (specialization) params.specialization = specialization
            if (maxFee) params.maxFee = maxFee
            if (minRating) params.minRating = minRating
            if (search) params.search = search
            const { data } = await api.get('/doctors', { params })
            setDoctors(data)
        } catch {
            setDoctors([])
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        fetchDoctors()
    }

    const clearFilters = () => {
        setSpecialization('')
        setMaxFee('')
        setMinRating('')
        setSearch('')
    }

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>
                <p className="text-gray-500 mt-1">Browse our verified specialists and book your appointment</p>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or specialization..."
                    className="form-input flex-1"
                />
                <button type="submit" className="btn-primary">Search</button>
                <button type="button" onClick={() => setShowFilters(!showFilters)}
                    className="border border-gray-300 px-4 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                </button>
            </form>

            {/* Filters panel */}
            {showFilters && (
                <div className="card mb-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                        <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                            <X className="h-3.5 w-3.5" /> Clear all
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="form-label">Specialization</label>
                            <select value={specialization} onChange={e => setSpecialization(e.target.value === 'All' ? '' : e.target.value)} className="form-input">
                                {SPECIALIZATIONS.map(s => <option key={s} value={s === 'All' ? '' : s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Max Fee (₹)</label>
                            <input type="number" value={maxFee} onChange={e => setMaxFee(e.target.value)} placeholder="e.g. 1000" className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Min Rating</label>
                            <select value={minRating} onChange={e => setMinRating(e.target.value)} className="form-input">
                                <option value="">Any rating</option>
                                <option value="3">3+ stars</option>
                                <option value="4">4+ stars</option>
                                <option value="4.5">4.5+ stars</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Specialization pills */}
            <div className="flex flex-wrap gap-2 mb-6">
                {SPECIALIZATIONS.map(s => (
                    <button key={s} onClick={() => setSpecialization(s === 'All' ? '' : s)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${(s === 'All' && !specialization) || specialization === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Results */}
            {loading ? (
                <div className="py-16"><Spinner /></div>
            ) : doctors.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <p className="text-lg mb-2">No doctors found</p>
                    <button onClick={clearFilters} className="text-blue-600 hover:underline">Clear filters</button>
                </div>
            ) : (
                <>
                    <p className="text-sm text-gray-500 mb-5">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {doctors.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
                    </div>
                </>
            )}
        </div>
    )
}
