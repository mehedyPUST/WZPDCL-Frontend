'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, DollarSign, Search, ChevronLeft, ChevronRight,
    RefreshCw, TrendingUp, TrendingDown, CalendarDays
} from 'lucide-react';

interface Transaction {
    _id: string;
    userId: string;
    applicationId?: string;
    billId?: string;
    amount: number;
    type: string;
    status: string;
    method?: string;
    createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function AllTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchTransactions = () => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/all`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setTransactions(Array.isArray(data) ? data : []))
            .catch(() => setError('Failed to load transactions'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchTransactions(); }, []);

    const filteredTransactions = useMemo(() => {
        if (!searchTerm.trim()) return transactions;
        const term = searchTerm.toLowerCase();
        return transactions.filter(txn =>
            txn.applicationId?.toLowerCase().includes(term) ||
            txn.billId?.toLowerCase().includes(term) ||
            txn.type?.toLowerCase().includes(term) ||
            txn.method?.toLowerCase().includes(term)
        );
    }, [transactions, searchTerm]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const paginatedTxns = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Summary stats
    const totalCollection = transactions.reduce((sum, t) => sum + t.amount, 0);
    const connectionFees = transactions
        .filter(t => t.type === 'connection_fee')
        .reduce((sum, t) => sum + t.amount, 0);
    const billPayments = transactions
        .filter(t => t.type === 'bill' || t.type === 'bill_payment')
        .reduce((sum, t) => sum + t.amount, 0);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
        </div>
    );
    if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <DollarSign size={28} className="text-emerald-600" />
                        </div>
                        All Transactions
                    </h2>
                    <p className="text-gray-500 mt-1 ml-14">Complete financial overview of the system</p>
                </div>
                <button onClick={fetchTransactions} className="p-2.5 rounded-xl border border-gray-200 hover:bg-emerald-50 transition-colors">
                    <RefreshCw size={18} className="text-gray-600" />
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full"><TrendingUp size={20} className="text-green-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Total Collection</p>
                            <p className="text-2xl font-bold text-gray-800">৳{totalCollection.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full"><DollarSign size={20} className="text-blue-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Connection Fees</p>
                            <p className="text-2xl font-bold text-gray-800">৳{connectionFees.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-full"><CalendarDays size={20} className="text-yellow-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Bill Payments</p>
                            <p className="text-2xl font-bold text-gray-800">৳{billPayments.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by application ID, bill ID, type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                />
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedTxns.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <DollarSign size={32} className="opacity-30" />
                                            <p className="text-lg font-medium">No transactions yet</p>
                                            <p className="text-sm">Transactions will appear once payments are made</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedTxns.map((txn, index) => (
                                    <tr key={txn._id} className={`hover:bg-emerald-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                        <td className="px-6 py-4 font-mono text-gray-700 text-xs">{txn._id.slice(-8).toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            {txn.applicationId ? (
                                                <span className="text-blue-600 font-mono text-xs">{txn.applicationId.slice(-10)}</span>
                                            ) : txn.billId ? (
                                                <span className="text-purple-600 font-mono text-xs">{txn.billId.slice(-10)}</span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${txn.type === 'connection_fee' ? 'bg-blue-100 text-blue-700' :
                                                    txn.type === 'bill' || txn.type === 'bill_payment' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {txn.type === 'connection_fee' ? 'Connection Fee' :
                                                    txn.type === 'bill_payment' ? 'Bill Payment' : txn.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">৳{txn.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-500 capitalize">{txn.method || 'online'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {new Date(txn.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages} ({filteredTransactions.length} transactions)
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
        </div>
    );
}