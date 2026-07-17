// src/app/dashboard/consumer/my-complaints/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertCircle, Plus, Search, Clock, CheckCircle,
    Eye, ChevronLeft, ChevronRight, RefreshCw,
    FileText, Loader2, X, Send, Zap, Package, Star
} from 'lucide-react';
import { getCookie } from '@/lib/cookies';
import Modal from '@/components/ui/Modal';
import ClaimMeterModal from '@/components/ClaimMeterModal';
import { apiFetch } from '@/lib/api-client';

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

interface Meter {
    meterNumber: string;
    claimedBy: string;
}

const ITEMS_PER_PAGE = 5;

const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: Clock },
    teamSent: { color: 'bg-blue-100 text-blue-700', label: 'Team Sent', icon: Loader2 },
    resolved: { color: 'bg-green-100 text-green-700', label: 'Resolved', icon: CheckCircle },
};

export default function ConsumerMyComplaintsPage() {
    const router = useRouter();

    // ---------- data states ----------
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [claimedMeters, setClaimedMeters] = useState<Meter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ---------- UI states ----------
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

    // ---------- review states ----------
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [ratedComplaints, setRatedComplaints] = useState<Record<string, boolean>>({});

    // ---------- new complaint form ----------
    const [newMeterNumber, setNewMeterNumber] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // ---------- fetch data ----------
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // fetch claimed meters
            const meterData = await apiFetch<Meter[]>('/meters/my');
            const metersList: Meter[] = Array.isArray(meterData) ? meterData : [];
            setClaimedMeters(metersList);

            // if no meters → stop
            if (metersList.length === 0) {
                setComplaints([]);
                return;
            }

            // fetch complaints for the logged‑in user
            const compData = await apiFetch<Complaint[]>('/complaints/my');
            setComplaints(Array.isArray(compData) ? compData : []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        const loaded: Record<string, boolean> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('wzpdcl_rated_')) {
                const id = key.replace('wzpdcl_rated_', '');
                loaded[id] = true;
            }
        }
        setRatedComplaints(loaded);
    }, []);

    // pre‑select first claimed meter when opening new complaint modal
    useEffect(() => {
        if (claimedMeters.length > 0 && !newMeterNumber) {
            setNewMeterNumber(claimedMeters[0].meterNumber);
        }
    }, [claimedMeters, newMeterNumber]);

    // ---------- filtering & pagination ----------
    const filteredComplaints = useMemo(() => {
        return complaints.filter(c => {
            const matchesSearch = c.meterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [complaints, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
    const paginatedComplaints = filteredComplaints.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // ---------- stats ----------
    const stats = [
        { label: 'Total', value: complaints.length, icon: FileText, color: 'bg-blue-100 text-blue-600' },
        { label: 'Pending', value: complaints.filter(c => c.status === 'pending').length, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
        { label: 'In Progress', value: complaints.filter(c => c.status === 'teamSent').length, icon: Loader2, color: 'bg-purple-100 text-purple-600' },
        { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    ];

    // ---------- submit complaint ----------
    const handleSubmitComplaint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMeterNumber || !newDescription) {
            setFormError('Please select a meter and describe the issue.');
            return;
        }
        setIsSubmitting(true);
        setFormError(null);

        try {
            await apiFetch('/complaints/register', {
                method: 'POST',
                body: JSON.stringify({ meterNumber: newMeterNumber, description: newDescription }),
            });

            setNewDescription('');
            setShowNewModal(false);
            fetchData(); // refresh list
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent, complaintId: string) => {
        e.preventDefault();
        setSubmittingReview(true);
        setReviewError(null);
        try {
            await apiFetch('/reviews/submit', {
                method: 'POST',
                body: JSON.stringify({
                    complaintId,
                    rating,
                    text: reviewText
                })
            });

            localStorage.setItem(`wzpdcl_rated_${complaintId}`, 'true');
            setRatedComplaints(prev => ({ ...prev, [complaintId]: true }));
            setReviewText('');
            setRating(5);
        } catch (err: any) {
            setReviewError(err.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    // ---------- render ----------
    // loading
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    // no claimed meter → claim prompt
    if (claimedMeters.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto border border-emerald-100">
                    <Zap size={48} className="mx-auto text-emerald-600 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Meter Claimed</h2>
                    <p className="text-gray-500 mb-6">You need a claimed meter to register a complaint.</p>
                    <button
                        onClick={() => setShowClaimModal(true)}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                        Claim a Meter
                    </button>
                </div>
                <ClaimMeterModal
                    isOpen={showClaimModal}
                    onClose={() => setShowClaimModal(false)}
                    onSuccess={() => { setShowClaimModal(false); fetchData(); }}
                />
            </div>
        );
    }

    // error state
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle size={40} className="text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <button onClick={fetchData} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg">Try Again</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <AlertCircle size={24} className="text-emerald-600" />
                        <span>My Complaints</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {claimedMeters.length} meter{claimedMeters.length > 1 ? 's' : ''} available
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={fetchData} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                    >
                        <Plus size={16} /> New Complaint
                    </button>
                </div>
            </div>

            {/* stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* search & filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by meter or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="teamSent">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        <button
                            onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        >
                            <RefreshCw size={16} /> Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedComplaints.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No complaints found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedComplaints.map((complaint) => {
                                    const badge = statusConfig[complaint.status] || statusConfig.pending;
                                    const StatusIcon = badge.icon;
                                    return (
                                        <tr key={complaint._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">{complaint.meterNumber}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{complaint.description}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                                    <StatusIcon size={12} />
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(complaint.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedComplaint(complaint);
                                                        setRating(5);
                                                        setReviewText('');
                                                        setReviewError(null);
                                                        setShowDetailModal(true);
                                                    }}
                                                    className="p-1.5 hover:bg-gray-100 rounded-lg"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} className="text-gray-500" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded-lg text-sm ${currentPage === page ? 'bg-emerald-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                                    {page}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* new complaint modal */}
            <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Register Complaint">
                <form onSubmit={handleSubmitComplaint} className="space-y-4">
                    {formError && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                            <AlertCircle size={16} /> {formError}
                        </div>
                    )}

                    {/* meter selection – only claimed meters */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meter Number <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={newMeterNumber}
                                onChange={(e) => setNewMeterNumber(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                required
                            >
                                <option value="">Select a meter</option>
                                {claimedMeters.map(m => (
                                    <option key={m.meterNumber} value={m.meterNumber}>{m.meterNumber}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                        <textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            rows={4}
                            placeholder="Describe the issue in detail..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* detail modal */}
            {showDetailModal && selectedComplaint && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Complaint Details</h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div><span className="text-gray-500">Meter:</span> <span className="font-medium">{selectedComplaint.meterNumber}</span></div>
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedComplaint.status]?.color}`}>
                                    {statusConfig[selectedComplaint.status]?.label}
                                </span>
                            </div>
                            <div><span className="text-gray-500">Date:</span> {new Date(selectedComplaint.createdAt).toLocaleString()}</div>
                            {selectedComplaint.teamInfo && <div><span className="text-gray-500">Team Info:</span> {selectedComplaint.teamInfo}</div>}
                            {selectedComplaint.resolvedAt && <div><span className="text-gray-500">Resolved At:</span> {new Date(selectedComplaint.resolvedAt).toLocaleString()}</div>}
                            <div>
                                <p className="text-gray-500 mb-1">Description:</p>
                                <p className="text-gray-800">{selectedComplaint.description}</p>
                            </div>
                            {selectedComplaint.status === 'resolved' && (
                                <div className="mt-6 border-t pt-4">
                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                                        <Star size={18} className="text-amber-500 fill-amber-500 animate-pulse" />
                                        <span>Rate our Service</span>
                                    </h4>
                                    {ratedComplaints[selectedComplaint._id] ? (
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-2">
                                            <CheckCircle size={16} className="text-emerald-600" />
                                            <span>You have successfully submitted your review for this resolved complaint. Thank you!</span>
                                        </div>
                                    ) : (
                                        <form onSubmit={(e) => handleReviewSubmit(e, selectedComplaint._id)} className="space-y-3">
                                            {reviewError && (
                                                <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-xs border border-red-200">
                                                    {reviewError}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRating(star)}
                                                        className="p-1 hover:scale-110 transition-transform"
                                                    >
                                                        <Star
                                                            size={24}
                                                            className={star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                                                        />
                                                    </button>
                                                ))}
                                                <span className="text-sm text-gray-500 ml-2">({rating} / 5 stars)</span>
                                            </div>
                                            <div>
                                                <textarea
                                                    value={reviewText}
                                                    onChange={(e) => setReviewText(e.target.value)}
                                                    placeholder="Write your feedback here (optional)..."
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-gray-50 focus:bg-white transition-colors"
                                                    rows={3}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={submittingReview}
                                                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {submittingReview ? <Loader2 size={16} className="animate-spin" /> : null}
                                                Submit Review
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* claim meter modal (reused) */}
            <ClaimMeterModal
                isOpen={showClaimModal}
                onClose={() => setShowClaimModal(false)}
                onSuccess={() => { setShowClaimModal(false); fetchData(); }}
            />
        </div>
    );
}