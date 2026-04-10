import { format } from 'date-fns'
import { Calendar, Clock, User, FileText } from 'lucide-react'

const statusConfig = {
    pending: { cls: 'badge-pending', label: 'Pending' },
    confirmed: { cls: 'badge-confirmed', label: 'Confirmed' },
    completed: { cls: 'badge-completed', label: 'Completed' },
    cancelled: { cls: 'badge-cancelled', label: 'Cancelled' },
}

export default function AppointmentCard({ appointment, actions }) {
    const doctor = appointment.doctorId
    const doctorUser = doctor?.userId || {}
    const patient = appointment.patientId || {}
    const cfg = statusConfig[appointment.status] || statusConfig.pending

    return (
        <div className="card">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {(doctorUser.name || patient.name || 'D')?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate">
                                {doctorUser.name ? `Dr. ${doctorUser.name.split(' ').slice(-1)[0]}` : patient.name || 'Unknown'}
                            </h3>
                            <span className={cfg.cls}>{cfg.label}</span>
                        </div>
                        {doctor?.specialization && (
                            <p className="text-sm text-blue-600">{doctor.specialization}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(appointment.appointmentDate), 'dd MMM yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {appointment.timeSlot}
                            </span>
                        </div>
                        {appointment.reason && (
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{appointment.reason}</span>
                            </p>
                        )}
                        {appointment.notes && appointment.notes !== '' && (
                            <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded p-2">📝 {appointment.notes}</p>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                {actions && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}
