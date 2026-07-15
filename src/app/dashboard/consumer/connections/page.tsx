// src/app/dashboard/consumer/connections/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Zap, Search, Eye, ChevronLeft, ChevronRight, RefreshCw,
    FileText, Loader2, CheckCircle, Clock, XCircle, AlertCircle,
    CreditCard, ArrowRight, X, Plus
} from 'lucide-react';
import { getCookie } from '@/lib/cookies';
import Modal from '@/components/ui/Modal';
import ApplyConnectionForm from '@/components/ApplyConnectionForm';
import PaymentModal from '@/components/PaymentModal';

// ---------- TYPE DEFINITIONS ----------
interface Connection {
    _id: string;
    applicationId: string;
    applicantName: string;
    email: string;
    mobile: string;
    nidNo: string;
    address: string;
    connectionType: 'residential' | 'commercial' | 'industrial';
    loadRequired: number;
    voltageLevel: string;
    purpose: string;
    feederName: string;
    transformerNo: string;
    poleNumber: string;
    nearestLandmark: string;
    consumerId: string;
    status: 'pending_payment' | 'payment_done' | 'under_xen_review' | 'forwarded_to_wing' | 'implemented' | 'rejected';
    paymentStatus: 'pending' | 'paid';
    feeAmount: number;
    assignedMeterNo: string | null;
    implementedAt: string | null;
    xenRemarks: string | null;
    connectionWingRemarks: string | null;
    createdAt: string;
    updatedAt: string;
}

const ITEMS_PER_PAGE = 5;

const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    pending_payment: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending Payment', icon: Clock },
    payment_done: { color: 'bg-blue-100 text-blue-700', label: 'Payment Done', icon: CheckCircle },
    under_xen_review: { color: 'bg-purple-100 text-purple-700', label: 'Under XEN Review', icon: Loader2 },
    forwarded_to_wing: { color: 'bg-orange-100 text-orange-700', label: 'Forwarded to Wing', icon: ArrowRight },
    implemented: { color: 'bg-green-100 text-green-700', label: 'Implemented', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected', icon: XCircle },
};

export default function ConsumerConnectionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedConn, setSelectedConn] = useState<Connection | null>(null);

    // Payment modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentConn, setPaymentConn] = useState<Connection | null>(null);
    const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
    const [paymentCancelMsg, setPaymentCancelMsg] = useState<string | null>(null);

    const fetchConnections = async () => {
        const token = getCookie('token');
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setConnections(data);
            } else if (data?.message) {
                console.warn(data.message);
                setConnections([]);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    // Check URL params for payment status
    useEffect(() => {
        const paymentStatus = searchParams.get('payment');
        if (paymentStatus === 'success') {
            setPaymentSuccessMsg('Payment completed successfully! Your application is now under review.');
            router.replace('/dashboard/consumer/connections');
        } else if (paymentStatus === 'cancelled') {
            setPaymentCancelMsg('Payment was cancelled. You can try again anytime.');
            router.replace('/dashboard/consumer/connections');
        }
    }, [searchParams, router]);

    const filteredConnections = useMemo(() => {
        return connections.filter(conn => {
            const matchesSearch = conn.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conn.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conn.mobile?.includes(searchTerm);
            const matchesStatus = filterStatus === 'all' || conn.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [connections, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredConnections.length / ITEMS_PER_PAGE);
    const paginatedConnections = filteredConnections.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = [
        { label: 'Total', value: connections.length, icon: FileText, color: 'bg-blue-100 text-blue-600' },
        { label: 'Pending Payment', value: connections.filter(c => c.status === 'pending_payment').length, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
        { label: 'Under Review', value: connections.filter(c => c.status === 'under_xen_review' || c.status === 'forwarded_to_wing').length, icon: Loader2, color: 'bg-purple-100 text-purple-600' },
        { label: 'Implemented', value: connections.filter(c => c.status === 'implemented').length, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    ];

    const getTotalFee = (conn: Connection) => {
        const deposit = conn.connectionType === 'residential' ? 2000 : conn.connectionType === 'commercial' ? 5000 : 10000;
        return (conn.feeAmount || 0) + deposit;
    };

    const handleOpenPayment = (conn: Connection) => {
        setPaymentConn(conn);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        setPaymentConn(null);
        fetchConnections();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle size={40} className="text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <button onClick={fetchConnections} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Payment status banners */}
            {paymentSuccessMsg && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-600" />
                    <p className="text-sm text-green-700">{paymentSuccessMsg}</p>
                    <button onClick={() => setPaymentSuccessMsg(null)} className="ml-auto text-green-500 hover:text-green-700">
                        <X size={16} />
                    </button>
                </div>
            )}
            {paymentCancelMsg && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle size={20} className="text-yellow-600" />
                    <p className="text-sm text-yellow-700">{paymentCancelMsg}</p>
                    <button onClick={() => setPaymentCancelMsg(null)} className="ml-auto text-yellow-500 hover:text-yellow-700">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <Zap size={24} className="text-emerald-600" />
                        <span>My Connections</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Track your new connection applications</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={fetchConnections} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => setShowApplyModal(true)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 flex items-center space-x-2"
                    >
                        <Plus size={16} />
                        <span>New Application</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
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

            {/* Search & Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by application ID, name, or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="pending_payment">Pending Payment</option>
                            <option value="payment_done">Payment Done</option>
                            <option value="under_xen_review">Under XEN Review</option>
                            <option value="forwarded_to_wing">Forwarded to Wing</option>
                            <option value="implemented">Implemented</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <button
                            onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Connections Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load (kW)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedConnections.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No applications found. &nbsp;
                                        <button onClick={() => setShowApplyModal(true)} className="text-emerald-600 font-medium hover:underline">
                                            Apply for new connection
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                paginatedConnections.map((conn) => {
                                    const statusBadge = statusConfig[conn.status] || statusConfig.pending_payment;
                                    const StatusIcon = statusBadge.icon;
                                    const totalAmount = getTotalFee(conn);
                                    return (
                                        <tr key={conn._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">{conn.applicationId}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-800">{conn.applicantName}</p>
                                                <p className="text-xs text-gray-400">{conn.mobile}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">{conn.connectionType}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{conn.loadRequired} kW</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                                    <StatusIcon size={12} />
                                                    {statusBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">৳{totalAmount.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => { setSelectedConn(conn); setShowDetailModal(true); }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} className="text-gray-500" />
                                                    </button>
                                                    {conn.status === 'pending_payment' && (
                                                        <button
                                                            className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
                                                            onClick={() => handleOpenPayment(conn)}
                                                        >
                                                            Pay ৳{totalAmount.toLocaleString()}
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

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredConnections.length)} of {filteredConnections.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded-lg text-sm ${currentPage === page ? 'bg-emerald-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Apply Modal */}
            <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply for New Connection">
                <ApplyConnectionForm onClose={() => { setShowApplyModal(false); fetchConnections(); }} />
            </Modal>

            {/* Detail Modal */}
            {showDetailModal && selectedConn && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FileText size={20} className="text-emerald-600" /> Connection Details
                            </h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-gray-500">Application ID</span><p className="font-medium">{selectedConn.applicationId}</p></div>
                            <div><span className="text-gray-500">Status</span><span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedConn.status]?.color}`}>{statusConfig[selectedConn.status]?.label}</span></div>
                            <div><span className="text-gray-500">Applicant</span><p className="font-medium">{selectedConn.applicantName}</p></div>
                            <div><span className="text-gray-500">Mobile</span><p className="font-medium">{selectedConn.mobile}</p></div>
                            <div><span className="text-gray-500">Email</span><p className="font-medium">{selectedConn.email}</p></div>
                            <div><span className="text-gray-500">Connection Type</span><p className="font-medium capitalize">{selectedConn.connectionType}</p></div>
                            <div><span className="text-gray-500">Load</span><p className="font-medium">{selectedConn.loadRequired} kW</p></div>
                            <div><span className="text-gray-500">Voltage</span><p className="font-medium">{selectedConn.voltageLevel}</p></div>
                            <div className="col-span-2"><span className="text-gray-500">Address</span><p className="font-medium">{selectedConn.address}</p></div>
                            {selectedConn.assignedMeterNo && (
                                <div className="col-span-2"><span className="text-gray-500">Assigned Meter</span><p className="font-bold text-emerald-600">{selectedConn.assignedMeterNo}</p></div>
                            )}
                            <div className="col-span-2">
                                <span className="text-gray-500">Fee Breakdown</span>
                                <div className="flex justify-between mt-1"><span>Connection Fee</span><span>৳{selectedConn.feeAmount?.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>Security Deposit</span><span>৳{(selectedConn.connectionType === 'residential' ? 2000 : selectedConn.connectionType === 'commercial' ? 5000 : 10000).toLocaleString()}</span></div>
                                <div className="flex justify-between font-semibold"><span>Total</span><span>৳{getTotalFee(selectedConn).toLocaleString()}</span></div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && paymentConn && (
                <PaymentModal
                    applicationId={paymentConn._id}
                    connectionType={paymentConn.connectionType}
                    connectionFee={paymentConn.feeAmount || 0}
                    securityDeposit={
                        paymentConn.connectionType === 'residential' ? 2000 :
                            paymentConn.connectionType === 'commercial' ? 5000 : 10000
                    }
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}