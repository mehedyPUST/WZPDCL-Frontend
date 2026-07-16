'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { getCookie, setCookie } from '@/lib/cookies';

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getCookie('token');
        const userStr = getCookie('user');

        if (!token || !userStr) {
            router.push('/login');
            return;
        }

        let parsedUser: any;
        try {
            parsedUser = JSON.parse(userStr);
        } catch {
            router.push('/login');
            return;
        }

        // ✅ backend থেকে fresh role আনি
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(freshUser => {
                if (freshUser?.role) {
                    parsedUser.role = freshUser.role;
                    setCookie('user', JSON.stringify(parsedUser), 7);
                }
                setUser(parsedUser);
            })
            .catch(() => setUser(parsedUser))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex min-h-screen">
            <Sidebar role={user.role} />
            <main className="flex-1 p-6 bg-emerald-50 overflow-y-auto">{children}</main>
        </div>
    );
}