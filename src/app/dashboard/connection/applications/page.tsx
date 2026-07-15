'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Search, RefreshCw, ChevronLeft, ChevronRight,
    Eye, X, CheckCircle, Clock, Wrench, Zap, Filter
} from 'lucide-react';

// ... বাকি কোড অপরিবর্তিত, শুধু ওপরে React ইম্পোর্ট আছে

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

const ITEMS_PER_PAGE = 10;

export default function ConnectionApplicationsPage() {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedConn, setSelectedConn] = useState<Connection | null>(null);
    const [showAddMeterModal, setShowAddMeterModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [meterNumber, setMeterNumber] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

    const filteredConnections = useMemo(() => {
        let result = connections;
        if (filterStatus !== 'all') {
            result = result.filter(c => c.status === filterStatus);
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.applicationId?.toLowerCase().includes(term) ||
                c.applicantName?.toLowerCase().includes(term) ||
                c.mobile?.includes(term) ||
                c.meterAssigned?.toLowerCase().includes(term)
            );
        }
        return result;
    }, [connections, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredConnections.length / ITEMS_PER_PAGE);
    const paginatedConnections = filteredConnections.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = useMemo(() => {
        const total = connections.length;
        const pending = connections.filter(c => c.status === 'forwarded_to_wing').length;
        const working = connections.filter(c => c.status === 'teamAssigned').length;
        const completed = connections.filter(c => c.status === 'completed' || c.status === 'implemented').length;
        return { total, pending, working, completed };
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
        setMeterNumber(conn.meterAssigned || '');
        setShowAddMeterModal(true);
    };

    const openDetail = (conn: Connection) => {
        setSelectedConn(conn);
        setShowDetailModal(true);
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { color: string; label: string; icon: any }> = {
            forwarded_to_wing: { color: 'bg-blue-100 text-blue-700', label: 'Pending', icon: Clock },
            teamAssigned: { color: 'bg-indigo-100 text-indigo-700', label: 'Team Working', icon: Wrench },
            completed: { color: 'bg-green-100 text-green-700', label: 'Completed', icon: CheckCircle },
            implemented: { color: 'bg-teal-100 text-teal-700', label: 'Implemented', icon: Zap },
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
                        Connection Applications
                    </h2>
                    <p className="text-gray-500 mt-1 ml-14">Manage and implement approved connection requests</p>
                </div>
                <button onClick={fetchConnections} className="p-2.5 rounded-xl border border-gray-200 hover:bg-emerald-50 transition-colors">
                    <RefreshCw size={18} className="text-gray-600" />
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} className="text-green-600" /> : <X size={20} className="text-red-600" />}
                    <p className="text-sm text-gray-700">{message.text}</p>
                    <button onClick={() => setMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Zap size={24} />} label="Total" value={stats.total} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<Clock size={24} />} label="Pending" value={stats.pending} color="bg-yellow-100 text-yellow-600" />
                <StatCard icon={<Wrench size={24} />} label="In Progress" value={stats.working} color="bg-indigo-100 text-indigo-600" />
                <StatCard icon={<CheckCircle size={24} />} label="Completed" value={stats.completed} color="bg-green-100 text-green-600" />
            </div>

            {/* Filter & Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by app ID, name, mobile, meter number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                        />
                    </div>
                    <div className="relative">
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">All Status</option>
                            <option value="forwarded_to_wing">Pending</option>
                            <option value="teamAssigned">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="implemented">Implemented</option>
                        </select>
                    </div>
                    <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                        <RefreshCw size={16} /> Reset
                    </button>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">App ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Load</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedConnections.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Wrench size={32} className="opacity-30" />
                                            <p>No applications found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedConnections.map((conn, idx) => {
                                    const badge = getStatusBadge(conn.status);
                                    const StatusIcon = badge.icon;
                                    return (
                                        <tr key={conn._id} className={`hover:bg-emerald-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                            <td className="px-6 py-4 font-mono text-gray-700">{conn.applicationId}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-800">{conn.applicantName}</p>
                                                <p className="text-xs text-gray-400">{conn.mobile}</p>
                                            </td>
                                            <td className="px-6 py-4 capitalize text-gray-600">{conn.connectionType}</td>
                                            <td className="px-6 py-4 font-medium text-gray-700">{conn.loadRequired} kW</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                                                    <StatusIcon size={14} />
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => openDetail(conn)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors" title="View Details">
                                                        <Eye size={18} />
                                                    </button>
                                                    {conn.status === 'forwarded_to_wing' && (
                                                        <button onClick={() => handleSendTeam(conn._id)} disabled={actionLoading} className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors">
                                                            Send Team
                                                        </button>
                                                    )}
                                                    {conn.status === 'teamAssigned' && (
                                                        <button onClick={() => openAddMeter(conn)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors">
                                                            Complete & Assign Meter
                                                        </button>
                                                    )}
                                                    {(conn.status === 'completed' || conn.status === 'implemented') && conn.meterAssigned && (
                                                        <span className="text-xs text-green-600 font-medium">Meter: {conn.meterAssigned}</span>
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

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages} ({filteredConnections.length} applications)
                        </span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={18} /></button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>{page}</button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}
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
                            <div className="flex justify-between"><span className="text-gray-500">App ID</span><span className="font-mono font-medium">{selectedConn.applicationId}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Applicant</span><span className="font-medium">{selectedConn.applicantName}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Mobile</span><span>{selectedConn.mobile}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Connection Type</span><span className="capitalize">{selectedConn.connectionType}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Load Required</span><span>{selectedConn.loadRequired} kW</span></div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedConn.status).color}`}>
                                    {React.createElement(getStatusBadge(selectedConn.status).icon, { size: 12 })}
                                    {getStatusBadge(selectedConn.status).label}
                                </span>
                            </div>
                            {selectedConn.meterAssigned && <div className="flex justify-between"><span className="text-gray-500">Meter</span><span className="font-mono text-emerald-700 font-medium">{selectedConn.meterAssigned}</span></div>}
                            {selectedConn.address && <div className="flex justify-between"><span className="text-gray-500">Address</span><span>{selectedConn.address}</span></div>}
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
                            <button onClick={() => { setShowAddMeterModal(false); setMeterNumber(''); }} className="p-2 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
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
                            <button onClick={() => { setShowAddMeterModal(false); setMeterNumber(''); }} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
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