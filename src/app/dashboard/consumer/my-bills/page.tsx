'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText, Search, ChevronLeft, ChevronRight, RefreshCw,
    Loader2, AlertCircle, CheckCircle, Zap, Plus
} from 'lucide-react';
import { getCookie } from '@/lib/cookies';
import ClaimMeterModal from '@/components/ClaimMeterModal';

interface Bill {
    _id: string;
    meterNumber: string;
    amount: number;
    status: 'paid' | 'unpaid';
    dueDate: string;
}

interface Meter {
    meterNumber: string;
    claimedBy: string;
}

const ITEMS_PER_PAGE = 5;

export default function MyBillsPage() {
    const router = useRouter();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [claimedMeters, setClaimedMeters] = useState<Meter[]>([]);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [meterCheckLoading, setMeterCheckLoading] = useState(true);

    const fetchMetersAndBills = async () => {
        const token = getCookie('token');
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            setMeterCheckLoading(false);
            return;
        }
        try {
            const meterRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meters/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const meterData = await meterRes.json();
            const metersList: Meter[] = Array.isArray(meterData) ? meterData : [];
            setClaimedMeters(metersList);
            setMeterCheckLoading(false);

            if (metersList.length === 0) {
                setBills([]);
                setLoading(false);
                return;
            }

            const billsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const billsData = await billsRes.json();
            setBills(Array.isArray(billsData) ? billsData : []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetersAndBills();
    }, []);

    const filteredBills = useMemo(() => {
        return bills.filter(b =>
            b.meterNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [bills, searchTerm]);

    const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
    const paginatedBills = filteredBills.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = [
        { label: 'Total Bills', value: bills.length, icon: FileText, color: 'bg-blue-100 text-blue-600' },
        { label: 'Paid', value: bills.filter(b => b.status === 'paid').length, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
        { label: 'Unpaid', value: bills.filter(b => b.status === 'unpaid').length, icon: AlertCircle, color: 'bg-yellow-100 text-yellow-600' },
    ];

    if (meterCheckLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!loading && claimedMeters.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto border border-emerald-100">
                    <Zap size={48} className="mx-auto text-emerald-600 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Meter Claimed</h2>
                    <p className="text-gray-500 mb-6">You haven't claimed any meter yet. Please claim a meter to view your bills.</p>
                    <button
                        onClick={() => setShowClaimModal(true)}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Claim a Meter
                    </button>
                </div>
                <ClaimMeterModal
                    isOpen={showClaimModal}
                    onClose={() => setShowClaimModal(false)}
                    onSuccess={() => { setShowClaimModal(false); fetchMetersAndBills(); }}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle size={40} className="text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <button onClick={fetchMetersAndBills} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <FileText size={24} className="text-emerald-600" />
                        <span>My Bills</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {claimedMeters.length} meter{claimedMeters.length > 1 ? 's' : ''} claimed
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={fetchMetersAndBills} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                    <button onClick={() => setShowClaimModal(true)} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                        <Plus size={16} />
                        Claim Another Meter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by meter number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedBills.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No bills found.</td></tr>
                            ) : (
                                paginatedBills.map((bill) => (
                                    <tr key={bill._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{bill.meterNumber}</td>
                                        <td className="px-6 py-4 text-sm font-medium">৳{bill.amount}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(bill.dueDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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

            <ClaimMeterModal
                isOpen={showClaimModal}
                onClose={() => setShowClaimModal(false)}
                onSuccess={() => { setShowClaimModal(false); fetchMetersAndBills(); }}
            />
        </div>
    );
}