'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { getCookie, setCookie } from '@/lib/cookies';
import { authClient } from '@/lib/auth-client';

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const syncSession = async () => {
            const token = getCookie('token');
            const userStr = getCookie('user');

            if (token && userStr) {
                try {
                    setUser(JSON.parse(userStr));
                    setLoading(false);
                    return;
                } catch {
                    // Fall through to better-auth check
                }
            }

            try {
                const { data } = await authClient.getSession();
                if (data && data.session) {
                    const sessionToken = (data.session as any).accessToken || (data.session as any).token || (data as any).accessToken;
                    const userObj = data.user;
                    if (sessionToken && userObj) {
                        setCookie('token', sessionToken, 7);
                        const finalUser = {
                            id: userObj.id,
                            _id: userObj.id,
                            name: userObj.name,
                            email: userObj.email,
                            role: (userObj as any).role || 'consumer',
                        };
                        setCookie('user', JSON.stringify(finalUser), 7);
                        setUser(finalUser);
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to sync session with better-auth:", err);
            }

            router.push('/login');
        };

        syncSession();
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