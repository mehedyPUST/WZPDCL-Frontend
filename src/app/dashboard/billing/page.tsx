// src/app/dashboard/billing/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCookie } from '@/lib/cookies';
import Link from 'next/link';
import {
    Loader2, FileText, DollarSign, Users, Zap, RefreshCw,
    TrendingUp, AlertCircle, CheckCircle, Clock, PlusCircle,
    Eye, ArrowRight
} from 'lucide-react';

export default function BillingDashboard() {
    const [stats, setStats] = useState({
        totalBills: 0,
        paidBills: 0,
        unpaidBills: 0,
        totalConsumers: 0,
        totalMeters: 0,
        todayCollection: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [recentBills, setRecentBills] = useState<any[]>([]);

    const fetchData = async () => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [billsRes, consumersRes, metersRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/all`, { headers }).then(r => r.json()),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/consumers/all`, { headers }).then(r => r.json()),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/meters/all`, { headers }).then(r => r.json()),
            ]);

            const bills = Array.isArray(billsRes) ? billsRes : [];
            const consumers = Array.isArray(consumersRes) ? consumersRes : [];
            const meters = Array.isArray(metersRes) ? metersRes : [];

            const paid = bills.filter((b: any) => b.status === 'paid');
            const unpaid = bills.filter((b: any) => b.status !== 'paid');
            const today = new Date().toLocaleDateString();
            const todayPayments = paid.filter((b: any) =>
                b.paidAt && new Date(b.paidAt).toLocaleDateString() === today
            );

            setStats({
                totalBills: bills.length,
                paidBills: paid.length,
                unpaidBills: unpaid.length,
                totalConsumers: consumers.length,
                totalMeters: meters.length,
                todayCollection: todayPayments.reduce((sum: number, b: any) => sum + (b.amount || 0), 0),
            });

            // Recent unpaid bills (latest 5)
            const sortedUnpaid = unpaid.sort(
                (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setRecentBills(sortedUnpaid.slice(0, 5));
        } catch {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

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
                        Billing Dashboard
                    </h2>
                    <p className="text-gray-500 mt-1 ml-14">Overview of bills, collections, and quick actions</p>
                </div>
                <button onClick={fetchData} className="p-2.5 rounded-xl border border-gray-200 hover:bg-emerald-50 transition-colors">
                    <RefreshCw size={18} className="text-gray-600" />
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<FileText size={24} />} label="Total Bills" value={stats.totalBills} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<CheckCircle size={24} />} label="Paid" value={stats.paidBills} color="bg-green-100 text-green-600" />
                <StatCard icon={<Clock size={24} />} label="Unpaid" value={stats.unpaidBills} color="bg-yellow-100 text-yellow-600" />
                <StatCard icon={<Users size={24} />} label="Consumers" value={stats.totalConsumers} color="bg-purple-100 text-purple-600" />
            </div>

            {/* Secondary Metrics + Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Today's Collection */}
                <div className="bg-white rounded-xl shadow-sm border p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-500">Today's Collection</p>
                        <TrendingUp className="text-emerald-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-emerald-700">৳{stats.todayCollection.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Payments received today</p>
                </div>

                {/* Quick Actions */}
                <Link href="/dashboard/billing/generate-bills"
                    className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow flex flex-col items-center justify-center gap-3 group">
                    <div className="p-3 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors">
                        <PlusCircle size={24} className="text-emerald-600" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-emerald-700">Generate New Bill</span>
                </Link>

                <Link href="/dashboard/billing/all-bills"
                    className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow flex flex-col items-center justify-center gap-3 group">
                    <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                        <FileText size={24} className="text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-blue-700">View All Bills</span>
                </Link>
            </div>

            {/* Recent Unpaid Bills & Consumer/Meter Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Unpaid Bills */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <AlertCircle size={20} className="text-yellow-600" />
                            Unpaid Bills
                        </h3>
                        <Link href="/dashboard/billing/all-bills?status=unpaid" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    {recentBills.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
                            <p>No unpaid bills</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentBills.map((bill: any) => (
                                <div key={bill._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-mono text-sm font-medium text-gray-800">{bill.meterNumber}</p>
                                        <p className="text-xs text-gray-400">{bill.billingMonth || new Date(bill.dueDate).toLocaleDateString('en-BD', { month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-700">৳{bill.amount?.toLocaleString()}</p>
                                        <p className="text-xs text-red-500">Due {new Date(bill.dueDate).toLocaleDateString('en-BD', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Consumer & Meter Stats */}
                <div className="space-y-6">
                    {/* Consumer Stats */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Users size={20} className="text-purple-600" />
                            Consumer Summary
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Total Consumers</span>
                            <span className="font-semibold">{stats.totalConsumers}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                            <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (stats.totalConsumers / (stats.totalMeters || 1)) * 100)}%` }}></div>
                        </div>
                        <Link href="/dashboard/billing/all-consumers" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
                            View Consumers <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Meter Stats */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Zap size={20} className="text-emerald-600" />
                            Meter Summary
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Total Meters</span>
                            <span className="font-semibold">{stats.totalMeters}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (stats.totalMeters / (stats.totalConsumers || 1)) * 100)}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-400">
                            Average meters per consumer: {stats.totalConsumers ? (stats.totalMeters / stats.totalConsumers).toFixed(1) : '0'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: {
    icon: React.ReactNode; label: string; value: number; color: string;
}) {
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