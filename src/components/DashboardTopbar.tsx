// src/components/DashboardTopbar.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { removeCookie } from '@/lib/cookies';
import { authClient } from '@/lib/auth-client';
import { Menu, Search, Bell, LogOut, ChevronDown } from 'lucide-react';

interface TopbarProps {
  user: { id: string; name: string; email: string; role: string; image?: string };
  toggleSidebar: () => void;   // only used on mobile
}

export default function DashboardTopbar({ user, toggleSidebar }: TopbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    // Clear all auth cookies immediately
    removeCookie('token');
    removeCookie('user');
    removeCookie('better-auth.session_token');
    removeCookie('__Secure-better-auth.session_token');

    // Asynchronously call signOut to clean up server session if it exists, without blocking the user
    authClient.signOut().catch((e) => {
      console.error("Logout error in DashboardTopbar:", e);
    });

    // Redirect immediately with full page reload to completely flush all client memory/state
    window.location.href = '/login';
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getRoleLabel = (role: string) => {
    if (!role) return "User's";
    const r = role.toLowerCase();
    if (r === 'xen') return "XEN's";
    if (r === 'admin') return "Admin's";
    if (r === 'billing') return "Billing's";
    if (r === 'connection') return "Connection's";
    return `${role.charAt(0).toUpperCase() + role.slice(1)}'s`;
  };

  return (
    <header className="bg-emerald-800 border-b border-emerald-700 h-16 flex items-center px-4 sticky top-0 z-20 shadow-md">
      {/* Left: only hamburger on mobile – otherwise nothing */}
      <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-lg text-emerald-100 hover:bg-emerald-700 mr-2 transition-colors">
        <Menu size={20} />
      </button>

      {/* Dynamic Role Dashboard Title */}
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 bg-emerald-900/40 border border-emerald-700/60 rounded-full text-xs font-bold text-emerald-200 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {getRoleLabel(user?.role)} Dashboard
        </span>
        <span className="sm:hidden text-sm font-bold text-white tracking-wide">
          {getRoleLabel(user?.role)} Dashboard
        </span>
      </div>

      {/* Right: search, bell, user – always pushed to the right */}
      <div className="flex items-center gap-4 ml-auto">
        <div className="hidden md:flex items-center bg-emerald-900/40 border border-emerald-700 rounded-lg px-3 py-2 gap-2 focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
          <Search size={16} className="text-emerald-300" />
          <input type="text" placeholder="Search..." className="bg-transparent outline-none text-sm w-40 text-white placeholder-emerald-300" />
        </div>

        <button className="p-2 rounded-lg hover:bg-emerald-700 text-emerald-100 relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-emerald-800" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-700/80 transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-600 border border-emerald-500/50 text-white flex items-center justify-center text-sm font-bold shadow-sm overflow-hidden">
              {user.image ? <img src={user.image} alt={user.name} className="w-full h-full object-cover" /> : getInitials(user.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
            </div>
            <ChevronDown size={16} className="text-emerald-300 hidden sm:block" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <button onClick={() => { setDropdownOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={16} /><span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}