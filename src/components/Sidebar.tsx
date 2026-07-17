// src/components/Sidebar.tsx (full code)
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { removeCookie } from '@/lib/cookies';
import { authClient } from '@/lib/auth-client';
import {
    LayoutDashboard, FileText, Link2, AlertTriangle,
    DollarSign, User, Users, LogOut, BarChart3,
    Settings, Home
} from 'lucide-react';

// ========== সম্পূর্ণ মেনু কনফিগ (flat) ==========
const menuConfig: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
    consumer: [
        { href: '/dashboard/consumer', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/dashboard/consumer/my-bills', label: 'My Bills', icon: <FileText size={20} /> },
        { href: '/dashboard/consumer/connections', label: 'Connections', icon: <Link2 size={20} /> },
        { href: '/dashboard/consumer/my-complaints', label: 'Complaints', icon: <AlertTriangle size={20} /> },
        { href: '/dashboard/consumer/profile', label: 'Profile', icon: <User size={20} /> },
        { href: '/', label: 'Homepage', icon: <Home size={20} /> },
    ],
    xen: [
        { href: '/dashboard/xen', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/dashboard/xen/all-consumers', label: 'All Consumers', icon: <Users size={20} /> },
        { href: '/dashboard/xen/connection-applications', label: 'Applications', icon: <FileText size={20} /> },
        { href: '/dashboard/xen/all-complaints', label: 'Complaints', icon: <AlertTriangle size={20} /> },
        { href: '/dashboard/xen/all-bills', label: 'All Bills', icon: <FileText size={20} /> },
        { href: '/dashboard/xen/all-transactions', label: 'Transactions', icon: <DollarSign size={20} /> },
        { href: '/dashboard/xen/financial-statistics', label: 'Statistics', icon: <BarChart3 size={20} /> },
        { href: '/dashboard/xen/profile', label: 'Profile', icon: <User size={20} /> },
        { href: '/', label: 'Homepage', icon: <Home size={20} /> },
    ],
    connection: [
        { href: '/dashboard/connection', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/dashboard/connection/applications', label: 'Applications', icon: <FileText size={20} /> },
        { href: '/dashboard/connection/meters', label: 'All Meters', icon: <AlertTriangle size={20} /> },
        { href: '/dashboard/connection/new-connection-stats', label: 'Statistics', icon: <AlertTriangle size={20} /> },
        { href: '/dashboard/connection/profile', label: 'Profile', icon: <User size={20} /> },
        { href: '/', label: 'Homepage', icon: <Home size={20} /> },
    ],
    billing: [
        { href: '/dashboard/billing', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/dashboard/billing/all-bills', label: 'All Bills', icon: <FileText size={20} /> },
        { href: '/dashboard/billing/all-consumers', label: 'Consumers', icon: <Users size={20} /> },
        { href: '/dashboard/billing/generate-bills', label: 'Generate Bills', icon: <FileText size={20} /> },
        { href: '/dashboard/billing/statistics', label: 'Statistics', icon: <FileText size={20} /> },
        { href: '/dashboard/billing/profile', label: 'Profile', icon: <User size={20} /> },
        { href: '/', label: 'Homepage', icon: <Home size={20} /> },
    ],
    complaint: [
        { href: '/dashboard/complaint', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/dashboard/complaint/all', label: 'All', icon: <AlertTriangle size={20} /> },
        { href: '/dashboard/complaint/pending', label: 'Pending', icon: <AlertTriangle size={20} /> },
        { href: '/dashboard/complaint/profile', label: 'Profile', icon: <User size={20} /> },
        { href: '/', label: 'Homepage', icon: <Home size={20} /> },
    ],
    admin: [
        { href: '/dashboard/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/dashboard/admin/users', label: 'User Management', icon: <Users size={20} /> },
        { href: '/dashboard/admin/settings', label: 'Rate Settings', icon: <Settings size={20} /> },
        { href: '/dashboard/admin/profile', label: 'Profile', icon: <User size={20} /> },
        { href: '/', label: 'Homepage', icon: <Home size={20} /> },
    ],
};

export default function Sidebar({
    role,
    isOpen,
    onClose,
    user,
}: {
    role: string;
    isOpen?: boolean;
    onClose?: () => void;
    user?: { name: string; email: string; role: string; image?: string };
}) {
    const pathname = usePathname();
    const router = useRouter();
    const links = menuConfig[role] || [];

    const handleLogout = () => {
        // Clear all auth cookies immediately
        removeCookie('token');
        removeCookie('user');
        removeCookie('better-auth.session_token');
        removeCookie('__Secure-better-auth.session_token');

        // Asynchronously call signOut to clean up server session if it exists, without blocking the user
        authClient.signOut().catch((e) => {
            console.error("Logout error in Sidebar:", e);
        });

        // Redirect immediately with full page reload to completely flush all client memory/state
        window.location.href = '/login';
    };

    const handleLinkClick = () => { if (onClose) onClose(); };

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
            )}

            <aside
                className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-emerald-800 text-white flex flex-col
          transform transition-transform duration-200 ease-in-out z-30
          lg:static lg:top-0 lg:h-screen lg:z-auto lg:flex-shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
            >
                {/* Logo area – height h-16 (matches topbar) */}
                <div className="h-16 flex items-center px-4 border-b border-emerald-700">
                    <Link href="/" className="flex items-center gap-3 w-full">
                        <img
                            src="https://i.ibb.co.com/VYBv8n64/Untitled-1.png"
                            alt="WZPDCL Logo"
                            className="h-10 w-auto rounded"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold leading-tight">WZPDCL</h1>
                            <p className="text-[10px] text-emerald-300 leading-tight">S&D-1, Kushtia</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation links */}
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={handleLinkClick}
                                className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${isActive ? 'bg-emerald-600' : 'hover:bg-emerald-700'
                                    }`}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User card + logout at bottom */}
                {user && (
                    <div className="p-3 border-t border-emerald-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold shrink-0">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    getInitials(user.name)
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-emerald-300 truncate">{user.email}</p>
                            </div>
                            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-emerald-700 transition-colors" title="Logout">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}