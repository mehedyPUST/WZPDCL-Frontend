'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import { Loader2, Users } from 'lucide-react';

export default function AllConsumers() {
    const [consumers, setConsumers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/consumers/all`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setConsumers(data);
                else if (data?.message) setError(data.message);
                else setConsumers([]);
            })
            .catch(() => setError('Failed to load consumers'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;
    if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
                <Users size={24} /> All Consumers ({consumers.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {consumers.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-10">No consumers registered yet.</p>
                ) : (
                    consumers.map((c: any) => (
                        <div key={c._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Users size={18} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-semibold">{c.name || 'Unnamed'}</p>
                                    <p className="text-xs text-gray-500">{c.email || c.mobile || '-'}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex justify-between text-xs text-gray-500">
                                <span>Role: {c.role || 'consumer'}</span>
                                {c.meterNumber && <span>Meter: {c.meterNumber}</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}