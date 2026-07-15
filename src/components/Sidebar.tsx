'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { removeCookie } from '@/lib/cookies';
import {
    LayoutDashboard, FileText, Link2, AlertTriangle,
    DollarSign, User, Users, LogOut, BarChart3,
    Settings
} from 'lucide-react';

const menuConfig: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
    consumer: [
        { href: '/dashboard/consumer', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/dashboard/consumer/my-bills', label: 'My Bills', icon: <FileText size={20} /> },
        { href: '/dashboard/consumer/connections', label: 'Connections', icon: <Link2 size={20} /> },
        { href: '/dashboard/consumer/my-complaints', label: 'Complaints', icon: <AlertTriangle size={20} /> },
        { href: '/dashboard/consumer/profile', label: 'Profile', icon: <User size={20} /> },
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
    ],
    connection: [
        { href: '/dashboard/connection', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/dashboard/connection/applications', label: 'Applications', icon: <FileText size={20} /> },
        { href: '/dashboard/connection/meters', label: 'All Meters', icon: <AlertTriangle size={20} /> },
        { href: '/dashboard/connection/new-connection-stats', label: 'Statistics', icon: <AlertTriangle size={20} /> },

        { href: '/dashboard/connection/profile', label: 'Profile', icon: <User size={20} /> },
    ],
    billing: [
        { href: '/dashboard/billing', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/dashboard/billing/all-bills', label: 'All Bills', icon: <FileText size={20} /> },
        { href: '/dashboard/billing/all-consumers', label: 'Consumers', icon: <Users size={20} /> },
        { href: '/dashboard/billing/generate-bills', label: 'Generate Bills', icon: <FileText size={20} /> },
    ],
    complaint: [
        { href: '/dashboard/complaint_manager', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/dashboard/complaint_manager/complaints/all', label: 'All', icon: <AlertTriangle size={20} /> },
        { href: '/dashboard/complaint_manager/complaints/pending', label: 'Pending', icon: <AlertTriangle size={20} /> },
        { href: '/dashboard/complaint_manager/profile', label: 'Profile', icon: <User size={20} /> },
    ],
    admin: [
        { href: '/dashboard/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/dashboard/admin/users', label: 'User Management', icon: <Users size={20} /> },
        { href: '/dashboard/admin/settings', label: 'Rate Settings', icon: <Settings size={20} /> },
        { href: '/dashboard/admin/profile', label: 'Profile', icon: <User size={20} /> },
    ],
};

export default function Sidebar({ role }: { role: string }) {
    const pathname = usePathname();
    const links = menuConfig[role] || [];

    const handleLogout = () => {
        removeCookie('token');
        removeCookie('user');
        window.location.href = '/login';
    };

    return (
        <aside className="w-64 bg-emerald-800 text-white flex flex-col min-h-screen">
            <div className="p-4 border-b border-emerald-700">
                <h1 className="text-xl font-bold">WZPDCL</h1>
                <p className="text-xs text-emerald-300 capitalize">{role}</p>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${isActive ? 'bg-emerald-600' : 'hover:bg-emerald-700'}`}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-2 border-t border-emerald-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-red-600 transition-colors text-left"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}