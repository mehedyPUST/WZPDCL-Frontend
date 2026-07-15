'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCookie, removeCookie } from '@/lib/cookies';
import {
    Menu, X, User, LogOut, LayoutDashboard, Zap,
} from 'lucide-react';

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getCookie('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            // JWT decode (payload is the second part)
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({
                id: payload.userId,
                name: payload.name || payload.email,
                email: payload.email,
                role: payload.role,
            });
        } catch (err) {
            console.error('Token decode failed', err);
            setUser(null);
        }
        setLoading(false);
    }, [pathname]);

    const handleLogout = () => {
        removeCookie('token');
        removeCookie('user');
        setUser(null);
        router.push('/login');
    };

    const getDashboardPath = (role: string) => {
        const paths: Record<string, string> = {
            admin: '/dashboard/admin',
            xen: '/dashboard/xen',
            connection_wing: '/dashboard/connection_wing',
            complaint_manager: '/dashboard/complaint_manager',
            billing_wings: '/dashboard/billing',
            consumer: '/dashboard/consumer',
        };
        return paths[role] || '/dashboard/consumer';
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-purple-500',
            xen: 'bg-blue-500',
            connection_wing: 'bg-orange-500',
            complaint_manager: 'bg-red-500',
            billing_wings: 'bg-teal-500',
            consumer: 'bg-emerald-500',
        };
        return colors[role] || 'bg-gray-500';
    };

    return (
        <nav className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-14">
                    <Link href="/" className="flex items-center space-x-2">
                        <Zap size={24} />
                        <span className="text-xl font-bold">WZPDCL</span>
                    </Link>

                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-emerald-600">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="hidden md:flex items-center space-x-3">
                        {!loading && !user ? (
                            <>
                                <Link href="/login" className="px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">Login</Link>
                                <Link href="/register" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors">Register</Link>
                            </>
                        ) : user ? (
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full ${getRoleColor(user.role)} flex items-center justify-center text-sm font-bold`}>
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm hidden lg:block">{user.name}</span>
                                <Link href={getDashboardPath(user.role)} className="px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-1">
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard</span>
                                </Link>
                                <button onClick={handleLogout} className="px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-1">
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="w-20 h-8 bg-emerald-600/50 rounded-lg animate-pulse" />
                        )}
                    </div>
                </div>

                {isOpen && (
                    <div className="md:hidden py-4 border-t border-emerald-600 space-y-2">
                        {!loading && !user ? (
                            <>
                                <Link href="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 hover:bg-emerald-600 rounded-lg">Login</Link>
                                <Link href="/register" onClick={() => setIsOpen(false)} className="block px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg">Register</Link>
                            </>
                        ) : user ? (
                            <>
                                <div className="px-4 py-2 flex items-center space-x-2">
                                    <div className={`w-8 h-8 rounded-full ${getRoleColor(user.role)} flex items-center justify-center text-sm font-bold`}>
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-emerald-300 capitalize">{user.role}</p>
                                    </div>
                                </div>
                                <Link href={getDashboardPath(user.role)} onClick={() => setIsOpen(false)} className="block px-4 py-3 hover:bg-emerald-600 rounded-lg">Dashboard</Link>
                                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-4 py-3 hover:bg-emerald-600 rounded-lg">Logout</button>
                            </>
                        ) : (
                            <div className="px-4 py-3 animate-pulse">
                                <div className="h-8 bg-emerald-600/50 rounded-lg w-32" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;