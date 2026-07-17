// src/components/ClientDashboardLayout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { getCookie, setCookie } from '@/lib/cookies';
import { Menu } from 'lucide-react';

// কোন base path কোন role-এর জন্য
const rolePathMap: Record<string, string> = {
    '/dashboard/admin': 'admin',
    '/dashboard/xen': 'xen',
    '/dashboard/connection': 'connection',
    '/dashboard/billing': 'billing',
    '/dashboard/complaint_manager': 'complaint',
    '/dashboard/consumer': 'consumer',
};

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

        // backend থেকে fresh role আনি
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(freshUser => {
                if (freshUser?.role) {
                    parsedUser.role = freshUser.role;
                    setCookie('user', JSON.stringify(parsedUser), 7);
                }

                // Role check: current path allowed for this role?
                const basePath = '/' + (pathname?.split('/').slice(1, 3).join('/') || '');
                const requiredRole = rolePathMap[basePath];
                const isDashboardHome = Object.keys(rolePathMap).includes(basePath);

                if (isDashboardHome && requiredRole && parsedUser.role !== requiredRole) {
                    router.replace('/access-denied');
                    return;
                }

                setUser(parsedUser);
            })
            .catch(() => {
                // API fail – পুরনো role দিয়েও block করি প্রয়োজনে
                const basePath = '/' + (pathname?.split('/').slice(1, 3).join('/') || '');
                const requiredRole = rolePathMap[basePath];
                const isDashboardHome = Object.keys(rolePathMap).includes(basePath);

                if (isDashboardHome && requiredRole && parsedUser.role !== requiredRole) {
                    router.replace('/access-denied');
                    return;
                }
                setUser(parsedUser);
            })
            .finally(() => setLoading(false));
    }, [pathname]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
            <Sidebar
                role={user.role}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col">
                {/* Mobile Top Sub-Header */}
                <div className="md:hidden bg-white border-b border-emerald-100 px-4 py-3 flex items-center justify-between sticky top-16 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg text-emerald-800 hover:bg-emerald-50 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-emerald-800 capitalize">
                        {user.role.replace('_', ' ')} Portal
                    </span>
                    <div className="w-8" />
                </div>

                <main className="flex-1 p-4 sm:p-6 bg-emerald-50 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}