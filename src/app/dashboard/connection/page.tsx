// src/app/dashboard/connection/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCookie } from '@/lib/cookies';
import Link from 'next/link';
import {
    Loader2, Zap, PlusCircle, CheckCircle, Clock,
    RefreshCw, Users, FileText, Wrench, Eye, X,
    Package, AlertCircle, TrendingUp, ArrowRight
} from 'lucide-react';

interface Connection {
    _id: string;
    applicationId: string;
    applicantName: string;
    mobile: string;
    connectionType: string;
    loadRequired: number;
    status: string;
    meterAssigned?: string;
    address?: string;
    createdAt: string;
}

export default function ConnectionWingDashboard() {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddMeterModal, setShowAddMeterModal] = useState(false);
    const [selectedConn, setSelectedConn] = useState<Connection | null>(null);
    const [meterNumber, setMeterNumber] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const fetchConnections = async () => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setConnections(Array.isArray(data) ? data : []);
        } catch {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchConnections(); }, []);

    const stats = useMemo(() => {
        const total = connections.length;
        const pending = connections.filter(c => c.status === 'forwarded_to_wing').length;
        const inProgress = connections.filter(c => c.status === 'teamAssigned').length;
        const completed = connections.filter(c => c.status === 'completed' || c.status === 'implemented').length;
        const metersAssigned = connections.filter(c => c.meterAssigned).length;
        return { total, pending, inProgress, completed, metersAssigned };
    }, [connections]);

    const pendingConnections = useMemo(() => {
        return connections.filter(c => c.status === 'forwarded_to_wing' || c.status === 'teamAssigned').slice(0, 5);
    }, [connections]);

    const recentCompleted = useMemo(() => {
        return connections
            .filter(c => c.status === 'completed' || c.status === 'implemented')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4);
    }, [connections]);

    const handleSendTeam = async (id: string) => {
        const token = getCookie('token');
        if (!token) return;
        setActionLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/connection-action/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ action: 'sendTeam' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed');
            fetchConnections();
            setMessage({ type: 'success', text: 'Team dispatched successfully!' });
            setTimeout(() => setMessage(null), 2000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setActionLoading(false);
        }
    };

    const handleComplete = async (id: string) => {
        if (!meterNumber) return alert('Please enter meter number');
        const token = getCookie('token');
        if (!token) return;
        setActionLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/connection-action/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ action: 'complete', meterNumber }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed');
            setShowAddMeterModal(false);
            setMeterNumber('');
            setSelectedConn(null);
            fetchConnections();
            setMessage({ type: 'success', text: 'Connection completed & meter assigned!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setActionLoading(false);
        }
    };

    const openAddMeter = (conn: Connection) => {
        setSelectedConn(conn);
        setMeterNumber('');
        setShowAddMeterModal(true);
    };

    const openDetail = (conn: Connection) => {
        setSelectedConn(conn);
        setShowDetailModal(true);
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { color: string; label: string; icon: any }> = {
            forwarded_to_wing: { color: 'bg-blue-100 text-blue-700', label: 'Pending', icon: Clock },
            teamAssigned: { color: 'bg-indigo-100 text-indigo-700', label: 'In Progress', icon: Wrench },
            completed: { color: 'bg-green-100 text-green-700', label: 'Completed', icon: CheckCircle },
            implemented: { color: 'bg-emerald-100 text-emerald-700', label: 'Implemented', icon: Zap },
        };
        return map[status] || { color: 'bg-gray-100 text-gray-700', label: status, icon: Clock };
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;
    if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <Wrench size={28} className="text-emerald-600" />
                        </div>
                        Connection Wing Dashboard
                    </h2>
                    <p className="text-gray-500 mt-1 ml-14">Manage approved connection applications & installations</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/connection/meters" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                        <Package size={16} />
                        Manage Meters
                    </Link>
                    <button onClick={fetchConnections} className="p-2.5 rounded-xl border border-gray-200 hover:bg-emerald-50 transition-colors">
                        <RefreshCw size={18} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} className="text-green-600" /> : <AlertCircle size={20} className="text-red-600" />}
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{message.text}</p>
                    <button onClick={() => setMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard icon={<FileText size={24} />} label="Total" value={stats.total} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<Clock size={24} />} label="Pending" value={stats.pending} color="bg-yellow-100 text-yellow-600" />
                <StatCard icon={<Wrench size={24} />} label="In Progress" value={stats.inProgress} color="bg-indigo-100 text-indigo-600" />
                <StatCard icon={<CheckCircle size={24} />} label="Completed" value={stats.completed} color="bg-green-100 text-green-600" />
                <StatCard icon={<Zap size={24} />} label="Meters Assigned" value={stats.metersAssigned} color="bg-purple-100 text-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Applications */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gradient-to-r from-yellow-50 to-white flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Clock size={20} className="text-yellow-600" />
                            Pending Applications
                        </h3>
                        <Link href="/dashboard/connection/applications" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    {pendingConnections.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-400">
                            <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
                            <p>No pending applications</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {pendingConnections.map(conn => {
                                const badge = getStatusBadge(conn.status);
                                const StatusIcon = badge.icon;
                                return (
                                    <div key={conn._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                                                        <Users size={16} className="text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{conn.applicantName}</p>
                                                        <p className="text-xs text-gray-400">{conn.applicationId} · {conn.connectionType} · {conn.loadRequired} kW</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                                    <StatusIcon size={12} />
                                                    {badge.label}
                                                </span>
                                                {conn.status === 'forwarded_to_wing' && (
                                                    <button onClick={() => handleSendTeam(conn._id)} disabled={actionLoading} className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors">
                                                        Send Team
                                                    </button>
                                                )}
                                                {conn.status === 'teamAssigned' && (
                                                    <button onClick={() => openAddMeter(conn)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors">
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Stats & Links */}
                <div className="space-y-4">
                    {/* Today's Summary */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-emerald-600" />
                            Quick Summary
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Today's Assigned</span>
                                <span className="font-medium">0</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">This Week</span>
                                <span className="font-medium">{stats.completed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Meters Available</span>
                                <span className="font-medium text-emerald-600">--</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link href="/dashboard/connection/applications" className="block w-full px-4 py-2.5 border rounded-lg text-sm hover:bg-emerald-50 text-gray-700 flex items-center gap-2">
                                <FileText size={16} className="text-emerald-600" /> View All Applications
                            </Link>
                            <Link href="/dashboard/connection/meters" className="block w-full px-4 py-2.5 border rounded-lg text-sm hover:bg-emerald-50 text-gray-700 flex items-center gap-2">
                                <Package size={16} className="text-indigo-600" /> Manage Meters
                            </Link>
                        </div>
                    </div>

                    {/* Recently Completed */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Recently Completed</h3>
                        {recentCompleted.length === 0 ? (
                            <p className="text-sm text-gray-400">No completed connections yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentCompleted.map(conn => (
                                    <div key={conn._id} className="flex items-center gap-3">
                                        <CheckCircle size={16} className="text-green-500" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{conn.applicantName}</p>
                                            <p className="text-xs text-gray-400">{conn.connectionType}</p>
                                        </div>
                                        {conn.meterAssigned && (
                                            <span className="text-xs font-mono text-emerald-600">{conn.meterAssigned}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedConn && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Application Details</h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">App ID</span><span className="font-mono">{selectedConn.applicationId}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Applicant</span><span className="font-medium">{selectedConn.applicantName}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Mobile</span><span>{selectedConn.mobile}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Connection Type</span><span className="capitalize">{selectedConn.connectionType}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Load</span><span>{selectedConn.loadRequired} kW</span></div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedConn.status).color}`}>
                                    {getStatusBadge(selectedConn.status).label}
                                </span>
                            </div>
                            {selectedConn.address && <div className="flex justify-between"><span className="text-gray-500">Address</span><span>{selectedConn.address}</span></div>}
                            {selectedConn.meterAssigned && <div className="flex justify-between"><span className="text-gray-500">Meter</span><span className="font-mono text-emerald-700 font-medium">{selectedConn.meterAssigned}</span></div>}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Meter Modal */}
            {showAddMeterModal && selectedConn && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Complete & Assign Meter</h3>
                            <button onClick={() => setShowAddMeterModal(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Application: <span className="font-mono font-medium">{selectedConn.applicationId}</span></p>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meter Number</label>
                        <input
                            type="text"
                            value={meterNumber}
                            onChange={(e) => setMeterNumber(e.target.value)}
                            placeholder="Enter meter number"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-6"
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowAddMeterModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button
                                onClick={() => handleComplete(selectedConn._id)}
                                disabled={actionLoading || !meterNumber.trim()}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                {actionLoading ? 'Processing...' : 'Complete & Assign Meter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}