// src/app/dashboard/billing/all-consumers/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Users, Search, RefreshCw, ChevronLeft, ChevronRight,
    Eye, X, Zap, Filter, Phone, MapPin
} from 'lucide-react';

interface Meter {
    _id: string;
    meterNumber: string;
    claimedBy: string | null;
    consumerInfo?: {
        name: string;
        address: string;
        phone: string;
    };
    consumerType?: string;
    status?: string;
    lastReading?: number;
    createdAt: string;
}

interface Consumer {
    name: string;
    phone: string;
    address: string;
    meters: Meter[];
    totalMeters: number;
    activeMeters: number;
}

const ITEMS_PER_PAGE = 10;

export default function AllConsumersPage() {
    const [meters, setMeters] = useState<Meter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const fetchMeters = async () => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meters/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setMeters(Array.isArray(data) ? data.filter((m: Meter) => m.status !== 'inactive') : []);
        } catch {
            setError('Failed to load meters');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMeters(); }, []);

    // Group meters by consumer (name + phone as unique key)
    const consumers = useMemo(() => {
        const map: Record<string, Consumer> = {};

        meters.forEach(meter => {
            const name = meter.consumerInfo?.name || 'Unregistered';
            const phone = meter.consumerInfo?.phone || 'N/A';
            const key = `${name}__${phone}`;

            if (!map[key]) {
                map[key] = {
                    name,
                    phone,
                    address: meter.consumerInfo?.address || 'N/A',
                    meters: [],
                    totalMeters: 0,
                    activeMeters: 0,
                };
            }

            map[key].meters.push(meter);
            map[key].totalMeters += 1;
            if (meter.status !== 'inactive') {
                map[key].activeMeters += 1;
            }
        });

        return Object.values(map);
    }, [meters]);

    const filteredConsumers = useMemo(() => {
        let result = consumers;
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.phone.includes(term) ||
                c.address.toLowerCase().includes(term) ||
                c.meters.some(m => m.meterNumber.toLowerCase().includes(term))
            );
        }
        if (filterType !== 'all') {
            if (filterType === 'residential') {
                result = result.filter(c => c.meters.some(m => m.consumerType === 'residential'));
            } else if (filterType === 'commercial') {
                result = result.filter(c => c.meters.some(m => m.consumerType === 'commercial'));
            } else if (filterType === 'industrial') {
                result = result.filter(c => c.meters.some(m => m.consumerType === 'industrial'));
            }
        }
        return result;
    }, [consumers, searchTerm, filterType]);

    const totalPages = Math.ceil(filteredConsumers.length / ITEMS_PER_PAGE);
    const paginatedConsumers = filteredConsumers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = useMemo(() => {
        return {
            totalConsumers: consumers.length,
            totalMeters: meters.length,
            activeMeters: meters.filter(m => m.status !== 'inactive').length,
        };
    }, [consumers, meters]);

    const openDetail = (consumer: Consumer) => {
        setSelectedConsumer(consumer);
        setShowDetailModal(true);
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;
    if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <Users size={28} className="text-emerald-600" />
                        </div>
                        All Consumers
                    </h2>
                    <p className="text-gray-500 mt-1 ml-14">Consumers grouped by meter — one consumer may have multiple meters</p>
                </div>
                <button onClick={fetchMeters} className="p-2.5 rounded-xl border border-gray-200 hover:bg-emerald-50 transition-colors">
                    <RefreshCw size={18} className="text-gray-600" />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<Users size={24} />} label="Total Consumers" value={stats.totalConsumers} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<Zap size={24} />} label="Total Meters" value={stats.totalMeters} color="bg-purple-100 text-purple-600" />
                <StatCard icon={<Zap size={24} />} label="Active Meters" value={stats.activeMeters} color="bg-green-100 text-green-600" />
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by consumer name, phone, address, or meter number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                        />
                    </div>
                    <div className="relative">
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">All Types</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                        </select>
                    </div>
                    <button onClick={() => { setSearchTerm(''); setFilterType('all'); }} className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                        <RefreshCw size={16} /> Reset
                    </button>
                </div>
            </div>

            {/* Consumers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consumer</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Meters</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedConsumers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users size={32} className="opacity-30" />
                                            <p>No consumers found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedConsumers.map((consumer, idx) => (
                                    <tr key={`${consumer.name}-${consumer.phone}`} className={`hover:bg-emerald-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-emerald-700">
                                                        {consumer.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-800">{consumer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Phone size={14} className="text-gray-400" />
                                                <span>{consumer.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                {consumer.totalMeters} meter{consumer.totalMeters > 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${consumer.activeMeters > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {consumer.activeMeters} active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => openDetail(consumer)}
                                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors"
                                                title="View Meters"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages} ({filteredConsumers.length} consumers)
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

            {/* Detail Modal - Consumer's Meters */}
            {showDetailModal && selectedConsumer && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{selectedConsumer.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Phone size={14} /> {selectedConsumer.phone} · <MapPin size={14} /> {selectedConsumer.address}
                                </p>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-700 text-sm">Meters ({selectedConsumer.totalMeters})</h4>
                            <div className="border rounded-lg divide-y">
                                {selectedConsumer.meters.map(meter => (
                                    <div key={meter._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <Zap size={14} className="text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-mono font-medium text-gray-800">{meter.meterNumber}</p>
                                                <p className="text-xs text-gray-400 capitalize">{meter.consumerType || 'residential'} · Last: {meter.lastReading || 0} kWh</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${meter.status === 'inactive' ? 'bg-red-100 text-red-600' :
                                                meter.claimedBy ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {meter.status === 'inactive' ? 'Inactive' : meter.claimedBy ? 'Claimed' : 'Unclaimed'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
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