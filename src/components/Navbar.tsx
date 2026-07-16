'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Menu, X, User, LogOut, LayoutDashboard, Zap } from 'lucide-react';

const getDashboardPath = (role: string) => {
    const paths: Record<string, string> = {
        admin: '/dashboard/admin',
        xen: '/dashboard/xen',
        connection: '/dashboard/connection',
        complaint: '/dashboard/complaint_manager',
        billing: '/dashboard/billing',
        consumer: '/dashboard/consumer',
    };
    return paths[role] || '/dashboard/consumer';
};

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authClient.getSession()
            .then(({ data }) => {
                if (data?.user) {
                    const u = data.user as any;
                    setUser({
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        role: u.role || 'consumer',
                    });
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        await authClient.signOut();
        setUser(null);
        router.push('/login');
    };

    return (
        <nav className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 flex justify-between items-center h-14">
                <Link href="/" className="flex items-center space-x-2">
                    <Zap size={24} />
                    <span className="text-xl font-bold">WZPDCL</span>
                </Link>

                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className="hidden md:flex items-center space-x-3">
                    {!loading && !user ? (
                        <>
                            <Link href="/login" className="px-4 py-2 rounded hover:bg-emerald-600">Login</Link>
                            <Link href="/register" className="px-4 py-2 bg-emerald-500 rounded hover:bg-emerald-600">Register</Link>
                        </>
                    ) : user ? (
                        <div className="flex items-center space-x-3">
                            <span className="text-sm">{user.name}</span>
                            <Link href={getDashboardPath(user.role)} className="px-3 py-2 rounded hover:bg-emerald-600 flex items-center gap-1">
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>
                            <button onClick={handleLogout} className="px-3 py-2 rounded hover:bg-red-600 flex items-center gap-1">
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="w-20 h-8 bg-emerald-600/50 rounded animate-pulse" />
                    )}
                </div>
            </div>
            {/* mobile menu omitted for brevity, same pattern */}
        </nav>
    );
}