'use client';
import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import { Loader2 } from 'lucide-react';

export default function MyBills() {
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/my`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => setBills(Array.isArray(data) ? data : []))
            .catch(() => setError('Failed to load bills'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-primary-600 mb-4">My Bills</h2>
            {bills.length === 0 ? <p className="text-gray-500">No bills found.</p> : (
                <div className="grid gap-4">
                    {bills.map((bill: any) => (
                        <div key={bill._id} className="bg-white p-4 rounded shadow flex justify-between">
                            <div>
                                <p className="font-semibold">Meter: {bill.meterNumber}</p>
                                <p className="text-sm text-gray-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold">৳{bill.amount}</p>
                                <span className={`px-2 py-1 rounded text-sm ${bill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{bill.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}