// src/components/ClientDashboardLayout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import DashboardTopbar from '@/components/DashboardTopbar';
import { getCookie, setCookie } from '@/lib/cookies';

const rolePathMap: Record<string, string> = {
    '/dashboard/admin': 'admin', '/dashboard/xen': 'xen', '/dashboard/connection': 'connection',
    '/dashboard/billing': 'billing', '/dashboard/complaint_manager': 'complaint', '/dashboard/consumer': 'consumer',
};

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter(); const pathname = usePathname();
    const [user, setUser] = useState<any>(null); const [loading, setLoading] = useState(true); const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const token = getCookie('token'); const userStr = getCookie('user');
        if (!token || !userStr) { router.push('/login'); return; }
        let parsedUser: any;
        try { parsedUser = JSON.parse(userStr); } catch { router.push('/login'); return; }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(freshUser => {
                if (freshUser?.role) { parsedUser.role = freshUser.role; setCookie('user', JSON.stringify(parsedUser), 7); }
                const bp = '/' + (pathname?.split('/').slice(1, 3).join('/') || '');
                const r = rolePathMap[bp]; const home = Object.keys(rolePathMap).includes(bp);
                if (home && r && parsedUser.role !== r) { router.replace('/access-denied'); return; }
                setUser(parsedUser);
            })
            .catch(() => {
                const bp = '/' + (pathname?.split('/').slice(1, 3).join('/') || '');
                const r = rolePathMap[bp]; const home = Object.keys(rolePathMap).includes(bp);
                if (home && r && parsedUser.role !== r) { router.replace('/access-denied'); return; }
                setUser(parsedUser);
            })
            .finally(() => setLoading(false));
    }, [pathname]);

    if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;
    if (!user) return null;

    return (
        <div className="min-h-screen flex">
            {/* Sidebar – always full height, fixed width on desktop, overlay on mobile */}
            <Sidebar
                role={user.role}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
            />

            {/* Right column – topbar + main content */}
            <div className="flex-1 flex flex-col min-w-0">
                <DashboardTopbar user={user} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-x-hidden">{children}</main>
            </div>
        </div>
    );
}