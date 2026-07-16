'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        authClient.getSession()
            .then(({ data }) => {
                if (!data?.user) {
                    router.push('/login');
                    return;
                }
                const role = (data.user as any).role || 'consumer';
                router.push(`/dashboard/${role}`);
            })
            .catch(() => router.push('/login'));
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-50">
            <Loader2 size={40} className="animate-spin text-emerald-600" />
        </div>
    );
}