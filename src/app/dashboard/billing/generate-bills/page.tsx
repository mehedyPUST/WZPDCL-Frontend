'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Search, RefreshCw, ChevronLeft, ChevronRight,
    PlusCircle, Calculator, CheckCircle, AlertCircle, X, Zap, Package, Clock, Calendar
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

interface BillPreview {
    meterNumber: string;
    consumerName: string;
    consumerType: string;
    prevReading: number;
    currReading: number;
    units: number;
    rate: number;
    amount: number;
}

const ITEMS_PER_PAGE = 10;

export default function GenerateBillsPage() {
    const [meters, setMeters] = useState<Meter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
    const [prevReading, setPrevReading] = useState(0);
    const [currReading, setCurrReading] = useState(0);
    const [preview, setPreview] = useState<BillPreview | null>(null);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // ✅ বিলিং মাস
    const [billingMonth, setBillingMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

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
        if (!searchTerm.trim()) return meters;
        const term = searchTerm.toLowerCase();
        return meters.filter(m =>
            m.meterNumber?.toLowerCase().includes(term) ||
            m.consumerInfo?.name?.toLowerCase().includes(term) ||
            m.consumerInfo?.phone?.includes(term) ||
            (m.consumerType || '')?.toLowerCase().includes(term)
        );
    }, [meters, searchTerm]);

    const totalPages = Math.ceil(filteredMeters.length / ITEMS_PER_PAGE);
    const paginatedMeters = filteredMeters.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = useMemo(() => {
        const total = meters.length;
        const assigned = meters.filter(m => m.claimedBy !== null).length;
        const unassigned = total - assigned;
        return { total, assigned, unassigned };
    }, [meters]);

    const openModal = (meter: Meter) => {
        setSelectedMeter(meter);
        setPrevReading(meter.lastReading || 0);
        setCurrReading(0);
        setPreview(null);
        setMessage(null);
        setShowModal(true);
    };

    const calculatePreview = () => {
        if (!selectedMeter) return;
        const units = Math.max(0, currReading - prevReading);
        const type = selectedMeter.consumerType || 'residential';
        const rates: Record<string, number> = {
            residential: 5,
            commercial: 10,
            industrial: 15,
        };
        const rate = rates[type] || 5;
        const amount = units * rate;

        setPreview({
            meterNumber: selectedMeter.meterNumber || '',
            consumerName: selectedMeter.consumerInfo?.name || 'Unregistered Consumer',
            consumerType: type,
            prevReading,
            currReading,
            units,
            rate,
            amount,
        });
    };

    useEffect(() => {
        if (currReading >= 0 && prevReading >= 0) calculatePreview();
    }, [currReading, prevReading]);

    const handleGenerate = async () => {
        if (!selectedMeter || !preview || currReading <= prevReading) {
            setMessage({ type: 'error', text: 'Current reading must be greater than previous reading.' });
            return;
        }
        const token = getCookie('token');
        if (!token) { setMessage({ type: 'error', text: 'Not authenticated' }); return; }
        setGenerating(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    meterNumber: selectedMeter.meterNumber,
                    consumerType: selectedMeter.consumerType || 'residential',
                    prevReading: preview.prevReading,
                    currReading: preview.currReading,
                    billingMonth,          // ✅ পাঠানো হচ্ছে
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Generation failed');
            setMessage({ type: 'success', text: `Bill generated! Amount: ৳${preview.amount.toLocaleString()}` });
            setPrevReading(preview.currReading);
            setCurrReading(0);
            setPreview(null);
            setTimeout(() => {
                setShowModal(false);
                setMessage(null);
                fetchMeters();
            }, 2000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;
    if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl"><PlusCircle size={28} className="text-emerald-600" /></div>
                        Generate Bills
                    </h2>
                    <p className="text-gray-500 mt-1 ml-14">Create bills for all meters — one bill per meter per month</p>
                </div>
                <button onClick={fetchMeters} className="p-2.5 rounded-xl border hover:bg-emerald-50"><RefreshCw size={18} className="text-gray-600" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<Package size={24} />} label="Total Meters" value={stats.total} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<CheckCircle size={24} />} label="Assigned (Claimed)" value={stats.assigned} color="bg-green-100 text-green-600" />
                <StatCard icon={<Clock size={24} />} label="Unassigned" value={stats.unassigned} color="bg-yellow-100 text-yellow-600" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search by meter number, consumer name, phone, or type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Meter #</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Consumer</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Last Reading</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {paginatedMeters.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                                <div className="flex flex-col items-center gap-2">
                                    <Package size={32} className="opacity-30" />
                                    <p>No meters found</p>
                                    <p className="text-xs">Add meters from Connection Wing → Meters Management</p>
                                </div>
                            </td></tr>
                        ) : (
                            paginatedMeters.map((meter, idx) => (
                                <tr key={meter._id} className={`hover:bg-emerald-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                    <td className="px-6 py-4 font-mono font-medium">{meter.meterNumber}</td>
                                    <td className="px-6 py-4">{meter.consumerInfo?.name || <span className="text-gray-400">Unregistered</span>}</td>
                                    <td className="px-6 py-4 capitalize">{meter.consumerType || 'residential'}</td>
                                    <td className="px-6 py-4">{meter.lastReading !== undefined ? `${meter.lastReading} kWh` : '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meter.claimedBy ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {meter.claimedBy ? <CheckCircle size={14} /> : <Clock size={14} />}
                                            {meter.claimedBy ? 'Assigned' : 'Unassigned'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => openModal(meter)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 flex items-center gap-1 mx-auto">
                                            <Calculator size={14} /> Generate Bill
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t flex items-center justify-between text-sm">
                        <span>Page {currentPage} of {totalPages} ({filteredMeters.length} meters)</span>
                        <div className="flex gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100"><ChevronLeft size={18} /></button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded text-sm ${currentPage === page ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100'}`}>{page}</button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-100"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Generate Modal */}
            {showModal && selectedMeter && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Calculator size={20} className="text-emerald-600" /> Generate Bill</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-medium">{selectedMeter.consumerInfo?.name || 'Unregistered Consumer'}</p>
                                <p className="text-xs text-gray-500">Meter: {selectedMeter.meterNumber} | Type: {selectedMeter.consumerType || 'residential'}</p>
                            </div>

                            {/* ✅ বিলিং মাস সিলেক্টর */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Billing Month</label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="month"
                                        value={billingMonth}
                                        onChange={(e) => setBillingMonth(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Only one bill allowed per meter per month</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Previous Reading (kWh)</label>
                                    <input type="number" value={prevReading} onChange={e => setPrevReading(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2.5 bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Current Reading (kWh)</label>
                                    <input type="number" value={currReading} onChange={e => setCurrReading(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500" min={prevReading} />
                                </div>
                            </div>

                            {preview && (
                                <div className="bg-emerald-50 rounded-lg p-4 space-y-2">
                                    <h4 className="font-semibold text-emerald-800">Bill Preview</h4>
                                    <div className="flex justify-between text-sm"><span>Units Consumed</span><span>{preview.units} kWh</span></div>
                                    <div className="flex justify-between text-sm"><span>Rate</span><span>৳{preview.rate}/kWh</span></div>
                                    <div className="flex justify-between font-bold text-emerald-700 border-t border-emerald-200 pt-2"><span>Total Amount</span><span>৳{preview.amount.toLocaleString()}</span></div>
                                </div>
                            )}

                            {message && (
                                <div className={`p-3 rounded-lg flex items-start gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    <p className="text-sm">{message.text}</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button onClick={handleGenerate} disabled={generating || !preview || currReading <= prevReading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                                    {generating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                    {generating ? 'Generating...' : `Generate Bill (৳${preview?.amount?.toLocaleString() || '0'})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-5 border flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}