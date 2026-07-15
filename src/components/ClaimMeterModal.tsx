// src/components/ClaimMeterModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { getCookie } from '@/lib/cookies';
import { Search, Loader2, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface ClaimMeterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // parent refresh
}

export default function ClaimMeterModal({ isOpen, onClose, onSuccess }: ClaimMeterModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [availableMeters, setAvailableMeters] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [claiming, setClaiming] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const searchMeters = async () => {
        if (!searchTerm.trim()) return;
        setSearchLoading(true);
        setError(null);
        const token = getCookie('token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meters/available?search=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setAvailableMeters(data.filter((m: any) => m.meterNumber.includes(searchTerm)));
            } else {
                setAvailableMeters([]);
            }
        } catch {
            setError('Failed to search meters');
        } finally {
            setSearchLoading(false);
        }
    };

    const claimMeter = async (meterNumber: string) => {
        setClaiming(meterNumber);
        setError(null);
        const token = getCookie('token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meters/claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ meterNumber }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Claim failed');
            setSuccessMsg(`Meter ${meterNumber} claimed successfully!`);
            // Remove from available list
            setAvailableMeters(prev => prev.filter(m => m.meterNumber !== meterNumber));
            onSuccess(); // refresh parent data
        } catch (err: any) {
            setError(err.message);
        } finally {
            setClaiming(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Claim a Meter">
            <div className="space-y-4">
                {successMsg && (
                    <div className="p-3 bg-green-50 text-green-700 rounded flex items-center gap-2">
                        <CheckCircle size={16} /> {successMsg}
                    </div>
                )}
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Enter meter number"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <button
                        onClick={searchMeters}
                        disabled={searchLoading || !searchTerm.trim()}
                        className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {searchLoading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                    </button>
                </div>

                {availableMeters.length > 0 && (
                    <div className="border rounded-lg divide-y">
                        {availableMeters.map((meter: any) => (
                            <div key={meter.meterNumber} className="flex items-center justify-between p-3">
                                <div>
                                    <p className="font-medium">{meter.meterNumber}</p>
                                    <p className="text-xs text-gray-500">Available for claiming</p>
                                </div>
                                <button
                                    onClick={() => claimMeter(meter.meterNumber)}
                                    disabled={claiming === meter.meterNumber}
                                    className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600 disabled:opacity-50"
                                >
                                    {claiming === meter.meterNumber ? <Loader2 size={14} className="animate-spin" /> : 'Claim'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {!searchLoading && searchTerm && availableMeters.length === 0 && (
                    <p className="text-sm text-gray-500">No available meters found with that number.</p>
                )}
            </div>
        </Modal>
    );
}