'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, CheckCircle, XCircle, Clock, Eye, Search, RefreshCw,
    ChevronLeft, ChevronRight, X, Zap
} from 'lucide-react';

// ---------- Configuration ----------
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25];
const DEFAULT_ITEMS_PER_PAGE = 10;

// ---------- Status definitions (only relevant ones) ----------
const STATUS_OPTIONS = [
    { value: 'all', label: 'All Applications' },
    { value: 'pending_payment', label: 'Pending Payment' },
    { value: 'payment_done', label: 'Ready for Review' },
    { value: 'forwarded_to_wing', label: 'Forwarded to Wing' },
    { value: 'completed', label: 'Completed' },
    { value: 'implemented', label: 'Implemented' },
    { value: 'rejected', label: 'Rejected' },
];

const STATUS_MAP: Record<string, { color: string; label: string; icon: any }> = {
    pending_payment: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending Payment', icon: Clock },
    payment_done: { color: 'bg-blue-100 text-blue-700', label: 'Ready for Review', icon: Eye },
    forwarded_to_wing: { color: 'bg-purple-100 text-purple-700', label: 'Forwarded', icon: Eye },
    teamAssigned: { color: 'bg-indigo-100 text-indigo-700', label: 'Team Assigned', icon: Eye },
    completed: { color: 'bg-teal-100 text-teal-700', label: 'Completed', icon: CheckCircle },
    implemented: { color: 'bg-green-100 text-green-700', label: 'Implemented', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected', icon: XCircle },
};

export default function ConnectionApplications() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ---------- Actions ----------
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // ---------- Filtering & Sorting ----------
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
    const [sortBy, setSortBy] = useState<'createdAt' | 'applicantName'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchApps = useCallback(() => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/all`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setApplications(Array.isArray(data) ? data : []))
            .catch(() => setError('Failed to load applications'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchApps(); }, [fetchApps]);

    // ---------- Approve / Reject ----------
    const handleApprove = async (id: string) => {
        const token = getCookie('token');
        if (!token) return alert('Not authenticated');
        setActionLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/xen-review/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: 'approved' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Approve failed');
            fetchApps();
        } catch (err: any) { alert(err.message); }
        finally { setActionLoading(false); }
    };

    const handleReject = async () => {
        if (!selectedApp || !rejectReason.trim()) return alert('Please provide a reason');
        const token = getCookie('token');
        if (!token) return alert('Not authenticated');
        setActionLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/xen-review/${selectedApp._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: 'rejected', rejectReason }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Reject failed');
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedApp(null);
            fetchApps();
        } catch (err: any) { alert(err.message); }
        finally { setActionLoading(false); }
    };

    const getStatusBadge = (status: string) => STATUS_MAP[status] || STATUS_MAP.pending_payment;

    // ---------- Filtering ----------
    const filteredApps = useMemo(() => {
        let result = [...applications];
        if (statusFilter !== 'all') {
            result = result.filter(app => app.status === statusFilter);
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(app =>
                app.applicationId?.toLowerCase().includes(term) ||
                app.applicantName?.toLowerCase().includes(term) ||
                app.mobile?.includes(term) ||
                app.email?.toLowerCase().includes(term) ||
                app.address?.toLowerCase().includes(term)
            );
        }
        result.sort((a, b) => {
            let valA: any, valB: any;
            if (sortBy === 'createdAt') {
                valA = new Date(a.createdAt || 0).getTime();
                valB = new Date(b.createdAt || 0).getTime();
            } else {
                valA = (a.applicantName || '').toLowerCase();
                valB = (b.applicantName || '').toLowerCase();
            }
            if (sortOrder === 'asc') return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });
        return result;
    }, [applications, searchTerm, statusFilter, sortBy, sortOrder]);

    const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
    const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, itemsPerPage]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Zap size={24} className="text-emerald-600" />
                    Connection Applications
                </h2>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Total: {applications.length}</span>
                    <button onClick={fetchApps} className="p-2 border rounded-lg hover:bg-gray-50"><RefreshCw size={16} /></button>
                </div>
            </div>

            {/* Search & Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, name, mobile, email, address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm"
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                    >
                        <option value="createdAt">Date</option>
                        <option value="applicantName">Name</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                    >{sortOrder === 'asc' ? '↑' : '↓'}</button>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                    >
                        {ITEMS_PER_PAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">App ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedApps.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No applications found</td></tr>
                            ) : (
                                paginatedApps.map(app => {
                                    const badge = getStatusBadge(app.status);
                                    const StatusIcon = badge.icon;
                                    return (
                                        <tr key={app._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-mono">{app.applicationId}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium">{app.applicantName}</p>
                                                <p className="text-xs text-gray-400">{app.mobile}</p>
                                            </td>
                                            <td className="px-6 py-4 capitalize">{app.connectionType}</td>
                                            <td className="px-6 py-4">{app.loadRequired} kW</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                                    <StatusIcon size={12} />
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => { setSelectedApp(app); setShowDetailModal(true); }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                                                    ><Eye size={16} className="text-gray-500" /></button>
                                                    {app.status === 'payment_done' && (
                                                        <div className="flex gap-1">
                                                            <button onClick={() => handleApprove(app._id)} disabled={actionLoading} className="px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700">Approve</button>
                                                            <button onClick={() => { setSelectedApp(app); setShowRejectModal(true); }} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">Reject</button>
                                                        </div>
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
                    <div className="px-6 py-3 border-t flex items-center justify-between text-sm">
                        <span>Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredApps.length)} of {filteredApps.length}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50">«</button>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
                            <span className="px-3">{currentPage} / {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16} /></button>
                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50">»</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal (simplified) */}
            {showDetailModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Application Details</h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-gray-500">App ID:</span> {selectedApp.applicationId}</div>
                            <div><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedApp.status).color}`}>{getStatusBadge(selectedApp.status).label}</span></div>
                            <div><span className="text-gray-500">Applicant:</span> {selectedApp.applicantName}</div>
                            <div><span className="text-gray-500">Mobile:</span> {selectedApp.mobile}</div>
                            <div><span className="text-gray-500">Email:</span> {selectedApp.email || '-'}</div>
                            <div><span className="text-gray-500">Connection Type:</span> {selectedApp.connectionType}</div>
                            <div><span className="text-gray-500">Load:</span> {selectedApp.loadRequired} kW</div>
                            <div className="col-span-2"><span className="text-gray-500">Address:</span> {selectedApp.address}</div>
                            {selectedApp.xenRemarks && <div className="col-span-2"><span className="text-gray-500">Remarks:</span> {selectedApp.xenRemarks}</div>}
                            {selectedApp.rejectReason && <div className="col-span-2 text-red-600"><span className="text-red-500">Reject Reason:</span> {selectedApp.rejectReason}</div>}
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            {selectedApp.status === 'payment_done' && (
                                <>
                                    <button onClick={() => { handleApprove(selectedApp._id); setShowDetailModal(false); }} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Approve</button>
                                    <button onClick={() => { setShowDetailModal(false); setShowRejectModal(true); }} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Reject</button>
                                </>
                            )}
                            <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal (same as before) */}
            {showRejectModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-3">Reject Application</h3>
                        <p className="text-sm text-gray-600 mb-2">Application ID: {selectedApp.applicationId}</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                            placeholder="Enter reason for rejection..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm mb-4"
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setSelectedApp(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={handleReject} disabled={actionLoading || !rejectReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">{actionLoading ? 'Rejecting...' : 'Confirm Rejection'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}