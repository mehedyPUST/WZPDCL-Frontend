// src/app/dashboard/consumer/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Zap, FileText, AlertCircle, RefreshCw, Loader2,
    ArrowRight, TrendingUp, CreditCard, CheckCircle, Calculator, Info, HelpCircle
} from 'lucide-react';
import { getCookie } from '@/lib/cookies';
import { apiFetch } from '@/lib/api-client';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    Tooltip, CartesianGrid
} from 'recharts';
import { calculateBangladeshBill } from '@/lib/tariff-calculator';

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

    // Bangladesh Bill Calculator States
    const [calcUnits, setCalcUnits] = useState<number>(150);
    const [calcCategory, setCalcCategory] = useState<'residential' | 'commercial' | 'industrial'>('residential');

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

    // Bangladesh Bill Calculation
    const calcResult = calculateBangladeshBill(calcUnits, calcCategory);

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

            {/* WZPDCL Bangladesh Tariff Slabs & Bill Calculator */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Calculator size={22} className="text-emerald-600" />
                            <span>WZPDCL Bangladesh Bill Calculator & Tariff Explainer</span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Estimate your monthly bill based on current BERC/WZPDCL residential & commercial stepped tariff slabs.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <Info size={14} />
                        <span>Tariff Version: BERC 2024 Updates</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Input Controls */}
                    <div className="lg:col-span-5 space-y-5">
                        {/* Consumer Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 block">Consumer Category</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['residential', 'commercial', 'industrial'] as const).map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCalcCategory(cat)}
                                        className={`py-2 px-3 text-xs font-semibold capitalize rounded-xl border transition-all ${calcCategory === cat
                                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Units Consumed Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-700">Monthly Consumption (kWh / Units)</label>
                                <span className="text-lg font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                                    {calcUnits} Units
                                </span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="1000"
                                step="5"
                                value={calcUnits}
                                onChange={(e) => setCalcUnits(Number(e.target.value))}
                                className="w-full accent-emerald-600 h-2 bg-gray-100 rounded-lg cursor-pointer"
                            />

                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="5000"
                                    value={calcUnits}
                                    onChange={(e) => setCalcUnits(Math.max(0, Number(e.target.value)))}
                                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-gray-800"
                                    placeholder="Enter units consumed..."
                                />
                                <div className="flex gap-1.5">
                                    {[50, 150, 300, 500].map((quickVal) => (
                                        <button
                                            key={quickVal}
                                            type="button"
                                            onClick={() => setCalcUnits(quickVal)}
                                            className="px-2.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 transition-colors"
                                        >
                                            {quickVal}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* BERC Tariff Rates Summary Info */}
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                <HelpCircle size={14} className="text-gray-400" />
                                <span>Stepped Tariff Slabs (LT-A)</span>
                            </h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Bangladesh residential connection utilizes a progressive step slab system. As consumption increases, the cost per unit increases to promote energy conservation.
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-600 pt-1.5 border-t border-gray-200/60 font-mono">
                                <div>Lifeline (0-50): <span className="font-bold">৳4.63</span></div>
                                <div>Slab 1 (1-75): <span className="font-bold">৳5.26</span></div>
                                <div>Slab 2 (76-200): <span className="font-bold">৳7.20</span></div>
                                <div>Slab 3 (201-300): <span className="font-bold">৳7.59</span></div>
                                <div>Slab 4 (301-400): <span className="font-bold">৳8.02</span></div>
                                <div>Slab 5 (401-600): <span className="font-bold">৳11.67</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Cost Breakdown Output */}
                    <div className="lg:col-span-7 bg-gray-50/50 rounded-2xl border border-gray-100 p-5 space-y-5">
                        <h4 className="text-sm font-bold text-gray-800">Estimated Cost Breakdown</h4>

                        {/* Slabs calculation block */}
                        <div className="space-y-2.5">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Step Slab Distribution</p>
                            <div className="space-y-2">
                                {calcResult.slabs.map((slab, index) => (
                                    <div key={index} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-semibold text-gray-700">{slab.slabName}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-mono">
                                            <span className="text-gray-400">{slab.units} kWh × ৳{slab.rate.toFixed(2)}</span>
                                            <span className="font-bold text-gray-800">৳{slab.amount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Itemized list details */}
                        <div className="border-t border-dashed border-gray-200 pt-4 space-y-2.5 text-xs text-gray-600">
                            <div className="flex justify-between">
                                <span>Total Energy Charge</span>
                                <span className="font-semibold font-mono text-gray-800">৳{calcResult.energyCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1">
                                    <span>Demand Charge</span>
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-sans">Fixed</span>
                                </span>
                                <span className="font-semibold font-mono text-gray-800">৳{calcResult.demandCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1">
                                    <span>Service Charge / Meter Rent</span>
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-sans">Fixed</span>
                                </span>
                                <span className="font-semibold font-mono text-gray-800">৳{calcResult.serviceCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-100 pt-2 text-gray-500">
                                <span>Sub-Total</span>
                                <span className="font-semibold font-mono">৳{calcResult.subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-yellow-700">
                                <span className="flex items-center gap-1">
                                    <span>Govt. VAT (5%)</span>
                                    <span className="text-[10px] bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded border border-yellow-100 font-sans">Statutory</span>
                                </span>
                                <span className="font-semibold font-mono">৳{calcResult.vatAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Grand Total banner */}
                        <div className="bg-emerald-600 text-white rounded-xl p-4 flex items-center justify-between shadow-md shadow-emerald-100">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-85">Total Estimated Bill Amount</p>
                                <p className="text-2xl font-black font-mono mt-0.5">৳{calcResult.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            {calcResult.isLifeline && (
                                <div className="bg-white/20 text-white border border-white/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                                    Lifeline Applied
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
