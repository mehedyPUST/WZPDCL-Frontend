// src/components/ClientDashboardLayout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { setCookie } from '@/lib/cookies';
import { authClient } from '@/lib/auth-client';

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authClient.getSession()
            .then(({ data }) => {
                if (data?.user) {
                    const userData = data.user as any;
                    // ✅ সেশন থেকে accessToken (আমাদের ব্যাকএন্ড JWT) কুকিতে সংরক্ষণ
                    const token = (data.session as any)?.accessToken || (data as any)?.accessToken;
                    if (token) {
                        setCookie('token', token, 7);
                    }

                    setUser({
                        id: userData.id,
                        name: userData.name,
                        email: userData.email,
                        role: userData.role || 'consumer',
                    });
                } else {
                    router.push('/login');
                }
            })
            .catch(() => router.push('/login'))
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