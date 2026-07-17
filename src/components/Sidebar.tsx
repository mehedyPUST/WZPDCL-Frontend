// src/components/Sidebar.tsx
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
        { href: '/dashboard/complaint_manager', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/dashboard/complaint_manager/complaints/all', label: 'All', icon: <AlertTriangle size={20} /> },
        { href: '/dashboard/complaint_manager/complaints/pending', label: 'Pending', icon: <AlertTriangle size={20} /> },
        { href: '/dashboard/complaint_manager/profile', label: 'Profile', icon: <User size={20} /> },
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

    const handleLogout = async () => {
        removeCookie('token');
        removeCookie('user');
        try {
            await authClient.signOut();
        } catch { }
        router.push('/login');
    };

    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
            )}

            <aside
                className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-emerald-800 text-white flex flex-col
        transform transition-transform duration-200 ease-in-out z-30
        lg:translate-x-0 lg:static lg:top-0 lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo area */}
                <div className="p-4 border-b border-emerald-700">
                    <h1 className="text-xl font-bold">WZPDCL</h1>
                    <p className="text-xs text-emerald-300">S&D-1, Kushtia</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
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

                {/* User profile card at bottom */}
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
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-lg hover:bg-emerald-700 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}