// src/app/dashboard/billing/generate-bills/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, Search, RefreshCw, ChevronLeft, ChevronRight,
    PlusCircle, Calculator, CheckCircle, AlertCircle, X, Zap
} from 'lucide-react';

interface Consumer {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
    meterNumber?: string;
    consumerType?: string;
    role: string;
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
    const [consumers, setConsumers] = useState<Consumer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Generate bill modal
    const [showModal, setShowModal] = useState(false);
    const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
    const [prevReading, setPrevReading] = useState(0);
    const [currReading, setCurrReading] = useState(0);
    const [preview, setPreview] = useState<BillPreview | null>(null);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchConsumers = async () => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consumers/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setConsumers(Array.isArray(data) ? data : []);
        } catch {
            setError('Failed to load consumers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchConsumers(); }, []);

    const filteredConsumers = useMemo(() => {
        if (!searchTerm.trim()) return consumers;
        const term = searchTerm.toLowerCase();
        return consumers.filter(c =>
            c.name?.toLowerCase().includes(term) ||
            c.meterNumber?.toLowerCase().includes(term) ||
            c.email?.toLowerCase().includes(term) ||
            c.mobile?.includes(term)
        );
    }, [consumers, searchTerm]);

    const totalPages = Math.ceil(filteredConsumers.length / ITEMS_PER_PAGE);
    const paginatedConsumers = filteredConsumers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const openModal = async (consumer: Consumer) => {
        setSelectedConsumer(consumer);
        setCurrReading(0);
        setPreview(null);
        setMessage(null);
        setShowModal(true);

        // Fetch last reading
        const token = getCookie('token');
        if (!token || !consumer.meterNumber) {
            setPrevReading(0);
            return;
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/last/${consumer.meterNumber}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setPrevReading(data?.currReading || 0);
        } catch {
            setPrevReading(0);
        }
    };

    const calculatePreview = () => {
        if (!selectedConsumer) return;
        const units = Math.max(0, currReading - prevReading);
        const type = selectedConsumer.consumerType || 'residential';
        const rates: Record<string, number> = {
            residential: 5,
            commercial: 10,
            industrial: 15,
        };
        const rate = rates[type] || 5;
        const amount = units * rate;

        setPreview({
            meterNumber: selectedConsumer.meterNumber || '',
            consumerName: selectedConsumer.name || '',
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
        if (!selectedConsumer || !preview) return;
        const token = getCookie('token');
        if (!token) { setMessage({ type: 'error', text: 'Not authenticated' }); return; }
        setGenerating(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    meterNumber: selectedConsumer.meterNumber,
                    consumerType: selectedConsumer.consumerType || 'residential',
                    prevReading: preview.prevReading,
                    currReading: preview.currReading,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Generation failed');
            setMessage({ type: 'success', text: `Bill generated! Amount: ৳${preview.amount.toLocaleString()}` });
            setTimeout(() => {
                setShowModal(false);
                setMessage(null);
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
                    <p className="text-gray-500 mt-1 ml-14">Select a consumer and enter meter reading to create a bill</p>
                </div>
                <button onClick={fetchConsumers} className="p-2.5 rounded-xl border hover:bg-emerald-50"><RefreshCw size={18} className="text-gray-600" /></button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, meter number, email, mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            {/* Consumers Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Consumer</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Meter #</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {paginatedConsumers.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400">No consumers found</td></tr>
                        ) : (
                            paginatedConsumers.map((c, idx) => (
                                <tr key={c._id} className={`hover:bg-emerald-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <span className="text-sm font-semibold text-emerald-700">{c.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                            </div>
                                            <span className="font-medium">{c.name || 'Unnamed'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono">{c.meterNumber || '-'}</td>
                                    <td className="px-6 py-4 capitalize">{c.consumerType || 'residential'}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{c.mobile || c.email || '-'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => openModal(c)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700">
                                            <PlusCircle size={14} /> Generate Bill
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t flex items-center justify-between text-sm">
                        <span>Page {currentPage} of {totalPages}</span>
                        <div className="flex gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100"><ChevronLeft size={18} /></button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100'}`}>{page}</button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-100"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Generate Modal */}
            {showModal && selectedConsumer && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Calculator size={20} className="text-emerald-600" /> Generate Bill</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-medium">{selectedConsumer.name || selectedConsumer.email}</p>
                                <p className="text-xs text-gray-500">Meter: {selectedConsumer.meterNumber} | Type: {selectedConsumer.consumerType || 'residential'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Previous Reading (kWh)</label>
                                    <input type="number" value={prevReading} onChange={e => setPrevReading(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2.5 bg-gray-50" disabled />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Current Reading (kWh)</label>
                                    <input type="number" value={currReading} onChange={e => setCurrReading(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500" min={prevReading} />
                                </div>
                            </div>

                            {preview && (
                                <div className="bg-emerald-50 rounded-lg p-4 space-y-2">
                                    <h4 className="font-semibold text-emerald-800">Bill Preview</h4>
                                    <div className="flex justify-between text-sm"><span>Units</span><span>{preview.units} kWh</span></div>
                                    <div className="flex justify-between text-sm"><span>Rate</span><span>৳{preview.rate}/kWh</span></div>
                                    <div className="flex justify-between font-bold text-emerald-700 border-t border-emerald-200 pt-2"><span>Total</span><span>৳{preview.amount.toLocaleString()}</span></div>
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
                                    {generating ? 'Generating...' : 'Generate Bill'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}