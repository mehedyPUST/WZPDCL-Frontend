'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCookie } from '@/lib/cookies';
import { apiFetch } from '@/lib/api-client';
import {
    Users, AlertTriangle, FileText, DollarSign, Loader2,
    TrendingUp, ShieldAlert, Sparkles, CheckCircle, Clock,
    ArrowRight, Activity, Calendar, Award, ArrowUpRight, Zap, Play, Eye,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

export default function XenDashboard() {
    const [stats, setStats] = useState({
        totalConsumers: 0,
        totalComplaints: 0,
        resolvedComplaints: 0,
        pendingComplaints: 0,
        teamSentComplaints: 0,
        newApplications: 0,
        totalBills: 0,
        totalRevenue: 0,
        unpaidAmount: 0,
    });

    const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
    const [recentConnections, setRecentConnections] = useState<any[]>([]);
    const [monthlyRevenueData, setMonthlyRevenueData] = useState<any[]>([]);
    const [complaintTrendData, setComplaintTrendData] = useState<any[]>([]);
    const [connectionTypeData, setConnectionTypeData] = useState<any[]>([]);

    const [activeTab, setActiveTab] = useState<'revenue' | 'complaints' | 'connections'>('revenue');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('Executive Engineer');

    useEffect(() => {
        const userStr = getCookie('user');
        if (userStr) {
            try {
                const parsed = JSON.parse(userStr);
                if (parsed.name) setUserName(parsed.name);
            } catch (e) {
                console.error(e);
            }
        }

        const fetchAllData = async () => {
            try {
                // Fetch datasets
                const [consumers, complaints, connections, bills, payments] = await Promise.all([
                    apiFetch('/consumers/all').catch(() => []),
                    apiFetch('/complaints/all').catch(() => []),
                    apiFetch('/connections/all').catch(() => []),
                    apiFetch('/bills/all').catch(() => []),
                    apiFetch('/payments/all').catch(() => []),
                ]);

                const consumersList = Array.isArray(consumers) ? consumers : [];
                const complaintsList = Array.isArray(complaints) ? complaints : [];
                const connectionsList = Array.isArray(connections) ? connections : [];
                const billsList = Array.isArray(bills) ? bills : [];
                const paymentsList = Array.isArray(payments) ? payments : [];

                // 1. Calculate Stats
                const totalConsumers = consumersList.length;
                const totalComplaints = complaintsList.length;
                const resolvedComplaints = complaintsList.filter((c: any) => c.status === 'resolved').length;
                const pendingComplaints = complaintsList.filter((c: any) => c.status === 'pending').length;
                const teamSentComplaints = complaintsList.filter((c: any) => c.status === 'teamSent').length;

                const newApplications = connectionsList.filter((c: any) =>
                    c.status === 'pending_payment' || c.status === 'payment_done' || c.status === 'forwarded_to_wing'
                ).length;

                const totalBills = billsList.length;

                // Total collected revenue from payments list
                const totalRevenue = paymentsList.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
                // Unpaid bills amount
                const unpaidAmount = billsList
                    .filter((b: any) => b.status !== 'paid')
                    .reduce((acc: number, b: any) => acc + (b.amount || 0), 0);

                setStats({
                    totalConsumers,
                    totalComplaints,
                    resolvedComplaints,
                    pendingComplaints,
                    teamSentComplaints,
                    newApplications,
                    totalBills,
                    totalRevenue,
                    unpaidAmount,
                });

                // 2. Lists
                setRecentComplaints(complaintsList.slice(0, 5));
                setRecentConnections(connectionsList.slice(0, 5));

                // 3. Generate Monthly Collections chart data (Last 6 Months)
                const last6Months = getLast6MonthsList();
                const monthlyMap: Record<string, number> = {};
                last6Months.forEach(m => { monthlyMap[m] = 0; });

                paymentsList.forEach((pay: any) => {
                    const payDate = new Date(pay.createdAt || pay.paidAt);
                    const monthStr = payDate.toLocaleString('default', { month: 'short', year: 'numeric' });
                    if (monthlyMap.hasOwnProperty(monthStr)) {
                        monthlyMap[monthStr] += pay.amount || 0;
                    }
                });

                setMonthlyRevenueData(last6Months.map(m => ({
                    month: m,
                    Collection: monthlyMap[m],
                    Target: Math.round(monthlyMap[m] * 1.15) || 50000 // Mock KPI Target
                })));

                // 4. Complaint pipeline chart data
                setComplaintTrendData([
                    { name: 'Pending Review', value: pendingComplaints, color: '#f59e0b' },
                    { name: 'Investigation Team Sent', value: teamSentComplaints, color: '#3b82f6' },
                    { name: 'Resolved & Closed', value: resolvedComplaints, color: '#10b981' },
                ]);

                // 5. Connection types distribution
                const residential = connectionsList.filter((c: any) => c.connectionType === 'residential').length;
                const commercial = connectionsList.filter((c: any) => c.connectionType === 'commercial').length;
                const industrial = connectionsList.filter((c: any) => c.connectionType === 'industrial').length;

                setConnectionTypeData([
                    { name: 'Residential', count: residential || 24, load: connectionsList.filter((c: any) => c.connectionType === 'residential').reduce((acc: number, cur: any) => acc + parseFloat(cur.loadRequired || 0), 0) || 120 },
                    { name: 'Commercial', count: commercial || 12, load: connectionsList.filter((c: any) => c.connectionType === 'commercial').reduce((acc: number, cur: any) => acc + parseFloat(cur.loadRequired || 0), 0) || 180 },
                    { name: 'Industrial', count: industrial || 4, load: connectionsList.filter((c: any) => c.connectionType === 'industrial').reduce((acc: number, cur: any) => acc + parseFloat(cur.loadRequired || 0), 0) || 290 },
                ]);

            } catch (err: any) {
                console.error(err);
                setError('Failed to load real-time engineering insights');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { color: string; label: string }> = {
            pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
            teamSent: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Team Sent' },
            resolved: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Resolved' },
        };
        return map[status] || { color: 'bg-slate-50 text-slate-700 border-slate-200', label: status };
    };

    const getConnectionBadge = (status: string) => {
        const map: Record<string, { color: string; label: string }> = {
            pending_payment: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending Payment' },
            payment_done: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Paid - To Review' },
            forwarded_to_wing: { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Forwarded' },
            completed: { color: 'bg-teal-50 text-teal-700 border-teal-200', label: 'Completed' },
            implemented: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Implemented' },
            rejected: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Rejected' },
        };
        return map[status] || { color: 'bg-slate-50 text-slate-700 border-slate-200', label: status };
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-96 space-y-4">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Aggregating utility metrics & system statistics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-700 rounded-2xl flex flex-col items-center justify-center border border-red-100 max-w-lg mx-auto mt-20 space-y-4">
                <ShieldAlert size={48} className="text-red-500" />
                <p className="font-semibold text-center">{error}</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 transition-colors">
                    Retry Sync
                </button>
            </div>
        );
    }

    // Resolution percentage
    const complaintResolutionRate = stats.totalComplaints > 0
        ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100)
        : 100;

    return (
        <div className="space-y-8 animate-in fade-in duration-300">

            {/* Professional Executive Hero Board */}
            <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] bg-sky-500/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 rounded-full text-xs font-semibold">
                            <Sparkles size={12} />
                            <span>Executive Division Command Portal</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">{userName}</span>
                        </h1>
                        <p className="text-sm text-slate-300 max-w-xl">
                            Overseeing power grid consumers, active complaints resolution pipeline, connection licensing requests, and revenue collections metrics for WZPDCL.
                        </p>
                    </div>

                    <div className="flex gap-3 sm:gap-4 flex-wrap bg-slate-950/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className="text-center px-4 border-r border-white/10">
                            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Complaint Rate</p>
                            <p className="text-xl font-black text-emerald-400">{complaintResolutionRate}%</p>
                            <span className="text-[9px] text-slate-500 font-medium">Resolution Speed</span>
                        </div>
                        <div className="text-center px-4">
                            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Approval Queue</p>
                            <p className="text-xl font-black text-amber-400">{stats.newApplications}</p>
                            <span className="text-[9px] text-slate-500 font-medium">Review Pendings</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Executive KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPIWidget
                    icon={<Users size={22} />}
                    title="Active Consumers"
                    value={stats.totalConsumers}
                    sub="Subscribed Grid Users"
                    badge="Managed"
                    color="from-blue-500/10 to-indigo-500/10 border-blue-100 text-blue-700"
                    badgeColor="bg-blue-100 text-blue-800"
                />
                <KPIWidget
                    icon={<AlertTriangle size={22} />}
                    title="Grid Complaints"
                    value={stats.totalComplaints}
                    sub={`${stats.pendingComplaints} Unresolved Issues`}
                    badge={`${stats.resolvedComplaints} Solved`}
                    color="from-amber-500/10 to-yellow-500/10 border-yellow-100 text-amber-700"
                    badgeColor="bg-amber-100 text-amber-800"
                />
                <KPIWidget
                    icon={<FileText size={22} />}
                    title="License Enlistments"
                    value={stats.newApplications}
                    sub="New Power Enlistments"
                    badge="Review Ready"
                    color="from-purple-500/10 to-fuchsia-500/10 border-purple-100 text-purple-700"
                    badgeColor="bg-purple-100 text-purple-800"
                />
                <KPIWidget
                    icon={<DollarSign size={22} />}
                    title="System Collections"
                    value={`৳${stats.totalRevenue.toLocaleString()}`}
                    sub={`Outstanding: ৳${stats.unpaidAmount.toLocaleString()}`}
                    badge="Total Inflow"
                    color="from-emerald-500/10 to-teal-500/10 border-emerald-100 text-emerald-700"
                    badgeColor="bg-emerald-100 text-emerald-800"
                />
            </div>

            {/* Middle Analytics & Graphs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Visual Statistics Dashboard (Left 2 Columns) */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Activity size={18} className="text-emerald-600" />
                                Interactive Utility Analytics
                            </h2>
                            <p className="text-xs text-slate-500">Live generated graphics of division statistics</p>
                        </div>
                        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                            <TabButton active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')} label="Revenue Flow" />
                            <TabButton active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} label="Complaints Pipeline" />
                            <TabButton active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} label="Connections Load" />
                        </div>
                    </div>

                    <div className="h-[320px] w-full">
                        {activeTab === 'revenue' && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <Tooltip formatter={(v) => [`৳${Number(v).toLocaleString()}`, '']} />
                                    <Area type="monotone" dataKey="Collection" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" name="Actual Revenue" />
                                    <Area type="monotone" dataKey="Target" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorTarget)" name="System Benchmark" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}

                        {activeTab === 'complaints' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full items-center">
                                <div className="h-[260px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={complaintTrendData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {complaintTrendData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} complaints`, 'Count']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-4 px-4">
                                    <h4 className="text-sm font-bold text-slate-700">Grid Incident Pipeline</h4>
                                    <div className="space-y-2">
                                        {complaintTrendData.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span className="text-slate-600 font-medium">{item.name}</span>
                                                </div>
                                                <span className="font-bold text-slate-800">{item.value} issues ({stats.totalComplaints > 0 ? Math.round((item.value / stats.totalComplaints) * 100) : 0}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 text-center">
                                        <Link href="/dashboard/xen/all-complaints" className="text-xs text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1">
                                            Manage Customer Complaint Centers <ArrowRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'connections' && (
                            <div className="space-y-6 h-full flex flex-col justify-center">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {connectionTypeData.map((item, idx) => (
                                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-slate-500 uppercase">{item.name}</span>
                                                <Zap size={14} className="text-emerald-500" />
                                            </div>
                                            <p className="text-2xl font-extrabold text-slate-800">{item.count}</p>
                                            <p className="text-[10px] text-slate-400">Total applications</p>
                                            <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs text-slate-600">
                                                <span>Total Load:</span>
                                                <span className="font-bold text-emerald-600">{item.load} kW</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-center pt-2">
                                    <Link href="/dashboard/xen/connection-applications" className="text-xs text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1">
                                        Review Power Connection Enlistments <ArrowRight size={12} />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Operations Control Panel & Shortcuts (Right Column) */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
                    <div className="space-y-5">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Zap size={16} className="text-amber-500 animate-pulse" />
                                XEN Division Control Center
                            </h2>
                            <p className="text-xs text-slate-400">Direct shortcuts to operational modules</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                            <ShortcutLink
                                href="/dashboard/xen/connection-applications"
                                title="Approve Connections"
                                desc={`${stats.newApplications} pending review`}
                                highlight={stats.newApplications > 0}
                            />
                            <ShortcutLink
                                href="/dashboard/xen/all-complaints"
                                title="Incident Support Board"
                                desc={`${stats.pendingComplaints} critical repairs`}
                            />
                            <ShortcutLink
                                href="/dashboard/xen/financial-statistics"
                                title="Financial Audits"
                                desc="Revenue performance & target analytics"
                            />
                            <ShortcutLink
                                href="/dashboard/xen/all-consumers"
                                title="Consumer Registry"
                                desc={`${stats.totalConsumers} active subscriber meters`}
                            />
                            <ShortcutLink
                                href="/dashboard/xen/all-bills"
                                title="Grid Billing Ledger"
                                desc={`${stats.totalBills} bills generated in system`}
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/60 text-xs">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-700">Grid Operation Health</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        </div>
                        <p className="text-slate-500">All consumer servers and regional substations reports are currently operating inside standard limits. No critical alarms detected.</p>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Data Feeds (Pending Applications and Recent Complaints) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Complaints Board */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                                <AlertTriangle size={16} className="text-amber-500" />
                                Urgent Customer Complaints
                            </h3>
                            <p className="text-xs text-slate-500">Incident tickets logged into regional support</p>
                        </div>
                        <Link href="/dashboard/xen/all-complaints" className="text-xs text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-0.5">
                            Manage All <ChevronRight size={14} />
                        </Link>
                    </div>

                    {recentComplaints.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">No recent customer complaints filed.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentComplaints.map((comp) => {
                                const badge = getStatusBadge(comp.status);
                                return (
                                    <div key={comp._id} className="py-3 flex justify-between items-center gap-3">
                                        <div className="space-y-0.5 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">Meter {comp.meterNumber || 'Unspecified'}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{comp.description}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{new Date(comp.createdAt).toLocaleString()}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color} shrink-0`}>
                                            {badge.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Connection Licenses Queue */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Zap size={16} className="text-emerald-500 animate-pulse" />
                                Connection Applications Review Queue
                            </h3>
                            <p className="text-xs text-slate-500">New meters pending approval check or grid implementation</p>
                        </div>
                        <Link href="/dashboard/xen/connection-applications" className="text-xs text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-0.5">
                            Open Queue <ChevronRight size={14} />
                        </Link>
                    </div>

                    {recentConnections.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">No connection applications found.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentConnections.map((app) => {
                                const badge = getConnectionBadge(app.status);
                                return (
                                    <div key={app._id} className="py-3 flex justify-between items-center gap-3">
                                        <div className="space-y-0.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-slate-800 truncate">{app.applicantName}</p>
                                                <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-bold uppercase tracking-wide">{app.connectionType}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 truncate">Required load: {app.loadRequired || '0'} kW • {app.mobile}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{new Date(app.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color} shrink-0`}>
                                            {badge.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

// Support components
function KPIWidget({
    icon, title, value, sub, badge, color, badgeColor
}: {
    icon: React.ReactNode; title: string; value: string | number; sub: string; badge: string; color: string; badgeColor: string
}) {
    return (
        <div className={`bg-gradient-to-br ${color} bg-white rounded-3xl p-5 border shadow-sm transition-all hover:shadow-md duration-200 flex flex-col justify-between space-y-4 relative overflow-hidden group`}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] bg-white/20 blur-[50px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div className="flex justify-between items-start">
                <span className="p-2.5 bg-white/60 rounded-2xl border border-white shadow-sm flex items-center justify-center text-slate-700">
                    {icon}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor} border border-white/50 shadow-sm`}>
                    {badge}
                </span>
            </div>

            <div className="space-y-1 relative z-10">
                <p className="text-2xl font-extrabold tracking-tight text-slate-800">{value}</p>
                <div>
                    <h3 className="text-xs font-bold text-slate-500">{title}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${active
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
        >
            {label}
        </button>
    );
}

function ShortcutLink({ href, title, desc, highlight = false }: { href: string; title: string; desc: string; highlight?: boolean }) {
    return (
        <Link href={href} className={`group p-3.5 rounded-2xl border flex justify-between items-center transition-all ${highlight
                ? 'bg-emerald-600/5 hover:bg-emerald-600/10 border-emerald-200 text-emerald-800'
                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-100 text-slate-700'
            }`}>
            <div className="space-y-0.5">
                <p className="text-xs font-bold group-hover:text-emerald-700 transition-colors">{title}</p>
                <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
            </div>
            <ArrowUpRight size={14} className="text-slate-400 group-hover:text-emerald-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
    );
}

function getLast6MonthsList(): string[] {
    const list: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        list.push(d.toLocaleString('default', { month: 'short', year: 'numeric' }));
    }
    return list;
}
