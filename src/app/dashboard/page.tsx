'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { getCookie } from '@/lib/cookies';
import { Loader2 } from 'lucide-react';

const rolePaths: Record<string, string> = {
    admin: '/dashboard/admin',
    xen: '/dashboard/xen',
    connection_wing: '/dashboard/connection',
    connection: '/dashboard/connection',
    complaint_manager: '/dashboard/complaint',
    complaint: '/dashboard/complaint',
    billing: '/dashboard/billing',
    consumer: '/dashboard/consumer',
};

export default function DashboardRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        // 1. Check for cookie-based user (email/password login)
        const userStr = getCookie('user');
        if (userStr) {
            try {
                const parsed = JSON.parse(userStr);
                const role = parsed.role || 'consumer';
                router.push(rolePaths[role] || `/dashboard/${role}`);
                return;
            } catch { }
        }

        // 2. Fallback to better-auth session check (Google/Social login)
        authClient.getSession()
            .then(({ data }) => {
                if (!data?.user) {
                    router.push('/login');
                    return;
                }
                const role = (data.user as any).role || 'consumer';
                router.push(rolePaths[role] || `/dashboard/${role}`);
            })
            .catch(() => router.push('/login'));
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-50">
            <Loader2 size={40} className="animate-spin text-emerald-600" />
        </div>
    );
}