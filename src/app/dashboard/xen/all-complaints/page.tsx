'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import { Loader2, AlertTriangle, Clock, CheckCircle, Eye } from 'lucide-react';

export default function AllComplaints() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState<any>(null);

    useEffect(() => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/complaints/all`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setComplaints(Array.isArray(data) ? data : []))
            .catch(() => setError('Failed to load complaints'))
            .finally(() => setLoading(false));
    }, []);

    const getStatusBadge = (status: string) => {
        const map: any = {
            pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
            teamSent: { color: 'bg-blue-100 text-blue-700', icon: Eye, label: 'Team Sent' },
            resolved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Resolved' },
        };
        return map[status] || map.pending;
    };

    if (loading) return <Loader2 className="animate-spin text-emerald-600 mx-auto mt-20" size={40} />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
                <AlertTriangle size={24} /> All Complaints ({complaints.length})
            </h2>
            {complaints.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No complaints found.</p>
            ) : (
                <div className="grid gap-4">
                    {complaints.map(comp => {
                        const badge = getStatusBadge(comp.status);
                        const Icon = badge.icon;
                        return (
                            <div key={comp._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">Meter: {comp.meterNumber}</p>
                                        <p className="text-sm text-gray-600">{comp.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(comp.createdAt).toLocaleString()}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                        <Icon size={12} /> {badge.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}