// src/app/dashboard/billing/all-consumers/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Users, Search, RefreshCw, ChevronLeft, ChevronRight,
    Eye, X, User, Mail, Phone, MapPin, Hash
} from 'lucide-react';

interface Consumer {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
    address?: string;
    nid?: string;
    role: string;
    meterNumber?: string;
    consumerType?: string;
    createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function AllConsumersPage() {
    const [consumers, setConsumers] = useState<Consumer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const fetchConsumers = async () => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consumers/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setConsumers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to load consumers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchConsumers(); }, []);

    const filteredConsumers = useMemo(() => {
        let result = consumers;
        if (filterType !== 'all') {
            result = result.filter(c => c.role === filterType || c.consumerType === filterType);
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.name?.toLowerCase().includes(term) ||
                c.email?.toLowerCase().includes(term) ||
                c.mobile?.includes(term) ||
                c.meterNumber?.includes(term) ||
                c.address?.toLowerCase().includes(term)
            );
        }
        return result;
    }, [consumers, searchTerm, filterType]);

    const totalPages = Math.ceil(filteredConsumers.length / ITEMS_PER_PAGE);
    const paginatedConsumers = filteredConsumers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = useMemo(() => {
        const total = consumers.length;
        const registered = consumers.filter(c => c.role === 'consumer' || c.email).length;
        const unregistered = total - registered;
        return { total, registered, unregistered };
    }, [consumers]);

    const openDetail = (consumer: Consumer) => {
        setSelectedConsumer(consumer);
        setShowDetailModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 size={48} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>
        );
    }

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
                    <p className="text-gray-500 mt-1 ml-14">Complete list of registered & unregistered consumers</p>
                </div>
                <button onClick={fetchConsumers} className="p-2.5 rounded-xl border border-gray-200 hover:bg-emerald-50 transition-colors">
                    <RefreshCw size={18} className="text-gray-600" />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<Users size={24} />} label="Total Consumers" value={stats.total} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<User size={24} />} label="Registered" value={stats.registered} color="bg-green-100 text-green-600" />
                <StatCard icon={<Hash size={24} />} label="Unregistered (Meter-only)" value={stats.unregistered} color="bg-yellow-100 text-yellow-600" />
            </div>

            {/* Filter & Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, mobile, meter number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                    >
                        <option value="all">All Types</option>
                        <option value="consumer">Registered Consumer</option>
                        <option value="unregistered">Unregistered</option>
                    </select>
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email / Mobile</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Meter</th>
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
                                    <tr key={consumer._id} className={`hover:bg-emerald-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-emerald-700">
                                                        {consumer.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-800">{consumer.name || 'Unnamed'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {consumer.email || consumer.mobile || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${consumer.role === 'consumer' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {consumer.role || 'unregistered'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-700">{consumer.meterNumber || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => openDetail(consumer)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors">
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

            {/* Detail Modal */}
            {showDetailModal && selectedConsumer && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Consumer Details</h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{selectedConsumer.name || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{selectedConsumer.email || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Mobile</span><span>{selectedConsumer.mobile || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">NID</span><span>{selectedConsumer.nid || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="capitalize">{selectedConsumer.role || 'unregistered'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Meter Number</span><span className="font-mono">{selectedConsumer.meterNumber || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Address</span><span>{selectedConsumer.address || '-'}</span></div>
                            {selectedConsumer.createdAt && (
                                <div className="flex justify-between"><span className="text-gray-500">Registered At</span><span>{new Date(selectedConsumer.createdAt).toLocaleString()}</span></div>
                            )}
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