import { Link } from 'react-router-dom'
import { Heart, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
                            <div className="bg-blue-600 p-1.5 rounded-lg"><Heart className="h-5 w-5" /></div>
                            MediBook
                        </div>
                        <p className="text-sm leading-relaxed mb-4">
                            Your trusted platform for booking doctor appointments. Find specialists, check availability, and manage your health journey.
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-blue-400" /> <span>+91 98765 43210</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <Mail className="h-4 w-4 text-blue-400" /> <span>support@medibook.in</span>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-3">Quick Links</h4>
                        <div className="space-y-2 text-sm">
                            <Link to="/" className="block hover:text-blue-400 transition-colors">Home</Link>
                            <Link to="/doctors" className="block hover:text-blue-400 transition-colors">Find Doctors</Link>
                            <Link to="/register" className="block hover:text-blue-400 transition-colors">Register</Link>
                            <Link to="/login" className="block hover:text-blue-400 transition-colors">Login</Link>
                        </div>
                    </div>

                    {/* Specializations */}
                    <div>
                        <h4 className="text-white font-semibold mb-3">Specializations</h4>
                        <div className="space-y-2 text-sm">
                            {['Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician', 'Orthopedic'].map(s => (
                                <Link key={s} to={`/doctors?specialization=${s}`} className="block hover:text-blue-400 transition-colors">{s}</Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
                    © {new Date().getFullYear()} MediBook. All rights reserved. Built with ❤️ for better healthcare.
                </div>
            </div>
        </footer>
    )
}
