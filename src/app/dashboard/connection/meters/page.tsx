// src/app/dashboard/connection/meters/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Search, RefreshCw, ChevronLeft, ChevronRight,
    Eye, X, CheckCircle, Clock, Zap, Filter, Replace, PlusCircle, Package, User, Phone, MapPin
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
    addedByConnectionWing?: boolean;
    status?: string;
    lastReading?: number;
    createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function ConnectionMetersPage() {
    const [meters, setMeters] = useState<Meter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Replace meter states
    const [showReplaceModal, setShowReplaceModal] = useState(false);
    const [replaceOldNumber, setReplaceOldNumber] = useState('');
    const [replaceNewNumber, setReplaceNewNumber] = useState('');
    const [replaceLoading, setReplaceLoading] = useState(false);

    // Add meter states
    const [showAddModal, setShowAddModal] = useState(false);
    const [addMeterNumber, setAddMeterNumber] = useState('');
    const [addConsumerName, setAddConsumerName] = useState('');
    const [addConsumerPhone, setAddConsumerPhone] = useState('');
    const [addConsumerAddress, setAddConsumerAddress] = useState('');
    const [addConsumerType, setAddConsumerType] = useState('residential');
    const [addLastReading, setAddLastReading] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchMeters = async () => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meters/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setMeters(Array.isArray(data) ? data : []);
        } catch {
            setError('Failed to load meters');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMeters(); }, []);

    const filteredMeters = useMemo(() => {
        let result = meters;
        if (filterStatus !== 'all') {
            if (filterStatus === 'claimed') result = result.filter(m => m.claimedBy !== null);
            else if (filterStatus === 'unclaimed') result = result.filter(m => m.claimedBy === null);
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(m =>
                m.meterNumber?.toLowerCase().includes(term) ||
                m.consumerInfo?.name?.toLowerCase().includes(term) ||
                m.consumerInfo?.phone?.includes(term)
            );
        }
        return result;
    }, [meters, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredMeters.length / ITEMS_PER_PAGE);
    const paginatedMeters = filteredMeters.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = useMemo(() => {
        const total = meters.length;
        const claimed = meters.filter(m => m.claimedBy !== null).length;
        const unclaimed = total - claimed;
        return { total, claimed, unclaimed };
    }, [meters]);

    const openDetail = (meter: Meter) => {
        setSelectedMeter(meter);
        setShowDetailModal(true);
    };

    const openReplace = (meter: Meter) => {
        setReplaceOldNumber(meter.meterNumber);
        setReplaceNewNumber('');
        setShowReplaceModal(true);
    };

    // Replace handler
    const handleReplace = async () => {
        if (!replaceOldNumber || !replaceNewNumber) {
            setMessage({ type: 'error', text: 'Both old and new meter numbers are required.' });
            return;
        }
        const token = getCookie('token');
        if (!token) return;
        setReplaceLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meters/replace`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ oldMeterNumber: replaceOldNumber, newMeterNumber: replaceNewNumber }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Replace failed');
            setMessage({ type: 'success', text: 'Meter replaced successfully!' });
            setShowReplaceModal(false);
            setReplaceOldNumber('');
            setReplaceNewNumber('');
            fetchMeters();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setReplaceLoading(false);
        }
    };

    // Add meter handler
    const handleAddMeter = async () => {
        if (!addMeterNumber.trim()) {
            setMessage({ type: 'error', text: 'Meter number is required' });
            return;
        }
        const token = getCookie('token');
        if (!token) return;
        setAddLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consumers/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    meterNumber: addMeterNumber,
                    name: addConsumerName,
                    phone: addConsumerPhone,
                    address: addConsumerAddress,
                    consumerType: addConsumerType,
                    lastReading: Number(addLastReading) || 0,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to add meter');
            setMessage({ type: 'success', text: 'Meter added successfully!' });
            setShowAddModal(false);
            resetAddForm();
            fetchMeters();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setAddLoading(false);
        }
    };

    const resetAddForm = () => {
        setAddMeterNumber('');
        setAddConsumerName('');
        setAddConsumerPhone('');
        setAddConsumerAddress('');
        setAddConsumerType('residential');
        setAddLastReading('');
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
                            <Zap size={28} className="text-emerald-600" />
                        </div>
                        Meters Management
                    </h2>
                    <p className="text-gray-500 mt-1 ml-14">Add, view, replace all electricity meters</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                    >
                        <PlusCircle size={16} />
                        Add New Meter
                    </button>
                    <button onClick={fetchMeters} className="p-2.5 rounded-xl border border-gray-200 hover:bg-emerald-50 transition-colors">
                        <RefreshCw size={18} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} className="text-green-600" /> : <X size={20} className="text-red-600" />}
                    <p className="text-sm text-gray-700">{message.text}</p>
                    <button onClick={() => setMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<Zap size={24} />} label="Total Meters" value={stats.total} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<CheckCircle size={24} />} label="Claimed" value={stats.claimed} color="bg-green-100 text-green-600" />
                <StatCard icon={<Clock size={24} />} label="Unclaimed" value={stats.unclaimed} color="bg-yellow-100 text-yellow-600" />
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by meter number, consumer name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                        />
                    </div>
                    <div className="relative">
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">All Meters</option>
                            <option value="claimed">Claimed</option>
                            <option value="unclaimed">Unclaimed</option>
                        </select>
                    </div>
                    <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                        <RefreshCw size={16} /> Reset
                    </button>
                </div>
            </div>

            {/* Meters Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Meter #</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consumer</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Reading</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedMeters.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Zap size={32} className="opacity-30" />
                                            <p>No meters found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedMeters.map((meter, idx) => (
                                    <tr key={meter._id} className={`hover:bg-emerald-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                        <td className="px-6 py-4 font-mono text-gray-700 font-medium">
                                            {meter.meterNumber}
                                            {meter.status === 'inactive' && (
                                                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">Inactive</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {meter.consumerInfo?.name ? (
                                                <div>
                                                    <p className="font-medium text-gray-800">{meter.consumerInfo.name}</p>
                                                    <p className="text-xs text-gray-400">{meter.consumerInfo.phone || ''}</p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-medium">
                                            {meter.lastReading !== undefined ? `${meter.lastReading} kWh` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meter.claimedBy ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {meter.claimedBy ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                {meter.claimedBy ? 'Claimed' : 'Unclaimed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => openDetail(meter)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600" title="View Details">
                                                    <Eye size={18} />
                                                </button>
                                                <button onClick={() => openReplace(meter)} className="p-2 rounded-lg hover:bg-indigo-100 text-gray-500 hover:text-indigo-600" title="Replace Meter">
                                                    <Replace size={18} />
                                                </button>
                                            </div>
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
                            Page {currentPage} of {totalPages} ({filteredMeters.length} meters)
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
            {showDetailModal && selectedMeter && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Meter Details</h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Meter Number</span><span className="font-mono font-medium">{selectedMeter.meterNumber}</span></div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selectedMeter.claimedBy ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {selectedMeter.claimedBy ? 'Claimed' : 'Unclaimed'}
                                </span>
                            </div>
                            {selectedMeter.consumerInfo && (
                                <>
                                    <div className="flex justify-between"><span className="text-gray-500">Consumer Name</span><span>{selectedMeter.consumerInfo.name || '-'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{selectedMeter.consumerInfo.phone || '-'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Address</span><span>{selectedMeter.consumerInfo.address || '-'}</span></div>
                                </>
                            )}
                            <div className="flex justify-between"><span className="text-gray-500">Last Reading</span><span>{selectedMeter.lastReading !== undefined ? `${selectedMeter.lastReading} kWh` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Added On</span><span>{new Date(selectedMeter.createdAt).toLocaleString()}</span></div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Replace Meter Modal */}
            {showReplaceModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Replace Meter</h3>
                            <button onClick={() => setShowReplaceModal(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <label className="block text-sm font-medium mb-2">Old Meter Number</label>
                        <input type="text" value={replaceOldNumber} className="w-full border rounded-lg px-3 py-2.5 mb-4 bg-gray-100" disabled />
                        <label className="block text-sm font-medium mb-2">New Meter Number</label>
                        <input type="text" value={replaceNewNumber} onChange={(e) => setReplaceNewNumber(e.target.value)} className="w-full border rounded-lg px-3 py-2.5 mb-4" placeholder="e.g., METER-002" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowReplaceModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={handleReplace} disabled={replaceLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                                {replaceLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                Replace
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add New Meter Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-6 border border-gray-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <PlusCircle size={20} className="text-emerald-600" />
                                Add New Meter
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meter Number <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Package size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <input type="text" value={addMeterNumber} onChange={(e) => setAddMeterNumber(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Consumer Type</label>
                                <select value={addConsumerType} onChange={(e) => setAddConsumerType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="industrial">Industrial</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Consumer Name</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <input type="text" value={addConsumerName} onChange={(e) => setAddConsumerName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <input type="tel" value={addConsumerPhone} onChange={(e) => setAddConsumerPhone(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <textarea value={addConsumerAddress} onChange={(e) => setAddConsumerAddress(e.target.value)} rows={2} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Month Reading (kWh)</label>
                                <input
                                    type="number"
                                    value={addLastReading}
                                    onChange={(e) => setAddLastReading(e.target.value)}
                                    placeholder="Previous reading"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">This will be used as previous reading when generating first bill</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={handleAddMeter} disabled={addLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                                {addLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                Add Meter
                            </button>
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