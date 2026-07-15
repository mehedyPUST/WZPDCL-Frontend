'use client';
import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import { Loader2 } from 'lucide-react';

export default function MyConnections() {
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/my`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => setConnections(Array.isArray(data) ? data : []))
            .catch(() => setError('Failed to load connections'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-primary-600 mb-4">My Connections</h2>
            {connections.length === 0 ? <p className="text-gray-500">No connections yet.</p> : (
                <div className="grid gap-4">
                    {connections.map((conn: any) => (
                        <div key={conn._id} className="bg-white p-4 rounded shadow">
                            <p><strong>Type:</strong> {conn.type}</p>
                            <p><strong>Address:</strong> {conn.address}</p>
                            <p><strong>Status:</strong> {conn.status}</p>
                            <p className="text-sm text-gray-400">Applied: {new Date(conn.appliedAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}