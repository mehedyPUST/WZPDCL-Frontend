'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { setCookie, getCookie } from '@/lib/cookies';
import { authClient } from '@/lib/auth-client';

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // আগের token থাকলে আগে দেখাই
        const existingToken = getCookie('token');
        const existingUser = getCookie('user');

        if (existingToken && existingUser) {
            try {
                setUser(JSON.parse(existingUser));
                setLoading(false);
                return;
            } catch { }
        }

        // better‑auth সেশন থেকে token বের করি
        authClient.getSession()
            .then(async ({ data }) => {
                if (!data?.user) {
                    router.push('/login');
                    return;
                }

                const userData = data.user as any;

                // ✅ JWT token পেতে আমাদের backend-এ কল করি
                let token = (data.session as any)?.accessToken || (data as any)?.accessToken;

                if (!token) {
                    // token না থাকলে login API কল করে token নেই
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: userData.email,
                                // Google user হলে password দরকার নেই – backend google auth route use করব
                            }),
                        });
                        // যদি email/password user না হয়ে google user হয়, we'll use google auth route
                        if (!res.ok) {
                            const googleRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    googleId: userData.id, // better‑auth id (Google's id)
                                    email: userData.email,
                                    name: userData.name,
                                    image: (userData as any).image || '',
                                }),
                            });
                            const googleData = await googleRes.json();
                            token = googleData.token;
                        } else {
                            const loginData = await res.json();
                            token = loginData.token;
                        }
                    } catch (err) {
                        console.error('Failed to get token:', err);
                    }
                }

                if (token) {
                    setCookie('token', token, 7);
                    console.log('✅ Token cookie set');
                }

                const finalUser = {
                    id: userData.id,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role || 'consumer',
                };

                setCookie('user', JSON.stringify(finalUser), 7);
                setUser(finalUser);
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