'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { getCookie, removeCookie } from '@/lib/cookies';
import { Menu, X, LogOut, LayoutDashboard, Zap } from 'lucide-react';

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
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStr = getCookie('user');
        if (userStr) {
            try {
                const parsed = JSON.parse(userStr);
                setUser(parsed);
                setLoading(false);
                return;
            } catch { }
        }
        authClient.getSession()
            .then(({ data }) => {
                if (data?.user) {
                    const u = data.user as any;
                    setUser({ id: u.id, name: u.name, email: u.email, role: u.role || 'consumer' });
                }
            })
            .finally(() => setLoading(false));
    }, [pathname]);

    const handleLogout = async () => {
        removeCookie('token');
        removeCookie('user');
        try { await authClient.signOut(); } catch { }
        setUser(null);
        router.push('/login');
    };

    const isActive = (href: string) => pathname === href;

    // ✅ Contact দেখাবে যদি logged-out অথবা consumer
    const showContact = !user || user.role === 'consumer';

    // ✅ ড্যাশবোর্ড পেজগুলোতে navbar লুকিয়ে ফেলব
    if (pathname.startsWith('/dashboard')) {
        return null;
    }

    return (
        <nav className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-3">
                        <img
                            src="https://i.ibb.co.com/VYBv8n64/Untitled-1.png"
                            alt="WZPDCL Logo"
                            className="h-10 w-auto"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div className="hidden md:block leading-tight">
                            <p className="text-sm font-semibold">West Zone Power Distribution</p>
                            <p className="text-sm font-semibold">Company Limited</p>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/" className={`hover:text-emerald-200 transition ${isActive('/') ? 'font-semibold' : ''}`}>Home</Link>
                        <Link href="/about" className={`hover:text-emerald-200 transition ${isActive('/about') ? 'font-semibold' : ''}`}>About</Link>
                        {showContact && (
                            <Link href="/contact" className={`hover:text-emerald-200 transition ${isActive('/contact') ? 'font-semibold' : ''}`}>Contact</Link>
                        )}

                        {!loading && !user ? (
                            <>
                                <Link href="/login" className="hover:text-emerald-200 transition">Login</Link>
                                <Link href="/register" className="px-4 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-600 transition">Register</Link>
                            </>
                        ) : user ? (
                            <>
                                <Link href={getDashboardPath(user.role)} className="flex items-center gap-1 hover:text-emerald-200 transition">
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                                <button onClick={handleLogout} className="flex items-center gap-1 hover:text-red-300 transition">
                                    <LogOut size={18} /> Logout
                                </button>
                            </>
                        ) : (
                            <div className="w-20 h-8 bg-emerald-600/50 rounded animate-pulse" />
                        )}
                    </div>

                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-emerald-600 transition">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {isOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        <Link href="/" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-emerald-600 rounded transition">Home</Link>
                        <Link href="/about" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-emerald-600 rounded transition">About</Link>
                        {showContact && (
                            <Link href="/contact" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-emerald-600 rounded transition">Contact</Link>
                        )}
                        <hr className="border-emerald-600" />
                        {!loading && !user ? (
                            <>
                                <Link href="/login" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-emerald-600 rounded transition">Login</Link>
                                <Link href="/register" onClick={() => setIsOpen(false)} className="block px-4 py-2 bg-emerald-500 rounded transition text-center">Register</Link>
                            </>
                        ) : user ? (
                            <>
                                <Link href={getDashboardPath(user.role)} onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-emerald-600 rounded transition">Dashboard</Link>
                                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-red-600 rounded transition">Logout</button>
                            </>
                        ) : null}
                    </div>
                )}
            </div>
        </nav>
    );
}