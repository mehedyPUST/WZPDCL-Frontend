// src/app/dashboard/billing/all-bills/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, FileText, Search, RefreshCw, ChevronLeft, ChevronRight,
    Eye, CheckCircle, Clock, X, Filter
} from 'lucide-react';

interface Bill {
    _id: string;
    meterNumber: string;
    amount: number;
    status: 'paid' | 'unpaid';
    dueDate: string;
    createdAt: string;
    consumerType?: string;
    prevReading?: number;
    currReading?: number;
    units?: number;
}

const ITEMS_PER_PAGE = 10;

export default function AllBillsPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const fetchBills = async () => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setBills(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to load bills');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBills(); }, []);

    const filteredBills = useMemo(() => {
        let result = bills;
        if (filterStatus !== 'all') result = result.filter(b => b.status === filterStatus);
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(b =>
                b.meterNumber?.toLowerCase().includes(term) ||
                b.consumerType?.toLowerCase().includes(term)
            );
        }
        return result;
    }, [bills, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
    const paginatedBills = filteredBills.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = useMemo(() => {
        const paid = bills.filter(b => b.status === 'paid').length;
        const unpaid = bills.filter(b => b.status === 'unpaid').length;
        const totalAmount = bills.reduce((sum, b) => sum + (b.amount || 0), 0);
        return { total: bills.length, paid, unpaid, totalAmount };
    }, [bills]);

    const openDetail = (bill: Bill) => {
        setSelectedBill(bill);
        setShowDetailModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 size={48} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <FileText size={28} className="text-emerald-600" />
                        </div>
                        All Bills
                    </h2>
                    <p className="text-gray-500 mt-1 ml-14">Complete list of all electricity bills</p>
                </div>
                <button onClick={fetchBills} className="p-2.5 rounded-xl border border-gray-200 hover:bg-emerald-50 transition-colors">
                    <RefreshCw size={18} className="text-gray-600" />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<FileText size={24} />} label="Total Bills" value={stats.total} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<CheckCircle size={24} />} label="Paid" value={stats.paid} color="bg-green-100 text-green-600" />
                <StatCard icon={<Clock size={24} />} label="Unpaid" value={stats.unpaid} color="bg-yellow-100 text-yellow-600" />
                <StatCard icon={<FileText size={24} />} label="Total Amount" value={`৳${stats.totalAmount.toLocaleString()}`} color="bg-purple-100 text-purple-600" isCurrency />
            </div>

            {/* Filter & Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by meter number or consumer type..."
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
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                        </select>
                    </div>
                    <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                        <RefreshCw size={16} /> Reset
                    </button>
                </div>
            </div>

            {/* Bills Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Meter #</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consumer Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedBills.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText size={32} className="opacity-30" />
                                            <p>No bills found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedBills.map((bill, idx) => (
                                    <tr key={bill._id} className={`hover:bg-emerald-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                        <td className="px-6 py-4 font-mono text-gray-700">{bill.meterNumber}</td>
                                        <td className="px-6 py-4 capitalize text-gray-600">{bill.consumerType || 'residential'}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">৳{bill.amount?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {bill.status === 'paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(bill.dueDate).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => openDetail(bill)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages} ({filteredBills.length} bills)
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
            {showDetailModal && selectedBill && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Bill Details</h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Meter Number</span><span className="font-medium">{selectedBill.meterNumber}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Consumer Type</span><span className="capitalize">{selectedBill.consumerType || 'residential'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Previous Reading</span><span>{selectedBill.prevReading ?? '-'} kWh</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Current Reading</span><span>{selectedBill.currReading ?? '-'} kWh</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Units Consumed</span><span>{selectedBill.units ?? '-'} kWh</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-emerald-700">৳{selectedBill.amount?.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedBill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{selectedBill.status}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Due Date</span><span>{new Date(selectedBill.dueDate).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                            {selectedBill.createdAt && (
                                <div className="flex justify-between"><span className="text-gray-500">Generated At</span><span>{new Date(selectedBill.createdAt).toLocaleString()}</span></div>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color, isCurrency }: {
    icon: React.ReactNode; label: string; value: string | number; color: string; isCurrency?: boolean;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800">
                    {isCurrency ? value : Number(value)}
                </p>
            </div>
        </div>
    );
}