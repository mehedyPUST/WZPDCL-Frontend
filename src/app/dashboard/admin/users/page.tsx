// src/app/dashboard/admin/users/page.tsx
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Users, Search, RefreshCw, Edit, Trash2,
    Shield, Mail, CalendarDays, ShieldCheck, UserCheck,
    UserX, AlertTriangle, Key, Calendar, Phone, CheckCircle,
    Sliders, Settings, BadgeAlert, Sparkles, SlidersHorizontal
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

const ROLE_DETAILS: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    admin: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/50', icon: <Shield size={12} className="text-purple-500" /> },
    xen: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/50', icon: <UserCheck size={12} className="text-blue-500" /> },
    connection: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200/50', icon: <Sliders size={12} className="text-orange-500" /> },
    billing: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200/50', icon: <CheckCircle size={12} className="text-teal-500" /> },
    complaint: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200/50', icon: <UserX size={12} className="text-red-500" /> },
    consumer: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/50', icon: <Users size={12} className="text-emerald-500" /> },
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
        setLoading(true);
        setError('');
        const token = getCookie('token');
        if (!token) { setError('Not authenticated. Please log in.'); setLoading(false); return; }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to sync users directory.');
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

    const roleStats = useMemo(() => {
        const counts: Record<string, number> = { admin: 0, xen: 0, consumer: 0, employee: 0 };
        users.forEach(u => {
            const r = u.role?.toLowerCase();
            if (r === 'admin' || r === 'xen' || r === 'consumer') {
                counts[r] = (counts[r] || 0) + 1;
            } else {
                counts.employee = (counts.employee || 0) + 1;
            }
        });
        return counts;
    }, [users]);

    const handleEditRole = async () => {
        if (!selectedUser || !editRole) return;
        if (selectedUser._id === adminId) {
            alert('Security Safeguard: You cannot modify your own administrative credentials.');
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
            alert('Security Safeguard: You are logged in with this account. Self-decommission is prohibited.');
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
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
                <p className="text-sm font-medium text-gray-500">Retrieving system identity registry...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex items-start gap-4 max-w-2xl mx-auto my-12 shadow-sm animate-in fade-in">
                <AlertTriangle size={24} className="mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                    <p className="font-bold text-red-900">Handshake Failure</p>
                    <p className="text-sm text-red-700">{error}</p>
                    <button onClick={fetchData} className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5">
                        <RefreshCw size={12} /> Sync Directory
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-700/50">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700/40 border border-emerald-600/30 rounded-full text-xs font-semibold tracking-wide text-emerald-200">
                        <ShieldCheck size={14} /> SECURITY CLEARANCE: LEVEL 1 (ADMIN)
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        User Governance & Roles
                    </h2>
                    <p className="text-emerald-100/80 text-sm max-w-xl">
                        Monitor registered digital identities, audit department clearances, edit organizational access roles, and decommissioning accounts.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-3 bg-emerald-800/60 hover:bg-emerald-700/80 border border-emerald-700 text-emerald-100 rounded-2xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 text-sm font-semibold"
                        title="Reload administrative datasets"
                    >
                        <RefreshCw size={16} />
                        <span>Sync Accounts</span>
                    </button>
                </div>
            </div>

            {/* Quick Micro Statistics Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Total Directory Profiles</p>
                        <p className="text-2xl font-black text-gray-800">{users.length}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider font-sans">Registered Consumers</p>
                        <p className="text-2xl font-black text-gray-800">{roleStats.consumer}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                        <Key size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">XEN Engineers & Admins</p>
                        <p className="text-2xl font-black text-gray-800">{roleStats.admin + roleStats.xen}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Grid Operations Teams</p>
                        <p className="text-2xl font-black text-gray-800">{roleStats.employee}</p>
                    </div>
                </div>
            </div>

            {/* Filter and View Toggles Bar */}
            <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search system directories by name, email, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 w-full md:w-auto">
                        <SlidersHorizontal size={14} className="text-gray-400" />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="bg-transparent border-none text-xs font-semibold focus:outline-none text-gray-600 cursor-pointer w-full md:w-auto"
                        >
                            <option value="all">All Roles</option>
                            {ROLES.map(role => (
                                <option key={role} value={role} className="capitalize">{role}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Directory List */}
            {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center space-y-3 shadow-sm">
                    <Users size={48} className="mx-auto text-gray-300 opacity-60" />
                    <h4 className="font-bold text-gray-600 text-lg">No Profiles Found</h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">There are no customer or officer profiles that match your filters or search keywords.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredUsers.map((user) => {
                        const style = ROLE_DETAILS[user.role] || ROLE_DETAILS.consumer;
                        const isCurrentAdmin = adminId && user._id === adminId;
                        return (
                            <div
                                key={user._id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-800 font-extrabold text-sm shadow-sm flex-shrink-0">
                                                {user.image ? (
                                                    <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    user.name?.charAt(0)?.toUpperCase() || 'U'
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-gray-800 group-hover:text-emerald-950 transition-colors truncate">{user.name}</h3>
                                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                                                    <Mail size={11} className="flex-shrink-0" />
                                                    <span className="truncate">{user.email}</span>
                                                </p>
                                            </div>
                                        </div>
                                        {isCurrentAdmin && (
                                            <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                                Logged In
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-gray-50/60 pt-3">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize tracking-wide ${style.bg} ${style.text} ${style.border}`}>
                                            {style.icon}
                                            <span>{user.role}</span>
                                        </span>

                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                            <CalendarDays size={12} />
                                            <span>{new Date(user.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'short' })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3.5 border-t border-gray-50 flex justify-end gap-2">
                                    {isCurrentAdmin ? (
                                        <span className="text-[10px] text-gray-400 font-medium select-none italic pb-1">
                                            Clearance governance locked
                                        </span>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setSelectedUser(user); setEditRole(user.role); setShowEditModal(true); }}
                                                className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border border-gray-100 rounded-lg shadow-sm transition-colors flex items-center gap-1 font-bold"
                                            >
                                                <Edit size={12} />
                                                <span>Amend Role</span>
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }}
                                                className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-100 rounded-lg shadow-sm transition-colors flex items-center gap-1 font-bold"
                                            >
                                                <Trash2 size={12} />
                                                <span>Decommission</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Edit Clearance Modal */}
            <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedUser(null); }} title="Amend Security Clearance">
                {selectedUser && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200/50 flex items-center justify-center text-emerald-800 text-lg font-black shadow-sm flex-shrink-0">
                                {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="font-extrabold text-gray-800">{selectedUser.name}</p>
                                <p className="text-sm text-gray-400 mt-0.5">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-black tracking-wider text-gray-400 uppercase">Assigned Security Profile Clearance</label>
                            <select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                className="w-full border border-gray-100 bg-gray-50 focus:bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold text-gray-700 transition-all focus:outline-none"
                            >
                                {ROLES.map(role => (
                                    <option key={role} value={role} className="capitalize">{role}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
                            <button
                                onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                                className="px-5 py-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 text-sm font-bold text-gray-500 transition-all shadow-sm active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditRole}
                                disabled={actionLoading}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
                                <span>{actionLoading ? 'Saving clearance...' : 'Authorize Clearance'}</span>
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Decommission Profile Confirmation Modal */}
            <Modal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setSelectedUser(null); }} title="Decommission System Profile">
                {selectedUser && (
                    <div className="space-y-5">
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-800 text-xs">
                            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5 text-red-600" />
                            <div className="space-y-1">
                                <p className="font-extrabold text-red-900">Irreversible Directory Deletion</p>
                                <p className="leading-relaxed opacity-90">This will immediately revoke all sign-in keys and purge connection metadata. The user will be unable to access system endpoints.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-800 font-extrabold shadow-sm">
                                {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{selectedUser.name}</p>
                                <p className="text-xs text-gray-400">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
                            <button
                                onClick={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}
                                className="px-5 py-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 text-sm font-bold text-gray-500 transition-all shadow-sm active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                <span>{actionLoading ? 'Purging Profile...' : 'Purge Profile'}</span>
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
