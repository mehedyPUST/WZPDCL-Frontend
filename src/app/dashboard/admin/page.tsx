// src/app/dashboard/admin/page.tsx
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Users, Zap, FileText, AlertTriangle,
    Search, RefreshCw, Shield, Edit, Trash2, UserCog
} from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

const ROLES = ['consumer', 'xen', 'connection', 'billing', 'complaint', 'admin'];

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editRole, setEditRole] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [stats, setStats] = useState({ totalUsers: 0, totalConnections: 0, totalBills: 0, totalComplaints: 0 });
    const [adminId, setAdminId] = useState<string | null>(null); // current admin's user ID

    // Fetch admin's own ID
    useEffect(() => {
        const token = getCookie('token');
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data?._id) setAdminId(data._id);
            })
            .catch(console.error);
    }, []);

    const fetchData = useCallback(async () => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [usersRes, connectionsRes, billsRes, complaintsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/all`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/all`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/complaints/all`, { headers }),
            ]);

            const usersData = await usersRes.json();
            const connectionsData = await connectionsRes.json();
            const billsData = await billsRes.json();
            const complaintsData = await complaintsRes.json();

            setUsers(Array.isArray(usersData) ? usersData : []);
            setStats({
                totalUsers: Array.isArray(usersData) ? usersData.length : 0,
                totalConnections: Array.isArray(connectionsData) ? connectionsData.length : 0,
                totalBills: Array.isArray(billsData) ? billsData.length : 0,
                totalComplaints: Array.isArray(complaintsData) ? complaintsData.length : 0,
            });
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredUsers = useMemo(() => {
        let result = users;
        if (filterRole !== 'all') result = result.filter(u => u.role === filterRole);
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(u => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term));
        }
        return result;
    }, [users, searchTerm, filterRole]);

    const handleEditRole = async () => {
        if (!selectedUser || !editRole) return;
        // Safety: prevent self-role change on client side
        if (selectedUser._id === adminId) {
            alert('You cannot change your own role.');
            return;
        }
        const token = getCookie('token');
        if (!token) return alert('Not authenticated');
        setActionLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/change-role/${selectedUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ role: editRole }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed');
            fetchData();
            setShowEditModal(false);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (userId === adminId) {
            alert('You cannot delete your own account.');
            return;
        }
        if (!confirm('Delete this user permanently?')) return;
        const token = getCookie('token');
        if (!token) return alert('Not authenticated');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed');
            fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const getRoleColor = (role: string) => {
        const map: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-700',
            xen: 'bg-blue-100 text-blue-700',
            connection: 'bg-orange-100 text-orange-700',
            billing: 'bg-teal-100 text-teal-700',
            complaint: 'bg-red-100 text-red-700',
            consumer: 'bg-emerald-100 text-emerald-700',
        };
        return map[role] || 'bg-gray-100 text-gray-700';
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;
    if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div>
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                        <Shield size={28} className="text-emerald-600" />
                    </div>
                    Admin Dashboard
                </h2>
                <p className="text-gray-500 mt-1 ml-14">System overview and user management</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Users size={24} />} label="Total Users" value={stats.totalUsers} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<Zap size={24} />} label="Connections" value={stats.totalConnections} color="bg-orange-100 text-orange-600" />
                <StatCard icon={<FileText size={24} />} label="Bills" value={stats.totalBills} color="bg-teal-100 text-teal-600" />
                <StatCard icon={<AlertTriangle size={24} />} label="Complaints" value={stats.totalComplaints} color="bg-red-100 text-red-600" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-4 py-3 border rounded-xl bg-gray-50 text-sm">
                        <option value="all">All Roles</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button onClick={fetchData} className="p-3 border rounded-xl hover:bg-emerald-50"><RefreshCw size={18} /></button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-gray-50 to-white border-b">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-400">No users found</td></tr>
                            ) : (
                                filteredUsers.map((user, idx) => {
                                    const isCurrentAdmin = adminId && user._id === adminId;
                                    return (
                                        <tr key={user._id} className={`hover:bg-emerald-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                                                        <span className="text-sm font-semibold text-emerald-700">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-xs text-gray-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>{user.role}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    {isCurrentAdmin ? (
                                                        <span className="text-xs text-gray-400 italic px-2">You</span>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => { setSelectedUser(user); setEditRole(user.role); setShowEditModal(true); }}
                                                                className="p-2 rounded-lg hover:bg-emerald-100 text-gray-500 hover:text-emerald-600 transition-colors"
                                                                title="Edit role"
                                                            ><Edit size={16} /></button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user._id)}
                                                                className="p-2 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                                                                title="Delete user"
                                                            ><Trash2 size={16} /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Role Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Change Role">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">{selectedUser?.name} ({selectedUser?.email})</p>
                    <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2.5"
                    >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                        <button onClick={handleEditRole} disabled={actionLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                            {actionLoading ? 'Saving...' : 'Update Role'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-5 border flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}