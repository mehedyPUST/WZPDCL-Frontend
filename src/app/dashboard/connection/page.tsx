// src/app/dashboard/connection/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Zap, PlusCircle, CheckCircle, Clock,
    RefreshCw, Users, FileText, Wrench, Eye, X
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
        const completed = connections.filter(c => c.status === 'completed' || c.status === 'implemented').length;
        const assigned = connections.filter(c => c.meterAssigned).length;
        return { total, pending, completed, assigned };
    }, [connections]);

    const pendingConnections = useMemo(() => {
        return connections.filter(c => c.status === 'forwarded_to_wing' || c.status === 'teamAssigned');
    }, [connections]);

    const completedConnections = useMemo(() => {
        return connections.filter(c => c.status === 'completed' || c.status === 'implemented').slice(0, 5);
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
            setMessage({ type: 'success', text: 'Team sent successfully!' });
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
            setMessage({ type: 'success', text: 'Meter assigned and connection completed!' });
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
        const map: Record<string, { color: string; label: string }> = {
            forwarded_to_wing: { color: 'bg-blue-100 text-blue-700', label: 'Pending' },
            teamAssigned: { color: 'bg-indigo-100 text-indigo-700', label: 'Team Working' },
            completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
            implemented: { color: 'bg-teal-100 text-teal-700', label: 'Implemented' },
        };
        return map[status] || { color: 'bg-gray-100 text-gray-700', label: status };
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
                    <p className="text-gray-500 mt-1 ml-14">Manage approved connection applications</p>
                </div>
                <button onClick={fetchConnections} className="p-2.5 rounded-xl border border-gray-200 hover:bg-emerald-50 transition-colors">
                    <RefreshCw size={18} className="text-gray-600" />
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} className="text-green-600" /> : <Clock size={20} className="text-red-600" />}
                    <p className="text-sm text-gray-700">{message.text}</p>
                    <button onClick={() => setMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<FileText size={24} />} label="Total Applications" value={stats.total} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<Clock size={24} />} label="Pending Action" value={stats.pending} color="bg-yellow-100 text-yellow-600" />
                <StatCard icon={<CheckCircle size={24} />} label="Completed" value={stats.completed} color="bg-green-100 text-green-600" />
                <StatCard icon={<Zap size={24} />} label="Meters Assigned" value={stats.assigned} color="bg-purple-100 text-purple-600" />
            </div>

            {/* Pending Applications */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Clock size={20} className="text-yellow-600" /> Pending Applications</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">App ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Applicant</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Load</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {pendingConnections.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No pending applications</td></tr>
                            ) : (
                                pendingConnections.map(conn => {
                                    const badge = getStatusBadge(conn.status);
                                    return (
                                        <tr key={conn._id} className="hover:bg-emerald-50/50">
                                            <td className="px-6 py-4 font-mono">{conn.applicationId}</td>
                                            <td className="px-6 py-4"><p className="font-medium">{conn.applicantName}</p><p className="text-xs text-gray-400">{conn.mobile}</p></td>
                                            <td className="px-6 py-4 capitalize">{conn.connectionType}</td>
                                            <td className="px-6 py-4">{conn.loadRequired} kW</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span></td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => openDetail(conn)} className="p-1.5 hover:bg-gray-100 rounded" title="View"><Eye size={16} /></button>
                                                    {conn.status === 'forwarded_to_wing' && (
                                                        <button onClick={() => handleSendTeam(conn._id)} disabled={actionLoading} className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
                                                            Send Team
                                                        </button>
                                                    )}
                                                    {conn.status === 'teamAssigned' && (
                                                        <button onClick={() => openAddMeter(conn)} className="px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700">
                                                            Complete & Assign Meter
                                                        </button>
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

            {/* Completed Applications */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2"><CheckCircle size={20} className="text-green-600" /> Recently Completed</h3>
                </div>
                {completedConnections.length === 0 ? (
                    <div className="px-6 py-10 text-center text-gray-400">No completed applications yet</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                        {completedConnections.map(conn => (
                            <div key={conn._id} className="border rounded-lg p-4 bg-emerald-50/30">
                                <p className="font-semibold text-sm">{conn.applicantName}</p>
                                <p className="text-xs text-gray-500">{conn.applicationId} | {conn.connectionType}</p>
                                {conn.meterAssigned && <p className="text-xs text-emerald-700 mt-1">Meter: {conn.meterAssigned}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedConn && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Application Details</h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">App ID</span><span className="font-mono">{selectedConn.applicationId}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Applicant</span><span>{selectedConn.applicantName}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Mobile</span><span>{selectedConn.mobile}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="capitalize">{selectedConn.connectionType}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Load</span><span>{selectedConn.loadRequired} kW</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedConn.status).color}`}>{getStatusBadge(selectedConn.status).label}</span></div>
                            {selectedConn.meterAssigned && <div className="flex justify-between"><span className="text-gray-500">Meter</span><span className="font-mono text-emerald-700">{selectedConn.meterAssigned}</span></div>}
                            {selectedConn.address && <div className="flex justify-between"><span className="text-gray-500">Address</span><span>{selectedConn.address}</span></div>}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Meter Modal */}
            {showAddMeterModal && selectedConn && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold mb-4">Complete Application & Assign Meter</h3>
                        <p className="text-sm text-gray-600 mb-2">Application: {selectedConn.applicationId}</p>
                        <label className="block text-sm font-medium mb-1">Meter Number</label>
                        <input type="text" value={meterNumber} onChange={e => setMeterNumber(e.target.value)} className="w-full border rounded-lg px-3 py-2.5 mb-4" placeholder="Enter meter number" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowAddMeterModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={() => handleComplete(selectedConn._id)} disabled={actionLoading || !meterNumber} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Complete & Assign Meter'}
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