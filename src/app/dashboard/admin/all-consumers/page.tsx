// src/app/dashboard/admin/all-consumers/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Users, Search, RefreshCw, AlertCircle,
    Grid, List, Mail, Phone, CalendarDays, Hash, Sparkles,
    ShieldCheck, Filter
} from 'lucide-react';

export default function AdminAllConsumers() {
    const [consumers, setConsumers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [filterMeter, setFilterMeter] = useState<'all' | 'with' | 'without'>('all');

    const fetchData = () => {
        setLoading(true);
        setError('');
        const token = getCookie('token');
        if (!token) {
            setError('Authorization token missing. Please sign in.');
            setLoading(false);
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/consumers/all`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setConsumers(Array.isArray(data) ? data : []))
            .catch(() => setError('Failed to communicate with WZPDCL database service.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter and Search logic
    const filteredConsumers = useMemo(() => {
        return consumers.filter(c => {
            const matchesSearch =
                (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.mobile || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.meterNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

            const hasMeter = !!c.meterNumber;
            if (filterMeter === 'with') return matchesSearch && hasMeter;
            if (filterMeter === 'without') return matchesSearch && !hasMeter;
            return matchesSearch;
        });
    }, [consumers, searchTerm, filterMeter]);

    const stats = useMemo(() => {
        const total = consumers.length;
        const withMeter = consumers.filter(c => c.meterNumber).length;
        const withoutMeter = total - withMeter;
        return { total, withMeter, withoutMeter };
    }, [consumers]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
                <p className="text-sm font-medium text-gray-500">Querying registered consumer directories...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex items-start gap-4 max-w-2xl mx-auto my-12 shadow-sm animate-in fade-in">
                <AlertCircle size={24} className="mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                    <p className="font-bold text-red-900">Database Handshake Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                    <button onClick={fetchData} className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5">
                        <RefreshCw size={12} /> Retry Handshake
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header Card */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-700/50">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700/40 border border-emerald-600/30 rounded-full text-xs font-semibold tracking-wide text-emerald-200">
                        <ShieldCheck size={14} /> SECURITY CLEARANCE: LEVEL 1 (ADMIN)
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2">
                        Consumer Directory
                    </h2>
                    <p className="text-emerald-100/80 text-sm max-w-xl">
                        A real-time overview of all registered consumers on the WZPDCL billing platform. Manage utility meters, verification credentials, and user profiles.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-3 bg-emerald-800/60 hover:bg-emerald-700/80 border border-emerald-700 text-emerald-100 rounded-2xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 text-sm font-semibold"
                        title="Reload consumers database"
                    >
                        <RefreshCw size={16} />
                        <span>Sync Directory</span>
                    </button>
                </div>
            </div>

            {/* Micro Statistics Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Registered Consumers</p>
                        <p className="text-2xl font-black text-gray-800">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                        <Hash size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Meters Deployed</p>
                        <p className="text-2xl font-black text-gray-800">{stats.withMeter}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Awaiting Meter Assignment</p>
                        <p className="text-2xl font-black text-gray-800">{stats.withoutMeter}</p>
                    </div>
                </div>
            </div>

            {/* Filter and View Toggles Bar */}
            <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search consumers by name, email, phone or meter ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                        <Filter size={14} className="text-gray-400" />
                        <select
                            value={filterMeter}
                            onChange={(e) => setFilterMeter(e.target.value as any)}
                            className="bg-transparent border-none text-xs font-semibold focus:outline-none text-gray-600 cursor-pointer"
                        >
                            <option value="all">All Meters</option>
                            <option value="with">Deployed Only</option>
                            <option value="without">Awaiting Decommission</option>
                        </select>
                    </div>

                    <div className="flex border border-gray-100 p-1 bg-gray-50 rounded-xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Grid layout"
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Table layout"
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* List/Grid View */}
            {filteredConsumers.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center space-y-3 shadow-sm">
                    <Users size={48} className="mx-auto text-gray-300 opacity-60 animate-bounce" />
                    <h4 className="font-bold text-gray-700 text-lg">No Consumers Found</h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">There are no customer profiles that match your search query or meter deployment filters.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredConsumers.map((c, idx) => (
                        <div
                            key={c._id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100/60 p-5 flex flex-col justify-between transition-all group relative overflow-hidden"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform">
                                        {c.name?.charAt(0)?.toUpperCase() || 'C'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-gray-800 group-hover:text-emerald-900 transition-colors truncate">{c.name || 'Unnamed Consumer'}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                                            <Mail size={12} className="flex-shrink-0" />
                                            <span className="truncate">{c.email || 'No email available'}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-gray-50 pt-3 text-xs text-gray-500">
                                    {c.mobile && (
                                        <div className="flex items-center gap-2">
                                            <Phone size={13} className="text-gray-400" />
                                            <span>{c.mobile}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <CalendarDays size={13} className="text-gray-400" />
                                        <span>Joined: {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-50/50 flex items-center justify-between">
                                <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-100 tracking-wider uppercase">
                                    {c.role || 'consumer'}
                                </span>
                                {c.meterNumber ? (
                                    <span className="inline-flex px-2.5 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-mono font-bold rounded-full border border-blue-100">
                                        Meter: {c.meterNumber}
                                    </span>
                                ) : (
                                    <span className="inline-flex px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-medium rounded-full border border-amber-100">
                                        Pending Meter
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Consumer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Enrolled</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Meter Allocation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredConsumers.map((c, idx) => (
                                    <tr key={c._id} className="hover:bg-emerald-50/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 font-bold text-xs shadow-sm">
                                                    {c.name?.charAt(0)?.toUpperCase() || 'C'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{c.name || 'Unnamed'}</p>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded uppercase font-bold tracking-wider">
                                                        {c.role || 'consumer'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-700 text-xs font-medium">{c.email || '-'}</p>
                                            <p className="text-gray-400 text-[11px] mt-0.5">{c.mobile || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.meterNumber ? (
                                                <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-mono font-bold rounded-lg border border-blue-100">
                                                    {c.meterNumber}
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2 py-0.5 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg border border-amber-100">
                                                    Awaiting Setup
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
