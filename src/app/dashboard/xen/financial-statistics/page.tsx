'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, BarChart3, PieChart, TrendingUp, AlertCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell
} from 'recharts';

export default function FinancialStatistics() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [monthlyBills, setMonthlyBills] = useState<any[]>([]);
    const [paidVsDue, setPaidVsDue] = useState<any[]>([]);
    const [connectionFees, setConnectionFees] = useState<any[]>([]);

    useEffect(() => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }

        const headers = { Authorization: `Bearer ${token}` };

        Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/all`, { headers }).then(r => r.json()),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/all`, { headers }).then(r => r.json()),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/all`, { headers }).then(r => r.json()),
        ])
            .then(([billsData, transactionsData, connectionsData]) => {
                const bills = Array.isArray(billsData) ? billsData : [];
                const last12Months = getLast12Months();
                const monthlyMap: Record<string, number> = {};
                last12Months.forEach(m => monthlyMap[m] = 0);
                bills.forEach((bill: any) => {
                    if (bill.status === 'paid' && bill.paidAt) {
                        const month = formatMonth(new Date(bill.paidAt));
                        if (monthlyMap.hasOwnProperty(month)) monthlyMap[month] += bill.amount || 0;
                    }
                });
                setMonthlyBills(last12Months.map(m => ({ month: m, amount: monthlyMap[m] })));

                const currentMonth = formatMonth(new Date());
                const currentBills = bills.filter((b: any) => formatMonth(new Date(b.dueDate || b.createdAt)) === currentMonth);
                const paid = currentBills.filter((b: any) => b.status === 'paid').reduce((s: number, b: any) => s + (b.amount || 0), 0);
                const due = currentBills.filter((b: any) => b.status !== 'paid').reduce((s: number, b: any) => s + (b.amount || 0), 0);
                setPaidVsDue([
                    { name: 'Paid', value: paid },
                    { name: 'Due', value: due },
                ]);

                const connections = Array.isArray(connectionsData) ? connectionsData : [];
                const trans = Array.isArray(transactionsData) ? transactionsData : [];
                const feeMonthlyMap: Record<string, number> = {};
                last12Months.forEach(m => feeMonthlyMap[m] = 0);
                trans.forEach((txn: any) => {
                    if (txn.type === 'connection_fee') {
                        const month = formatMonth(new Date(txn.createdAt));
                        if (feeMonthlyMap.hasOwnProperty(month)) feeMonthlyMap[month] += txn.amount || 0;
                    }
                });
                if (trans.length === 0) {
                    connections.forEach((conn: any) => {
                        if (conn.status === 'payment_done' || conn.feePaid) {
                            const month = formatMonth(new Date(conn.createdAt));
                            if (feeMonthlyMap.hasOwnProperty(month)) {
                                const fee = conn.feeAmount || (conn.connectionType === 'residential' ? 5000 : conn.connectionType === 'commercial' ? 10000 : 20000);
                                feeMonthlyMap[month] += fee;
                            }
                        }
                    });
                }
                setConnectionFees(last12Months.map(m => ({ month: m, amount: feeMonthlyMap[m] })));
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load statistics');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} /> {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div>
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                        <BarChart3 size={28} className="text-emerald-600" />
                    </div>
                    Financial Statistics
                </h2>
                <p className="text-gray-500 mt-1 ml-14">Overview of revenue and collections</p>
            </div>

            {/* Monthly Bill Collection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-600" />
                    Monthly Bill Collection (Last 12 Months)
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlyBills} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, 'Collection']} />
                        <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Paid vs Due + Connection Fees */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <PieChart size={20} className="text-emerald-600" />
                        Current Month: Paid vs Due
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RePieChart>
                            <Pie
                                data={paidVsDue}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ৳${Number(value).toLocaleString()}`}
                            >
                                <Cell fill="#10b981" />
                                <Cell fill="#f59e0b" />
                            </Pie>
                            <Tooltip formatter={(value: any) => `৳${Number(value).toLocaleString()}`} />
                        </RePieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart3 size={20} className="text-emerald-600" />
                        Connection Application Fees (Last 12 Months)
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={connectionFees} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, 'Fees']} />
                            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function formatMonth(date: Date): string {
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
}

function getLast12Months(): string[] {
    const months: string[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(formatMonth(d));
    }
    return months;
}