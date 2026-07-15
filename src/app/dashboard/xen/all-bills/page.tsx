'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import { Loader2, FileText } from 'lucide-react';

export default function AllBills() {
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/all`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setBills(Array.isArray(data) ? data : []))
            .catch(() => setError('Failed to load bills'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loader2 className="animate-spin text-emerald-600 mx-auto mt-20" size={40} />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
                <FileText size={24} /> All Bills ({bills.length})
            </h2>
            {bills.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No bills yet.</p>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">Meter</th>
                                <th className="px-4 py-3 text-left">Amount</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Due</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill: any) => (
                                <tr key={bill._id} className="border-t">
                                    <td className="px-4 py-3">{bill.meterNumber}</td>
                                    <td className="px-4 py-3">৳{bill.amount}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>{bill.status}</span>
                                    </td>
                                    <td className="px-4 py-3">{new Date(bill.dueDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}