// src/app/dashboard/admin/page.tsx
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Users, Zap, FileText, AlertTriangle,
    Search, RefreshCw, Shield, Edit, Trash2, UserCog,
    Star, MessageSquare, EyeOff, TrendingUp,
    CheckCircle, Clock, ShieldCheck, Mail, Calendar,
    DollarSign, Wrench
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    PieChart, Pie, Cell, Legend
} from 'recharts';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

interface Review {
    _id: string;
    userId: string;
    complaintId: string;
    rating: number;
    text: string;
    visible: boolean;
    createdAt: string;
}

const ROLES = ['consumer', 'xen', 'connection', 'billing', 'complaint', 'admin'];

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [connections, setConnections] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editRole, setEditRole] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [adminId, setAdminId] = useState<string | null>(null);

    // Active tab: 'overview' | 'users' | 'reviews'
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reviews'>('overview');
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [hidingReviewId, setHidingReviewId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch public reviews
    const fetchReviews = useCallback(async () => {
        setLoadingReviews(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/public`);
            const data = await res.json();
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setLoadingReviews(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchReviews();
        }
    }, [activeTab, fetchReviews]);

    // Admin hide review handler
    const handleHideReview = async (reviewId: string) => {
        if (!confirm('Are you sure you want to hide this review from the public homepage?')) return;
        const token = getCookie('token');
        if (!token) return alert('Not authenticated');
        setHidingReviewId(reviewId);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/hide/${reviewId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to hide review');
            fetchReviews();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setHidingReviewId(null);
        }
    };

    // Fetch admin's own ID
    useEffect(() => {
        const token = getCookie('token');
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data?._id) setAdminId(data._id);
            })
            .catch(console.error);
    }, []);

    const fetchData = useCallback(async () => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [usersRes, connectionsRes, billsRes, complaintsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/all`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/all`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/complaints/all`, { headers }),
            ]);

            const usersData = await usersRes.json();
            const connectionsData = await connectionsRes.json();
            const billsData = await billsRes.json();
            const complaintsData = await complaintsRes.json();

            setUsers(Array.isArray(usersData) ? usersData : []);
            setConnections(Array.isArray(connectionsData) ? connectionsData : []);
            setBills(Array.isArray(billsData) ? billsData : []);
            setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
        } catch (err) {
            setError('Failed to load system metrics from server.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredUsers = useMemo(() => {
        let result = users;
        if (filterRole !== 'all') result = result.filter(u => u.role === filterRole);
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(u => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term));
        }
        return result;
    }, [users, searchTerm, filterRole]);

    const handleEditRole = async () => {
        if (!selectedUser || !editRole) return;
        if (selectedUser._id === adminId) {
            alert('You cannot change your own role.');
            return;
        }
        const token = getCookie('token');
        if (!token) return alert('Not authenticated');
        setActionLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/change-role/${selectedUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ role: editRole }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed');
            fetchData();
            setShowEditModal(false);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (userId === adminId) {
            alert('You cannot delete your own account.');
            return;
        }
        if (!confirm('Delete this user permanently?')) return;
        const token = getCookie('token');
        if (!token) return alert('Not authenticated');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed');
            fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const getRoleColor = (role: string) => {
        const map: Record<string, string> = {
            admin: 'bg-purple-50 text-purple-700 border-purple-200/60',
            xen: 'bg-blue-50 text-blue-700 border-blue-200/60',
            connection: 'bg-orange-50 text-orange-700 border-orange-200/60',
            billing: 'bg-teal-50 text-teal-700 border-teal-200/60',
            complaint: 'bg-red-50 text-red-700 border-red-200/60',
            consumer: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        };
        return map[role] || 'bg-gray-50 text-gray-700 border-gray-200/60';
    };

    // ---------- CALCULATED ANALYTICS (REAL DATA ONLY) ----------
    const roleDistribution = useMemo(() => {
        const distribution: Record<string, number> = {
            consumer: 0,
            xen: 0,
            connection: 0,
            billing: 0,
            complaint: 0,
            admin: 0
        };
        users.forEach(u => {
            const r = u.role?.toLowerCase();
            if (distribution[r] !== undefined) {
                distribution[r]++;
            } else {
                distribution[r] = (distribution[r] || 0) + 1;
            }
        });
        return Object.entries(distribution).map(([name, value]) => ({
            name: name.toUpperCase(),
            value,
            color: name === 'admin' ? '#8b5cf6' :
                name === 'xen' ? '#3b82f6' :
                    name === 'connection' ? '#f97316' :
                        name === 'billing' ? '#0d9488' :
                            name === 'complaint' ? '#ef4444' : '#10b981'
        }));
    }, [users]);

    const billingMetrics = useMemo(() => {
        let collectedAmount = 0;
        let pendingAmount = 0;
        let paidCount = 0;
        let unpaidCount = 0;

        bills.forEach(b => {
            const amt = b.amount || 0;
            if (b.status === 'paid') {
                collectedAmount += amt;
                paidCount++;
            } else {
                pendingAmount += amt;
                unpaidCount++;
            }
        });

        const totalBills = bills.length;
        const collectionRate = totalBills > 0 ? Math.round((paidCount / totalBills) * 100) : 0;

        return {
            collectedAmount,
            pendingAmount,
            paidCount,
            unpaidCount,
            collectionRate,
            chartData: [
                { name: 'Paid Revenue (৳)', value: collectedAmount, color: '#10b981' },
                { name: 'Pending (৳)', value: pendingAmount, color: '#f59e0b' }
            ]
        };
    }, [bills]);

    const complaintMetrics = useMemo(() => {
        let pending = 0;
        let teamSent = 0;
        let resolved = 0;

        complaints.forEach(c => {
            if (c.status === 'pending') pending++;
            else if (c.status === 'teamSent') teamSent++;
            else if (c.status === 'resolved') resolved++;
        });

        const total = complaints.length;
        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        return {
            pending,
            teamSent,
            resolved,
            resolutionRate,
            chartData: [
                { name: 'Pending', count: pending, fill: '#f59e0b' },
                { name: 'Team Sent', count: teamSent, fill: '#3b82f6' },
                { name: 'Resolved', count: resolved, fill: '#10b981' }
            ]
        };
    }, [complaints]);

    const connectionMetrics = useMemo(() => {
        let pending = 0;
        let active = 0;
        let completed = 0;

        connections.forEach(c => {
            if (c.status === 'forwarded_to_wing') pending++;
            else if (c.status === 'teamAssigned') active++;
            else if (c.status === 'completed' || c.status === 'implemented') completed++;
        });

        return {
            pending,
            active,
            completed,
            chartData: [
                { name: 'Pending', value: pending },
                { name: 'Active Teams', value: active },
                { name: 'Completed', value: completed }
            ]
        };
    }, [connections]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
            <p className="text-sm font-medium text-gray-500">Querying real-time system metrics...</p>
        </div>
    );
    if (error) return (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex items-start gap-4 max-w-2xl mx-auto my-12 shadow-sm">
            <AlertTriangle size={24} className="mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
                <p className="font-bold text-red-900">System Connection Error</p>
                <p className="text-sm text-red-700">{error}</p>
                <button onClick={fetchData} className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5">
                    <RefreshCw size={12} /> Retry Handshake
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Dashboard Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-700/50">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700/40 border border-emerald-600/30 rounded-full text-xs font-semibold tracking-wide text-emerald-200">
                        <ShieldCheck size={14} /> SECURITY CLEARANCE: LEVEL 1 (ADMIN)
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        Administrative Console
                    </h2>
                    <p className="text-emerald-100/80 text-sm max-w-lg">
                        Operational oversight, dynamic role governance, feedback moderation, and financial systems audit.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-3 bg-emerald-800/60 hover:bg-emerald-700/80 border border-emerald-700 text-emerald-100 rounded-2xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 text-sm font-semibold"
                        title="Reload System Datasets"
                    >
                        <RefreshCw size={16} />
                        <span>Sync State</span>
                    </button>
                </div>
            </div>

            {/* High Level Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricDisplayCard
                    icon={<Users size={22} />}
                    label="Total Registered Users"
                    value={users.length}
                    trend={`${roleDistribution.find(r => r.name === 'CONSUMER')?.value || 0} Consumers`}
                    color="from-blue-500/10 to-indigo-500/10 text-indigo-700 border-indigo-100"
                />
                <MetricDisplayCard
                    icon={<Zap size={22} />}
                    label="Active Applications"
                    value={connections.length}
                    trend={`${connectionMetrics.pending} Pending Audit`}
                    color="from-orange-500/10 to-amber-500/10 text-orange-700 border-orange-100"
                />
                <MetricDisplayCard
                    icon={<DollarSign size={22} />}
                    label="Total Revenue Invoiced"
                    value={`৳${(billingMetrics.collectedAmount + billingMetrics.pendingAmount).toLocaleString()}`}
                    trend={`${billingMetrics.collectionRate}% Receipt Rate`}
                    color="from-teal-500/10 to-emerald-500/10 text-emerald-700 border-emerald-100"
                />
                <MetricDisplayCard
                    icon={<AlertTriangle size={22} />}
                    label="Consumer Complaints"
                    value={complaints.length}
                    trend={`${complaintMetrics.resolved} Resolved (${complaintMetrics.resolutionRate}%)`}
                    color="from-rose-500/10 to-red-500/10 text-red-700 border-red-100"
                />
            </div>

            {/* Main Tabs Selection */}
            <div className="flex border-b border-gray-100 gap-2">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3.5 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'overview' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <TrendingUp size={16} />
                    <span>Real-Time Insights</span>
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-3.5 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'users' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <Users size={16} />
                    <span>User Governance</span>
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-3.5 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'reviews' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <MessageSquare size={16} />
                    <span>Feedback Moderation</span>
                    {reviews.length > 0 && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-extrabold shadow-sm">
                            {reviews.length}
                        </span>
                    )}
                </button>
            </div>

            {/* TAB CONTENT 1: SYSTEM OVERVIEW & INSIGHTS */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Charts Grid */}
                    {isMounted ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* User Roles Chart */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                                <div className="space-y-1 mb-6">
                                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                        <Users size={18} className="text-indigo-600" />
                                        User Distribution by Role
                                    </h3>
                                    <p className="text-xs text-gray-400">Quantitative audit of administrative and utility personnel access levels.</p>
                                </div>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={roleDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                                            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
                                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                                {roleDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-50">
                                    {roleDistribution.map((r, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                                            <span className="text-[10px] text-gray-500 font-medium truncate capitalize">{r.name.toLowerCase()}: <strong className="text-gray-700">{r.value}</strong></span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Collections Chart */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                                <div className="space-y-1 mb-6">
                                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                        <DollarSign size={18} className="text-teal-600" />
                                        Financial Revenue Breakdown
                                    </h3>
                                    <p className="text-xs text-gray-400">Comparative representation of collected vs outstanding receivables in Taka (৳).</p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-72">
                                    <div className="h-full w-full sm:w-1/2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={billingMetrics.chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={85}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {billingMetrics.chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => `৳${Number(value).toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-4 w-full sm:w-1/2">
                                        <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100/40">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">Collected Revenue</span>
                                            <p className="text-xl font-black text-emerald-700">৳{billingMetrics.collectedAmount.toLocaleString()}</p>
                                            <p className="text-[10px] text-emerald-600 mt-0.5">{billingMetrics.paidCount} paid invoice items</p>
                                        </div>
                                        <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100/40">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">Outstanding Outstanding</span>
                                            <p className="text-xl font-black text-amber-600">৳{billingMetrics.pendingAmount.toLocaleString()}</p>
                                            <p className="text-[10px] text-amber-600 mt-0.5">{billingMetrics.unpaidCount} unpaid invoice items</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center text-xs text-gray-400 border-t border-gray-50 pt-3">
                                    Overall System Collections Rate: <strong className="text-gray-700">{billingMetrics.collectionRate}%</strong>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-96 flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed text-gray-400">
                            Pre-rendering visualizations...
                        </div>
                    )}

                    {/* Pipelines Overview Table Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Complaints Status Pipe */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <div>
                                <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
                                    <AlertTriangle size={16} className="text-red-500" />
                                    Support Complaint Pipeline
                                </h4>
                                <p className="text-xs text-gray-400 mt-0.5">Real-time status analysis of consumer complaints.</p>
                            </div>
                            <div className="space-y-3 pt-2">
                                <PipelineBar label="Resolved (Closed)" count={complaintMetrics.resolved} total={complaints.length} color="bg-emerald-500" />
                                <PipelineBar label="Support Team Dispatched" count={complaintMetrics.teamSent} total={complaints.length} color="bg-blue-500" />
                                <PipelineBar label="Pending Allocation" count={complaintMetrics.pending} total={complaints.length} color="bg-amber-500" />
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border flex justify-between items-center text-xs">
                                <span className="text-gray-500">Pipeline Resolution Rate:</span>
                                <span className="font-bold text-gray-800">{complaintMetrics.resolutionRate}%</span>
                            </div>
                        </div>

                        {/* Connection Applications Pipe */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <div>
                                <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
                                    <Wrench size={16} className="text-blue-500" />
                                    Grid Connection Applications
                                </h4>
                                <p className="text-xs text-gray-400 mt-0.5">Operational status of grid meter deployment pipeline.</p>
                            </div>
                            <div className="space-y-3 pt-2">
                                <PipelineBar label="Completed & Active Meters" count={connectionMetrics.completed} total={connections.length} color="bg-emerald-500" />
                                <PipelineBar label="Assigned Field Team" count={connectionMetrics.active} total={connections.length} color="bg-indigo-500" />
                                <PipelineBar label="Awaiting Technical Review" count={connectionMetrics.pending} total={connections.length} color="bg-blue-500" />
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border flex justify-between items-center text-xs">
                                <span className="text-gray-500">Deployment Rate:</span>
                                <span className="font-bold text-gray-800">
                                    {connections.length > 0 ? Math.round((connectionMetrics.completed / connections.length) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 2: USER GOVERNANCE & ROLES */}
            {activeTab === 'users' && (
                <div className="space-y-5">
                    {/* Filters & Control bar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:flex-1">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search systems directories by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                                />
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="flex-1 md:flex-initial px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-gray-600"
                                >
                                    <option value="all">All Roles</option>
                                    {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                                </select>
                                <button
                                    onClick={fetchData}
                                    className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100/40 rounded-xl shadow-sm transition-all hover:scale-105"
                                    title="Refresh List"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Users Directory Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Identity</th>
                                        <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Access Clearance</th>
                                        <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date Enrolled</th>
                                        <th className="px-6 py-4.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-medium">
                                                No security profiles match the search parameters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user, idx) => {
                                            const isCurrentAdmin = adminId && user._id === adminId;
                                            return (
                                                <tr key={user._id} className={`hover:bg-emerald-50/20 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}>
                                                    <td className="px-6 py-4.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200/50 flex items-center justify-center text-emerald-800 font-bold shadow-sm">
                                                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-800 leading-normal">{user.name}</p>
                                                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                                    <Mail size={12} />
                                                                    <span>{user.email}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4.5">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize tracking-wide shadow-sm ${getRoleColor(user.role)}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4.5 text-gray-500 text-xs font-medium">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={13} className="text-gray-400" />
                                                            {new Date(user.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4.5">
                                                        <div className="flex justify-center gap-1.5">
                                                            {isCurrentAdmin ? (
                                                                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold shadow-sm select-none border border-emerald-200">Logged Account</span>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => { setSelectedUser(user); setEditRole(user.role); setShowEditModal(true); }}
                                                                        className="p-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-700 border border-gray-100 rounded-xl shadow-sm transition-all hover:scale-105"
                                                                        title="Amend Account Role"
                                                                    >
                                                                        <UserCog size={15} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteUser(user._id)}
                                                                        className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-700 border border-gray-100 rounded-xl shadow-sm transition-all hover:scale-105"
                                                                        title="Decommission Account Profile"
                                                                    >
                                                                        <Trash2 size={15} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 3: CONSUMER FEEDBACK MODERATION */}
            {activeTab === 'reviews' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="space-y-1">
                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <MessageSquare size={18} className="text-emerald-600" />
                                Public Homepage Feedback Moderation
                            </h3>
                            <p className="text-xs text-gray-400">Moderating submitted feedback items displayed on the public landing page.</p>
                        </div>
                        <button
                            onClick={fetchReviews}
                            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100/40 rounded-xl font-semibold text-sm shadow-sm transition-all hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14} className={loadingReviews ? 'animate-spin' : ''} />
                            <span>Sync Reviews</span>
                        </button>
                    </div>

                    {loadingReviews ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-3">
                            <Loader2 className="animate-spin text-emerald-600" size={32} />
                            <p className="text-xs font-semibold text-gray-400">Scanning reviews archive...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center space-y-3 shadow-sm">
                            <MessageSquare size={48} className="mx-auto text-gray-300 opacity-60" />
                            <h4 className="font-bold text-gray-600">No Public Feedback Items</h4>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto">There are currently no reviews active, approved, or flagged for display on the landing page.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {reviews.map((rev) => (
                                <div key={rev._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md hover:border-emerald-100 transition-all">
                                    <div className="space-y-3.5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100">
                                                    Author: {rev.userId?.slice(-6).toUpperCase() || 'EXTERNAL'}
                                                </span>
                                                <p className="text-[10px] text-gray-400 mt-2 font-medium">Complaint Association: <strong className="font-bold text-gray-500">{rev.complaintId}</strong></p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 text-amber-700 text-xs font-bold shadow-sm">
                                                <Star size={12} className="fill-amber-500 text-amber-500" />
                                                <span>{rev.rating} / 5</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 italic border-l-2 border-emerald-600 pl-3.5 py-1 bg-gray-50/50 rounded-r-xl">
                                            “{rev.text || 'No description comments entered.'}”
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-5">
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            System Recorded: {new Date(rev.createdAt).toLocaleDateString('en-BD', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <button
                                            onClick={() => handleHideReview(rev._id)}
                                            disabled={hidingReviewId === rev._id}
                                            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-100/40 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 disabled:opacity-50"
                                            title="Suppress feedback card from public interfaces"
                                        >
                                            {hidingReviewId === rev._id ? (
                                                <Loader2 size={13} className="animate-spin" />
                                            ) : (
                                                <EyeOff size={13} />
                                            )}
                                            <span>Suppress Review</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* EDIT USER SECURITY ACCESS LEVEL MODAL */}
            <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedUser(null); }} title="Amend Account Clearance">
                {selectedUser && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200/50 flex items-center justify-center text-emerald-800 text-lg font-black shadow-sm">
                                {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="font-extrabold text-gray-800">{selectedUser.name}</p>
                                <p className="text-sm text-gray-400 mt-0.5">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-black tracking-wider text-gray-400 uppercase">Assigned Security Profile Clearance</label>
                            <select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                className="w-full border border-gray-100 bg-gray-50 focus:bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold text-gray-700 transition-all focus:outline-none"
                            >
                                {ROLES.map(role => (
                                    <option key={role} value={role} className="capitalize">{role}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
                            <button
                                onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                                className="px-5 py-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 text-sm font-bold text-gray-500 transition-all shadow-sm active:scale-95"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleEditRole}
                                disabled={actionLoading}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
                                <span>{actionLoading ? 'Saving Role Profile...' : 'Authorize Role Profile'}</span>
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

function MetricDisplayCard({ icon, label, value, trend, color }: { icon: React.ReactNode; label: string; value: number | string; trend?: string; color: string }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-3xl font-black text-gray-800">{value}</p>
                </div>
                <div className={`p-3 rounded-2xl border ${color.split(' ')[0]} ${color.split(' ')[1]} ${color.split(' ')[2]}`}>{icon}</div>
            </div>
            {trend && (
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-700 tracking-wider uppercase">{trend}</span>
                </div>
            )}
        </div>
    );
}

function PipelineBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
                <span>{label}</span>
                <span>{count} / {total} ({percentage}%)</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
