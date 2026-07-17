'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { getCookie, removeCookie } from '@/lib/cookies';
import { Menu, X, LogOut, LayoutDashboard, Zap, Home, Info, Phone } from 'lucide-react';

const getDashboardPath = (role: string) => {
    const paths: Record<string, string> = {
        admin: '/dashboard/admin',
        xen: '/dashboard/xen',
        connection: '/dashboard/connection',
        complaint: '/dashboard/complaint',
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
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const handleLogout = () => {
        removeCookie('token');
        removeCookie('user');
        removeCookie('better-auth.session_token');
        removeCookie('__Secure-better-auth.session_token');
        authClient.signOut().catch((e) => console.error("Logout error in Navbar:", e));
        setUser(null);
        window.location.href = '/login';
    };

    const isActive = (href: string) => pathname === href;
    const showContact = !user || user.role === 'consumer';

    if (pathname.startsWith('/dashboard')) return null;

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-emerald-800/95 backdrop-blur-md shadow-lg'
                : 'bg-gradient-to-r from-emerald-700 to-emerald-600 shadow-md'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-18 md:h-20">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <img
                                src="https://i.ibb.co.com/VYBv8n64/Untitled-1.png"
                                alt="WZPDCL Logo"
                                className="h-12 w-auto rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                        </div>
                        <div className="hidden md:block leading-tight">
                            <p className="text-lg font-bold tracking-wide text-white">
                                West Zone Power Distribution
                            </p>
                            <p className="text-sm font-medium text-emerald-200 tracking-wider">
                                Company Limited
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        <div className="flex items-center space-x-1 bg-emerald-800/30 backdrop-blur-sm rounded-xl p-1.5 mr-4">
                            <Link
                                href="/"
                                className={`px-4 py-2 rounded-lg text-base font-medium transition-all duration-300 flex items-center gap-2 ${isActive('/')
                                        ? 'bg-white/20 text-white shadow-sm'
                                        : 'text-emerald-100 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Home size={18} />
                                Home
                            </Link>
                            <Link
                                href="/about"
                                className={`px-4 py-2 rounded-lg text-base font-medium transition-all duration-300 flex items-center gap-2 ${isActive('/about')
                                        ? 'bg-white/20 text-white shadow-sm'
                                        : 'text-emerald-100 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Info size={18} />
                                About
                            </Link>
                            {showContact && (
                                <Link
                                    href="/contact"
                                    className={`px-4 py-2 rounded-lg text-base font-medium transition-all duration-300 flex items-center gap-2 ${isActive('/contact')
                                            ? 'bg-white/20 text-white shadow-sm'
                                            : 'text-emerald-100 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Phone size={18} />
                                    Contact
                                </Link>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            {!loading && !user ? (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-5 py-2 text-base font-medium text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-5 py-2 bg-white text-emerald-700 text-base font-semibold rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                    >
                                        Register
                                    </Link>
                                </>
                            ) : user ? (
                                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl p-1.5">
                                    <Link
                                        href={getDashboardPath(user.role)}
                                        className="px-4 py-2 text-base font-medium text-white hover:bg-white/10 rounded-lg transition-all duration-300 flex items-center gap-2"
                                    >
                                        <LayoutDashboard size={18} />
                                        Dashboard
                                    </Link>
                                    <div className="w-px h-6 bg-white/20" />
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-base font-medium text-red-200 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-300 flex items-center gap-2"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-9 bg-emerald-600/50 rounded-xl animate-pulse" />
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="space-y-1 pt-2">
                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-base ${isActive('/') ? 'bg-white/20 text-white' : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Home size={18} /> Home
                        </Link>
                        <Link
                            href="/about"
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-base ${isActive('/about') ? 'bg-white/20 text-white' : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Info size={18} /> About
                        </Link>
                        {showContact && (
                            <Link
                                href="/contact"
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-base ${isActive('/contact') ? 'bg-white/20 text-white' : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <Phone size={18} /> Contact
                            </Link>
                        )}
                        <div className="my-2 border-t border-white/10" />
                        {!loading && !user ? (
                            <div className="space-y-2 px-2">
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-3 text-center text-base text-white border border-white/20 rounded-xl hover:bg-white/10 transition-all duration-300"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-3 text-center text-base bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all duration-300"
                                >
                                    Register
                                </Link>
                            </div>
                        ) : user ? (
                            <div className="space-y-2 px-2">
                                <Link
                                    href={getDashboardPath(user.role)}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-white hover:bg-white/10 transition-all duration-300"
                                >
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsOpen(false); }}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base text-red-200 hover:text-white hover:bg-red-500/20 transition-all duration-300"
                                >
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </nav>
    );
}