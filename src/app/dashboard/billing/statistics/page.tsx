// src/app/dashboard/billing/statistics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, BarChart3, PieChart, TrendingUp, AlertCircle, Activity, DollarSign
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function BillingStatisticsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [monthlyAmount, setMonthlyAmount] = useState<any[]>([]);
    const [monthlyCount, setMonthlyCount] = useState<any[]>([]);
    const [paidVsUnpaid, setPaidVsUnpaid] = useState<any[]>([]);
    const [summary, setSummary] = useState({ totalCollected: 0, totalDue: 0, totalBills: 0 });

    useEffect(() => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        const headers = { Authorization: `Bearer ${token}` };

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/all`, { headers })
            .then(res => res.json())
            .then(data => {
                const bills = Array.isArray(data) ? data : [];
                // আজকের মাস
                const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

                // মাসিক অ্যামাউন্ট ও কাউন্ট
                const last12 = getLast12Months();
                const monthlyAmountMap: Record<string, number> = {};
                const monthlyCountMap: Record<string, number> = {};
                last12.forEach(m => {
                    monthlyAmountMap[m] = 0;
                    monthlyCountMap[m] = 0;
                });
                bills.forEach((bill: any) => {
                    const month = formatMonth(new Date(bill.createdAt));
                    if (monthlyAmountMap.hasOwnProperty(month)) {
                        monthlyAmountMap[month] += bill.amount || 0;
                        monthlyCountMap[month] += 1;
                    }
                });
                setMonthlyAmount(last12.map(m => ({ month: m, amount: monthlyAmountMap[m] })));
                setMonthlyCount(last12.map(m => ({ month: m, count: monthlyCountMap[m] })));

                // পেইড বনাম আনপেইড (বর্তমান মাস)
                const currentBills = bills.filter((b: any) => {
                    const month = formatMonth(new Date(b.dueDate || b.createdAt));
                    return month === currentMonth;
                });
                const paidAmount = currentBills.filter((b: any) => b.status === 'paid').reduce((s: number, b: any) => s + (b.amount || 0), 0);
                const unpaidAmount = currentBills.filter((b: any) => b.status !== 'paid').reduce((s: number, b: any) => s + (b.amount || 0), 0);
                setPaidVsDue([
                    { name: 'Paid', value: paidAmount },
                    { name: 'Due', value: unpaidAmount },
                ]);

                // সারাংশ
                const totalCollected = bills.filter((b: any) => b.status === 'paid').reduce((s: number, b: any) => s + (b.amount || 0), 0);
                const totalDue = bills.filter((b: any) => b.status !== 'paid').reduce((s: number, b: any) => s + (b.amount || 0), 0);
                setSummary({
                    totalCollected,
                    totalDue,
                    totalBills: bills.length,
                });
            })
            .catch(() => setError('Failed to load statistics'))
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
                    Billing Statistics
                </h2>
                <p className="text-gray-500 mt-1 ml-14">Insights on revenue, collections and outstanding amounts</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-5 border flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-100 text-green-600"><DollarSign size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Collected</p>
                        <p className="text-2xl font-bold text-gray-800">৳{summary.totalCollected.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-red-100 text-red-600"><AlertCircle size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Due</p>
                        <p className="text-2xl font-bold text-gray-800">৳{summary.totalDue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600"><Activity size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Bills</p>
                        <p className="text-2xl font-bold text-gray-800">{summary.totalBills}</p>
                    </div>
                </div>
            </div>

            {/* Monthly Amount Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-600" />
                    Monthly Bill Collection (Amount)
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlyAmount} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, 'Collection']} />
                        <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Monthly Count Bar Chart + Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart3 size={20} className="text-emerald-600" />
                        Monthly Bill Count
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyCount} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <PieChart size={20} className="text-emerald-600" />
                        Current Month: Paid vs Due
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RePieChart>
                            <Pie
                                data={paidVsUnpaid}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ৳${Number(value).toLocaleString()}`}
                            >
                                {paidVsUnpaid.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => `৳${Number(value).toLocaleString()}`} />
                        </RePieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// Helper functions
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