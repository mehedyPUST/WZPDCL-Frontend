// src/app/dashboard/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import { User, Mail, Loader2 } from 'lucide-react';

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = getCookie('token');
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data && data._id) setUser(data);
                else setError('Could not load profile');
            })
            .catch(() => setError('Failed to load profile'))
            .finally(() => setLoading(false));
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

    if (!user) return null;

    return (
        <div>
            <h2 className="text-2xl font-bold text-emerald-700 mb-4">My Profile</h2>
            <div className="bg-white p-6 rounded-lg shadow max-w-md border border-emerald-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-emerald-100 p-3 rounded-full">
                        <User size={32} className="text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xl font-semibold">{user.name}</p>
                        <p className="text-gray-500">{user.email}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <p><strong>Role:</strong> {user.role}</p>
                    <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}