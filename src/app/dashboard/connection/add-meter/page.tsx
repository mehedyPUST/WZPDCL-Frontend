// src/app/dashboard/connection/add-meter/page.tsx
'use client';

import { useState } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, PlusCircle, CheckCircle, AlertCircle, X, Zap, Package, User, Phone, MapPin
} from 'lucide-react';

export default function AddMeterPage() {
    const [meterNumber, setMeterNumber] = useState('');
    const [consumerName, setConsumerName] = useState('');
    const [consumerPhone, setConsumerPhone] = useState('');
    const [consumerAddress, setConsumerAddress] = useState('');
    const [consumerType, setConsumerType] = useState('residential');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!meterNumber.trim()) {
            setMessage({ type: 'error', text: 'Meter number is required' });
            return;
        }
        const token = getCookie('token');
        if (!token) { setMessage({ type: 'error', text: 'Not authenticated' }); return; }
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consumers/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    meterNumber,
                    name: consumerName,
                    phone: consumerPhone,
                    address: consumerAddress,
                    consumerType,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to add meter');
            setMessage({ type: 'success', text: 'Meter and consumer added successfully!' });
            // Reset form
            setMeterNumber('');
            setConsumerName('');
            setConsumerPhone('');
            setConsumerAddress('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div>
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                        <PlusCircle size={28} className="text-emerald-600" />
                    </div>
                    Add New Meter (Unregistered Consumer)
                </h2>
                <p className="text-gray-500 mt-1 ml-14">Add a meter and consumer details for billing</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} className="text-green-600 mt-0.5" /> : <AlertCircle size={20} className="text-red-600 mt-0.5" />}
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{message.text}</p>
                    <button onClick={() => setMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Meter Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meter Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Package size={18} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={meterNumber}
                                onChange={(e) => setMeterNumber(e.target.value)}
                                placeholder="e.g., METER-001"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Consumer Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Consumer Type</label>
                        <select
                            value={consumerType}
                            onChange={(e) => setConsumerType(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                        </select>
                    </div>

                    {/* Consumer Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Consumer Name (optional)</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={consumerName}
                                onChange={(e) => setConsumerName(e.target.value)}
                                placeholder="Full name"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (optional)</label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="tel"
                                value={consumerPhone}
                                onChange={(e) => setConsumerPhone(e.target.value)}
                                placeholder="01XXXXXXXXX"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Address (full width) */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address (optional)</label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                            <textarea
                                value={consumerAddress}
                                onChange={(e) => setConsumerAddress(e.target.value)}
                                rows={3}
                                placeholder="House, Road, Village, District"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                        {loading ? 'Adding...' : 'Add Meter & Consumer'}
                    </button>
                </div>
            </form>
        </div>
    );
}