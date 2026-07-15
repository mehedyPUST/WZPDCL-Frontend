'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Users, Search, RefreshCw, Edit, Trash2,
    UserPlus, Shield, Mail, CalendarDays, MoreVertical,
    UserCheck, UserX
} from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    mobile?: string;
    image?: string;
}

const ROLES = ['consumer', 'xen', 'connection', 'billing', 'complaint', 'admin'];

const ROLE_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    admin: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <Shield size={14} /> },
    xen: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <UserCheck size={14} /> },
    connection: { bg: 'bg-orange-100', text: 'text-orange-700', icon: <UserCheck size={14} /> },
    billing: { bg: 'bg-teal-100', text: 'text-teal-700', icon: <UserCheck size={14} /> },
    complaint: { bg: 'bg-red-100', text: 'text-red-700', icon: <UserX size={14} /> },
    consumer: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <UserCheck size={14} /> },
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editRole, setEditRole] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [adminId, setAdminId] = useState<string | null>(null);

    // Get current admin's own ID
    useEffect(() => {
        const token = getCookie('token');
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => { if (data?._id) setAdminId(data._id); })
            .catch(console.error);
    }, []);

    const fetchData = useCallback(async () => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed');
            setUsers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message);
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
            result = result.filter(u =>
                u.name?.toLowerCase().includes(term) ||
                u.email?.toLowerCase().includes(term) ||
                u.mobile?.includes(term)
            );
        }
        return result;
    }, [users, searchTerm, filterRole]);

    const handleEditRole = async () => {
        if (!selectedUser || !editRole) return;
        if (selectedUser._id === adminId) {
            alert('You cannot change your own role.');
            return;
        }
        const token = getCookie('token');
        if (!token) return;
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
            setSelectedUser(null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        if (selectedUser._id === adminId) {
            alert('You cannot delete yourself.');
            return;
        }
        const token = getCookie('token');
        if (!token) return;
        setActionLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed');
            fetchData();
            setShowDeleteConfirm(false);
            setSelectedUser(null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                <Shield size={24} />
                <div>
                    <p className="font-medium">Error loading users</p>
                    <p className="text-sm">{error}</p>
                </div>
                <button onClick={fetchData} className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Retry</button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <Users size={28} className="text-emerald-600" />
                        </div>
                        User Management
                    </h2>
                    <p className="text-gray-500 mt-1 ml-14">Manage system users, roles, and permissions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white rounded-xl shadow-sm border px-4 py-2 flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">Total: <strong>{users.length}</strong></span>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">All Roles</option>
                            {ROLES.map(role => (
                                <option key={role} value={role} className="capitalize">{role}</option>
                            ))}
                        </select>
                        <button
                            onClick={fetchData}
                            className="p-3 border border-gray-200 rounded-xl hover:bg-emerald-50 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={18} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Grid */}
            {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-20 text-center">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-500">No users found</h3>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => {
                        const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.consumer;
                        const isCurrentAdmin = adminId && user._id === adminId;
                        return (
                            <div
                                key={user._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                            {user.image ? (
                                                <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span className="text-lg font-bold text-emerald-700">
                                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-800 truncate">{user.name}</h3>
                                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                <Mail size={12} />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isCurrentAdmin && (
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">You</span>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleStyle.bg} ${roleStyle.text}`}>
                                        {roleStyle.icon}
                                        <span className="capitalize">{user.role}</span>
                                    </span>

                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <CalendarDays size={12} />
                                        <span>{new Date(user.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </div>

                                {!isCurrentAdmin && (
                                    <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end gap-2">
                                        <button
                                            onClick={() => { setSelectedUser(user); setEditRole(user.role); setShowEditModal(true); }}
                                            className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                        >
                                            <Edit size={12} /> Edit Role
                                        </button>
                                        <button
                                            onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }}
                                            className="px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Edit Role Modal */}
            <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedUser(null); }} title="Change User Role">
                {selectedUser && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="font-bold text-emerald-700">{selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">{selectedUser.name}</p>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Role: <span className="capitalize font-semibold">{selectedUser.role}</span></label>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Role</label>
                            <select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                            >
                                {ROLES.map(role => (
                                    <option key={role} value={role} className="capitalize">{role}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                                className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditRole}
                                disabled={actionLoading}
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
                                {actionLoading ? 'Updating...' : 'Update Role'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setSelectedUser(null); }} title="Delete User">
                {selectedUser && (
                    <div className="space-y-5">
                        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                            <p className="text-red-700 font-medium">Are you sure you want to delete this user?</p>
                            <p className="text-sm text-red-600 mt-1">This action cannot be undone. All associated data will be permanently removed.</p>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="font-bold text-red-700">{selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">{selectedUser.name}</p>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}
                                className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                {actionLoading ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}