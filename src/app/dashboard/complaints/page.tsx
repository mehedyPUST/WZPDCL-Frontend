'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function MyComplaints() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = getCookie('token');
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }

        // প্রথমে logged-in user ID জানতে /auth/me কল করি
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(user => {
                if (!user || !user._id) {
                    setError('Could not verify user');
                    setLoading(false);
                    return;
                }

                // তারপর সব complaints নিয়ে নিজেরটা ফিল্টার করি
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/complaints/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data)) {
                            const myComplaints = data.filter((c: any) => c.userId === user._id);
                            setComplaints(myComplaints);
                        } else {
                            setComplaints([]);
                        }
                    })
                    .catch(() => setError('Failed to load complaints'))
                    .finally(() => setLoading(false));
            })
            .catch(() => {
                setError('Failed to verify user');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-primary-600 mb-4">My Complaints</h2>
            {complaints.length === 0 ? (
                <p className="text-gray-500">No complaints registered.</p>
            ) : (
                <div className="grid gap-4">
                    {complaints.map((comp: any) => (
                        <div key={comp._id} className="bg-white p-4 rounded shadow">
                            <p><strong>Meter:</strong> {comp.meterNumber}</p>
                            <p><strong>Description:</strong> {comp.description}</p>
                            <span className={`px-2 py-1 rounded text-sm ${comp.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {comp.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}