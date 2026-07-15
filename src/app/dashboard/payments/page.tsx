'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import { DollarSign, Loader2 } from 'lucide-react';

export default function MyPayments() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = getCookie('token');
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/my`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPayments(data);
                else if (data?.message) console.warn(data.message);
            })
            .catch(() => setError('Failed to load payments'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-primary-600 mb-4">My Payments</h2>
            {payments.length === 0 ? (
                <p className="text-gray-500">No payments yet.</p>
            ) : (
                <div className="grid gap-4">
                    {payments.map((pay: any) => (
                        <div key={pay._id} className="bg-white p-4 rounded shadow">
                            <p><strong>Amount:</strong> ৳{pay.amount}</p>
                            <p><strong>Type:</strong> {pay.type}</p>
                            <p className="text-sm text-gray-400">
                                {new Date(pay.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}