// src/app/dashboard/consumer/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Zap, FileText, AlertCircle, RefreshCw, Loader2,
    ArrowRight, TrendingUp, CreditCard, CheckCircle
} from 'lucide-react';
import { getCookie } from '@/lib/cookies';
import { apiFetch } from '@/lib/api-client';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    Tooltip, CartesianGrid
} from 'recharts';

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

interface Complaint {
    _id: string;
    status: 'pending' | 'teamSent' | 'resolved';
}

export default function ConsumerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [meters, setMeters] = useState<Meter[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [mounted, setMounted] = useState(false);

    const loadDashboardData = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            // Get current user details from cookie
            const userStr = getCookie('user');
            if (userStr) {
                try {
                    setUser(JSON.parse(userStr));
                } catch (e) {
                    console.error('Error parsing user cookie:', e);
                }
            }

            // Fetch claimed meters
            const metersData = await apiFetch<Meter[]>('/meters/my').catch(() => []);
            setMeters(metersData);

            if (metersData.length > 0) {
                // Fetch bills & complaints
                const [billsData, complaintsData] = await Promise.all([
                    apiFetch<Bill[]>('/bills/my').catch(() => []),
                    apiFetch<Complaint[]>('/complaints/my').catch(() => [])
                ]);
                setBills(billsData);
                setComplaints(complaintsData);
            }
        } catch (error) {
            console.error('Failed to load consumer dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        loadDashboardData();
    }, []);

    // Prepare chart data (Monthly billing trends)
    const chartData = [...bills]
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(-6) // take last 6 bills
        .map(bill => ({
            name: new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            amount: bill.amount,
            status: bill.status === 'paid' ? 'Paid' : 'Unpaid'
        }));

    // Calculate billing summary stats
    const pendingBills = bills.filter(b => b.status === 'unpaid');
    const totalPendingAmount = pendingBills.reduce((acc, b) => acc + b.amount, 0);
    const activeMetersCount = meters.length;
    const openComplaintsCount = complaints.filter(c => c.status !== 'resolved').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 size={40} className="animate-spin text-emerald-600" />
                    <p className="text-gray-500 text-sm">Loading your energy dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Welcome, {user?.name || 'Valued Consumer'}!
                    </h1>
                    <p className="text-sm text-gray-500">
                        Here is an overview of your connection and billing activity.
                    </p>
                </div>
                <button
                    onClick={() => loadDashboardData(true)}
                    disabled={refreshing}
                    className="self-end sm:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                >
                    <RefreshCw size={16} className={`${refreshing ? 'animate-spin' : ''}`} />
                    <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Pending Bills */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-emerald-100 transition-all">
                    <div className="p-3.5 bg-yellow-50 text-yellow-600 rounded-xl">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Unpaid Bills</p>
                        <p className="text-2xl font-bold text-gray-800 mt-0.5">
                            {pendingBills.length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Pending: <span className="font-semibold text-yellow-600">৳{totalPendingAmount.toLocaleString()}</span>
                        </p>
                    </div>
                </div>

                {/* Active Meters */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-emerald-100 transition-all">
                    <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Claimed Meters</p>
                        <p className="text-2xl font-bold text-gray-800 mt-0.5">
                            {activeMetersCount}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Active electricity connection points
                        </p>
                    </div>
                </div>

                {/* Open Complaints */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-emerald-100 transition-all sm:col-span-2 lg:col-span-1">
                    <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Complaints</p>
                        <p className="text-2xl font-bold text-gray-800 mt-0.5">
                            {openComplaintsCount}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Pending or work-in-progress issues
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Visualizations & CTA Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Billing History Chart */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <TrendingUp size={20} className="text-emerald-600" />
                                <span>Billing & Consumption Trends</span>
                            </h3>
                            <p className="text-xs text-gray-500">
                                Monthly overview of bills generated for your meters
                            </p>
                        </div>
                    </div>

                    <div className="h-64 sm:h-72 w-full pt-2">
                        {mounted && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#9ca3af"
                                        fontSize={11}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `৳${val}`}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`৳${value}`, 'Amount']}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-100 rounded-xl">
                                <FileText size={40} className="text-gray-300 mb-2" />
                                <p className="text-sm font-semibold text-gray-600">No Historical Bills Available</p>
                                <p className="text-xs text-gray-400 mt-0.5">Please claim a meter to load your energy consumption history.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Quick Portal Actions</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Easily manage your utility account on the go
                        </p>

                        <div className="mt-4 space-y-3">
                            <button
                                onClick={() => router.push('/dashboard/consumer/my-bills')}
                                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-emerald-50 rounded-xl group transition-all text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm border border-gray-100">
                                        <CreditCard size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Pay My Bills</p>
                                        <p className="text-xs text-gray-400">View and clear utility invoices</p>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                            </button>

                            <button
                                onClick={() => router.push('/dashboard/consumer/my-complaints')}
                                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-emerald-50 rounded-xl group transition-all text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm border border-gray-100">
                                        <AlertCircle size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Support & Complaints</p>
                                        <p className="text-xs text-gray-400">Log new electrical issues</p>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                            </button>

                            <button
                                onClick={() => router.push('/dashboard/consumer/connections')}
                                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-emerald-50 rounded-xl group transition-all text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm border border-gray-100">
                                        <CheckCircle size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Meter Status</p>
                                        <p className="text-xs text-gray-400">Apply or check active connections</p>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400">
                            West Zone Power Distribution Co. Ltd. (WZPDCL)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
