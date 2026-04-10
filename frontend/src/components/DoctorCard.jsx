import { Link } from 'react-router-dom'
import { Star, Clock, DollarSign, Award } from 'lucide-react'

export default function DoctorCard({ doctor }) {
    const user = doctor.userId || {}

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'DR'

    return (
        <div className="card hover:shadow-lg transition-all duration-300 group">
            <Link to={`/doctors/${doctor._id}`}>
                {/* Avatar & basic info */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.name} className="h-16 w-16 rounded-xl object-cover" />
                        ) : initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {user.name || 'Doctor'}
                        </h3>
                        <p className="text-blue-600 text-sm font-medium">{doctor.specialization}</p>
                        <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(doctor.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">({doctor.totalReviews})</span>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <Award className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        <span>{doctor.experience} yrs exp</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <DollarSign className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>₹{doctor.consultationFee}</span>
                    </div>
                </div>

                {/* Book button */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="block w-full text-center bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                        View Profile & Book
                    </span>
                </div>
            </Link>
        </div>
    )
}
