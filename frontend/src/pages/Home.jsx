import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Star, Clock, Shield, Heart, ChevronRight, Stethoscope } from 'lucide-react'
import api from '../api/axios'
import DoctorCard from '../components/DoctorCard'
import Spinner from '../components/Spinner'

const SPECIALIZATIONS = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist', 'General Physician', 'Gynecologist']

const FEATURES = [
    { icon: <Search className="h-6 w-6" />, title: 'Find Specialists', desc: 'Search from 50+ specializations with verified doctors.' },
    { icon: <Clock className="h-6 w-6" />, title: 'Easy Scheduling', desc: 'Book appointments in minutes with real-time slot availability.' },
    { icon: <Shield className="h-6 w-6" />, title: 'Secure & Private', desc: 'Your health data is encrypted and completely private.' },
    { icon: <Star className="h-6 w-6" />, title: 'Trusted Reviews', desc: 'Real patient reviews to help you choose the right doctor.' },
]

export default function Home() {
    const [search, setSearch] = useState('')
    const [featuredDoctors, setFeaturedDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        api.get('/doctors').then(({ data }) => {
            setFeaturedDoctors(data.slice(0, 4))
        }).catch(() => { }).finally(() => setLoading(false))
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        navigate(`/doctors?search=${encodeURIComponent(search)}`)
    }

    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-20 h-64 w-64 rounded-full bg-white blur-3xl" />
                    <div className="absolute bottom-10 left-20 h-48 w-48 rounded-full bg-cyan-300 blur-3xl" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Heart className="h-4 w-4 text-red-300" /> Your Health, Our Priority
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
                            Book Doctor Appointments <span className="text-cyan-300">Instantly</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                            Find verified specialists, check real-time availability, and manage your health appointments seamlessly with MediBook.
                        </p>

                        {/* Search bar */}
                        <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by doctor name or specialization..."
                                    className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
                                />
                            </div>
                            <button type="submit" className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg whitespace-nowrap">
                                Search
                            </button>
                        </form>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-8 mt-12">
                            {[['50+', 'Specialist Doctors'], ['1000+', 'Happy Patients'], ['4.8★', 'Average Rating']].map(([stat, label]) => (
                                <div key={label}>
                                    <div className="text-3xl font-bold">{stat}</div>
                                    <div className="text-blue-200 text-sm">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Specializations */}
            <section className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse by Specialization</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {SPECIALIZATIONS.map(spec => (
                            <Link key={spec} to={`/doctors?specialization=${encodeURIComponent(spec)}`}
                                className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 group">
                                <Stethoscope className="h-4 w-4" />
                                {spec}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Why Choose MediBook?</h2>
                        <p className="text-gray-500 mt-3">A seamless healthcare experience at your fingertips</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map(f => (
                            <div key={f.title} className="card text-center hover:border-blue-200 hover:shadow-lg transition-all">
                                <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">{f.icon}</div>
                                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                                <p className="text-gray-500 text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Doctors */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Top Doctors</h2>
                            <p className="text-gray-500 mt-1">Meet our highly rated specialists</p>
                        </div>
                        <Link to="/doctors" className="btn-outline py-2 px-4 text-sm flex items-center gap-1">
                            View All <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="py-12"><Spinner /></div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredDoctors.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Banner */}
            <section className="gradient-medical text-white py-16">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl font-bold mb-4">Ready to Book Your Appointment?</h2>
                    <p className="text-blue-100 mb-8 text-lg">Join thousands of patients who trust MediBook for their healthcare needs.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/register" className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">Register Now</Link>
                        <Link to="/doctors" className="border border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">Find Doctors</Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
