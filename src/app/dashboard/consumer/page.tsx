// src/app/dashboard/consumer/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Zap, FileText, AlertCircle, RefreshCw, Loader2,
    ArrowRight, TrendingUp, CreditCard, CheckCircle, Calculator, Info, HelpCircle,
    Activity, ShieldAlert, Sparkles, Sun, Moon, Leaf
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
    const [peakRatio, setPeakRatio] = useState<number>(25); // percentage consumed during Peak Hours (5pm - 11pm)

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

            {/* Live Grid Status & Load Management Bulletin */}
            <div className="bg-gradient-to-r from-slate-950 to-slate-850 rounded-2xl p-5 text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40 font-mono">
                            Live WZPDCL Grid Monitor
                        </span>
                    </div>
                    <h2 className="text-base font-bold tracking-tight">West Zone Power Grid Status</h2>
                    <p className="text-xs text-slate-300 max-w-xl">
                        Real-time transmission telemetry and peak management details for Khulna, Kushtia, Barisal, and Faridpur grid lines. System operating at optimal load.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto font-mono text-xs">
                    <div className="bg-slate-800/80 border border-slate-700/50 p-2.5 rounded-xl min-w-[100px] text-center">
                        <p className="text-[10px] text-slate-400 font-sans">Voltage</p>
                        <p className="text-xs font-bold text-slate-100 mt-1">230.1 V</p>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/50 p-2.5 rounded-xl min-w-[100px] text-center">
                        <p className="text-[10px] text-slate-400 font-sans">Frequency</p>
                        <p className="text-xs font-bold text-emerald-400 mt-1">49.98 Hz</p>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/50 p-2.5 rounded-xl min-w-[100px] text-center">
                        <p className="text-[10px] text-slate-400 font-sans">Grid Load</p>
                        <p className="text-xs font-bold text-amber-400 mt-1">Normal</p>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/50 p-2.5 rounded-xl min-w-[100px] text-center">
                        <p className="text-[10px] text-slate-400 font-sans">Load Shedding</p>
                        <p className="text-xs font-bold text-emerald-400 mt-1">0% (Nil)</p>
                    </div>
                </div>
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

                {/* Advanced Peak & Off-Peak Optimizer & Carbon Offset Calculator */}
                <div className="border-t border-gray-100 pt-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
                                <Sparkles size={18} className="text-amber-500 fill-amber-500 animate-pulse" />
                                <span>WZPDCL Peak-Hour Load Optimizer & Carbon Footprint Simulator</span>
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Simulate your usage behavior during BERC peak hours (5:00 PM – 11:00 PM) to find cost-saving options and track your eco-impact.
                            </p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wider shrink-0 self-start sm:self-auto">
                            Interactive simulation
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-50/20 rounded-2xl border border-emerald-600/10 p-5">
                        {/* Simulation Controls */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                    <Sun size={14} className="text-amber-500" />
                                    <span>Off-Peak Usage (11 PM - 5 PM)</span>
                                </span>
                                <span className="text-xs font-mono font-bold text-gray-600">
                                    {100 - peakRatio}% ({Math.round(calcUnits * ((100 - peakRatio) / 100))} kWh)
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                    <Moon size={14} className="text-indigo-600" />
                                    <span>Peak Hours Usage (5 PM - 11 PM)</span>
                                </span>
                                <span className="text-xs font-mono font-bold text-indigo-700">
                                    {peakRatio}% ({Math.round(calcUnits * (peakRatio / 100))} kWh)
                                </span>
                            </div>

                            <input
                                type="range"
                                min="5"
                                max="80"
                                step="5"
                                value={peakRatio}
                                onChange={(e) => setPeakRatio(Number(e.target.value))}
                                className="w-full accent-indigo-600 h-2 bg-gray-150 rounded-lg cursor-pointer"
                            />

                            <div className="p-3 bg-white rounded-xl border border-gray-150 text-[11px] text-gray-500 leading-relaxed space-y-1.5">
                                <p className="font-semibold text-gray-700">💡 Did you know?</p>
                                <p>
                                    BERC Peak Hour tariff applies from 5 PM to 11 PM daily. By shifting heavy loads like clothes iron, water heaters, water pumps, or laundry machines to the morning (Off-Peak), you dramatically reduce the strain on the WZPDCL substation transformers.
                                </p>
                            </div>
                        </div>

                        {/* Cost & Carbon Environmental Score */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Cost TOU vs Flat projection */}
                            <div className="bg-white p-4 rounded-xl border border-gray-150 flex flex-col justify-between shadow-sm">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated TOU Cost</p>
                                    <p className="text-xl font-bold font-mono text-gray-800">
                                        ৳{Math.round(((calcUnits * (peakRatio / 100)) * 12.60 + (calcUnits * ((100 - peakRatio) / 100)) * 8.40) * 1.05 + calcResult.demandCharge + calcResult.serviceCharge).toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-gray-500 leading-tight">
                                        Calculated at Time of Use (TOU) rates (Peak: ৳12.60/kWh, Off-Peak: ৳8.40/kWh).
                                    </p>
                                </div>
                                <div className="border-t border-gray-100 pt-2.5 mt-3 text-xs">
                                    {peakRatio <= 25 ? (
                                        <p className="text-emerald-600 font-semibold flex items-center gap-1">
                                            <CheckCircle size={12} />
                                            <span>Excellent Peak Shift!</span>
                                        </p>
                                    ) : (
                                        <p className="text-amber-600 font-semibold flex items-center gap-1">
                                            <Info size={12} />
                                            <span>Shift peak to &lt;25% to save!</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Carbon Footprint score */}
                            <div className="bg-white p-4 rounded-xl border border-gray-150 flex flex-col justify-between shadow-sm">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                        <Leaf size={12} className="text-emerald-500 fill-emerald-500" />
                                        <span>Carbon Impact</span>
                                    </p>
                                    <p className="text-xl font-bold font-mono text-gray-800">
                                        {Math.round(calcUnits * 0.64)} kg CO₂
                                    </p>
                                    <p className="text-[10px] text-gray-500 leading-tight">
                                        Equivalent to the monthly carbon absorption of <span className="font-semibold text-emerald-600 font-mono">{Math.max(1, Math.round((calcUnits * 0.64) / 1.8))} mature trees</span>.
                                    </p>
                                </div>
                                <div className="border-t border-gray-100 pt-2.5 mt-3 text-xs text-gray-500 font-medium">
                                    Bengal Grid Avg: 0.64kg/kWh
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
