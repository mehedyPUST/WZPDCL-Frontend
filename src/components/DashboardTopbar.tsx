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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4">
      {/* Left: only hamburger on mobile – otherwise nothing */}
      <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 mr-2">
        <Menu size={20} />
      </button>

      {/* Right: search, bell, user – always pushed to the right */}
      <div className="flex items-center gap-4 ml-auto">
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 gap-2">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search..." className="bg-transparent outline-none text-sm w-40 text-gray-600" />
        </div>

        <button className="p-2 rounded-lg hover:bg-gray-100 relative">
          <Bell size={20} className="text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
              {user.image ? <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" /> : getInitials(user.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-700 leading-tight">{user.name}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <button onClick={() => { setDropdownOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                <LogOut size={16} /><span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}