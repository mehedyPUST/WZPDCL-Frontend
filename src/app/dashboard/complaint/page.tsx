'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    AlertTriangle, Clock, CheckCircle, Eye, Search,
    RefreshCw, Loader2, Send, X, ShieldAlert, Users, Calendar
} from 'lucide-react';
import { getCookie } from '@/lib/cookies';
import Modal from '@/components/ui/Modal';

interface Complaint {
    _id: string;
    userId: string;
    meterNumber: string;
    description: string;
    status: 'pending' | 'teamSent' | 'resolved';
    createdAt: string;
    teamInfo?: string;
    resolvedAt?: string;
}

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: any }> = {
    pending: { color: 'text-yellow-700 border-yellow-200 bg-yellow-50', bg: 'bg-yellow-100', label: 'Pending', icon: Clock },
    teamSent: { color: 'text-blue-700 border-blue-200 bg-blue-50', bg: 'bg-blue-100', label: 'Team Sent', icon: Loader2 },
    resolved: { color: 'text-green-700 border-green-200 bg-green-50', bg: 'bg-green-100', label: 'Resolved', icon: CheckCircle },
};

export default function ComplaintManagerDashboard({ initialFilter = 'all' }: { initialFilter?: string }) {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState(initialFilter);

    // Modals states
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState<'teamSent' | 'resolved' | null>(null);
    const [teamInfoText, setTeamInfoText] = useState('');
    const [submittingAction, setSubmittingAction] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const fetchComplaints = async () => {
        setLoading(true);
        setError(null);
        const token = getCookie('token');
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/complaints/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setComplaints(Array.isArray(data) ? data : []);
            } else {
                throw new Error(data.message || 'Failed to fetch complaints');
            }
        } catch (err: any) {
            setError(err.message || 'Error fetching complaints');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    // Align status updates with Express backend PUT /complaints/action/:id
    const updateComplaintStatus = async (id: string, action: 'sendTeam' | 'resolve', teamInfo: string) => {
        const token = getCookie('token');
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/complaints/action/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action, teamInfo })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Failed to update complaint status');
        }
        return data;
    };

    const handleActionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedComplaint || !actionType) return;

        setSubmittingAction(true);
        setActionError(null);

        try {
            const backendAction = actionType === 'teamSent' ? 'sendTeam' : 'resolve';
            await updateComplaintStatus(selectedComplaint._id, backendAction, teamInfoText);
            setShowActionModal(false);
            setTeamInfoText('');
            setSelectedComplaint(null);
            fetchComplaints(); // Refresh table
        } catch (err: any) {
            setActionError(err.message || 'Failed to update complaint status');
        } finally {
            setSubmittingAction(false);
        }
    };

    const openActionModal = (complaint: Complaint, type: 'teamSent' | 'resolved') => {
        setSelectedComplaint(complaint);
        setActionType(type);
        setTeamInfoText(complaint.teamInfo || '');
        setActionError(null);
        setShowActionModal(true);
    };

    // Derived statistics
    const stats = useMemo(() => {
        return {
            total: complaints.length,
            pending: complaints.filter(c => c.status === 'pending').length,
            teamSent: complaints.filter(c => c.status === 'teamSent').length,
            resolved: complaints.filter(c => c.status === 'resolved').length,
        };
    }, [complaints]);

    // Search and filter logic
    const filteredComplaints = useMemo(() => {
        return complaints.filter(c => {
            const matchesSearch = c.meterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.teamInfo && c.teamInfo.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [complaints, searchTerm, filterStatus]);

    if (loading && complaints.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <ShieldAlert size={24} className="text-emerald-700" />
                        <span>Complaint Management Dashboard</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Monitor, assign field teams, and resolve consumer issues.</p>
                </div>
                <div>
                    <button
                        onClick={fetchComplaints}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw size={16} /> Refresh Data
                    </button>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="font-semibold text-sm">Error Loading Complaints</p>
                        <p className="text-xs">{error}</p>
                    </div>
                </div>
            )}

            {/* Statistics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Complaints</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</h3>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                        <AlertTriangle size={20} />
                    </div>
                </div>

                {/* Pending */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Pending Review</p>
                        <h3 className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</h3>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                        <Clock size={20} />
                    </div>
                </div>

                {/* Team Sent */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">In Field (Team Sent)</p>
                        <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.teamSent}</h3>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                        <Users size={20} />
                    </div>
                </div>

                {/* Resolved */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Resolved</p>
                        <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.resolved}</h3>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 text-green-600">
                        <CheckCircle size={20} />
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by meter number, description, or team info..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="teamSent">Team Sent</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        <button
                            onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-600"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Meter Number</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Team</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredComplaints.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                        No complaints match the filters or search query.
                                    </td>
                                </tr>
                            ) : (
                                filteredComplaints.map((complaint) => {
                                    const badge = statusConfig[complaint.status] || statusConfig.pending;
                                    const StatusIcon = badge.icon;
                                    return (
                                        <tr key={complaint._id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">
                                                {complaint.meterNumber}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={complaint.description}>
                                                {complaint.description}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {complaint.teamInfo ? (
                                                    <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-100">
                                                        {complaint.teamInfo}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                                                    <StatusIcon size={12} className={complaint.status === 'teamSent' ? 'animate-spin' : ''} />
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => { setSelectedComplaint(complaint); setShowDetailModal(true); }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-emerald-700 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {complaint.status === 'pending' && (
                                                        <button
                                                            onClick={() => openActionModal(complaint, 'teamSent')}
                                                            className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                        >
                                                            Send Team
                                                        </button>
                                                    )}

                                                    {complaint.status !== 'resolved' && (
                                                        <button
                                                            onClick={() => openActionModal(complaint, 'resolved')}
                                                            className="px-2.5 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                                        >
                                                            Resolve
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

            {/* Complaint Detail Modal */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Complaint Case Details">
                {selectedComplaint && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm border-b border-gray-100 pb-4">
                            <div>
                                <p className="text-gray-400 font-medium">Meter Number</p>
                                <p className="font-semibold text-gray-800 mt-0.5">{selectedComplaint.meterNumber}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 font-medium">Date Registered</p>
                                <p className="font-semibold text-gray-800 mt-0.5">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 font-medium">Current Status</p>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold border ${statusConfig[selectedComplaint.status]?.color}`}>
                                    {statusConfig[selectedComplaint.status]?.label}
                                </span>
                            </div>
                            {selectedComplaint.resolvedAt && (
                                <div>
                                    <p className="text-gray-400 font-medium">Date Resolved</p>
                                    <p className="font-semibold text-green-700 mt-0.5">{new Date(selectedComplaint.resolvedAt).toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-sm text-gray-400 font-medium mb-1">Issue Description</p>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-100 min-h-[80px]">
                                {selectedComplaint.description}
                            </div>
                        </div>

                        {selectedComplaint.teamInfo && (
                            <div>
                                <p className="text-sm text-emerald-800 font-medium mb-1">Field Investigation Team Info</p>
                                <div className="bg-emerald-50/50 rounded-lg p-3 text-sm text-emerald-900 border border-emerald-100">
                                    {selectedComplaint.teamInfo}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            {selectedComplaint.status === 'pending' && (
                                <button
                                    onClick={() => { setShowDetailModal(false); openActionModal(selectedComplaint, 'teamSent'); }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                >
                                    Assign Field Team
                                </button>
                            )}
                            {selectedComplaint.status !== 'resolved' && (
                                <button
                                    onClick={() => { setShowDetailModal(false); openActionModal(selectedComplaint, 'resolved'); }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                >
                                    Resolve Case
                                </button>
                            )}
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Action Trigger Modal (Assign Team / Resolve) */}
            <Modal
                isOpen={showActionModal}
                onClose={() => setShowActionModal(false)}
                title={actionType === 'teamSent' ? 'Dispatch Investigation Team' : 'Resolve Complaint Case'}
            >
                <form onSubmit={handleActionSubmit} className="space-y-4">
                    {actionError && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <span>{actionError}</span>
                        </div>
                    )}

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-150 text-xs space-y-1.5">
                        <p className="font-semibold text-gray-700">Case Reference:</p>
                        <p><span className="text-gray-400">Meter Number:</span> {selectedComplaint?.meterNumber}</p>
                        <p><span className="text-gray-400">Description:</span> {selectedComplaint?.description}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {actionType === 'teamSent' ? 'Team Details & Notes' : 'Resolution Details & Remarks'} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={teamInfoText}
                            onChange={(e) => setTeamInfoText(e.target.value)}
                            rows={3}
                            placeholder={actionType === 'teamSent'
                                ? "Enter team code, coordinator name, mobile, and departure logs (e.g. 'Team Alpha, Coordinated by Engr. Rafiq, mob: 01712...')"
                                : "Describe how the issue was fixed (e.g. 'Faulty meter replaced. Seal verified.')"
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowActionModal(false)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submittingAction}
                            className={`px-4 py-2 text-white rounded-lg text-sm disabled:opacity-50 flex items-center gap-1.5 ${actionType === 'teamSent' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {submittingAction ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {submittingAction
                                ? 'Saving...'
                                : actionType === 'teamSent' ? 'Dispatch Team' : 'Resolve Case'
                            }
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
