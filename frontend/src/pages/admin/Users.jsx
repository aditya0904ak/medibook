import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Trash2, Search, User } from 'lucide-react'
import { format } from 'date-fns'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'

const ROLE_TABS = ['All', 'patient', 'doctor']

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('All')
    const [search, setSearch] = useState('')

    const fetchUsers = () => {
        setLoading(true)
        const params = tab !== 'All' ? { role: tab } : {}
        api.get('/admin/users', { params }).then(({ data }) => setUsers(data)).finally(() => setLoading(false))
    }

    useEffect(() => { fetchUsers() }, [tab])

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
        try {
            await api.delete(`/admin/users/${id}`)
            toast.success('User deleted')
            fetchUsers()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete')
        }
    }

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="page-container animate-fadeIn">
            <h1 className="page-title">Manage Users</h1>

            {/* Search + Tabs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                        className="form-input pl-10" />
                </div>
                <div className="flex gap-2">
                    {ROLE_TABS.map(r => (
                        <button key={r} onClick={() => setTab(r)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === r ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <Spinner /> : (
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-6 py-3 text-gray-600 font-semibold">User</th>
                                    <th className="text-left px-6 py-3 text-gray-600 font-semibold">Role</th>
                                    <th className="text-left px-6 py-3 text-gray-600 font-semibold">Phone</th>
                                    <th className="text-left px-6 py-3 text-gray-600 font-semibold">Joined</th>
                                    <th className="text-left px-6 py-3 text-gray-600 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(u => (
                                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {u.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{u.name}</p>
                                                    <p className="text-xs text-gray-400">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><span className={`badge-${u.role === 'admin' ? 'confirmed' : u.role === 'doctor' ? 'completed' : 'pending'} capitalize`}>{u.role}</span></td>
                                        <td className="px-6 py-4 text-gray-600">{u.phone || '-'}</td>
                                        <td className="px-6 py-4 text-gray-400">{format(new Date(u.createdAt), 'dd MMM yyyy')}</td>
                                        <td className="px-6 py-4">
                                            {u.role !== 'admin' && (
                                                <button onClick={() => handleDelete(u._id, u.name)} className="text-red-500 hover:text-red-700 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-10 text-gray-400">No users found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
