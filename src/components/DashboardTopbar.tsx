// src/components/DashboardTopbar.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { removeCookie } from '@/lib/cookies';
import { authClient } from '@/lib/auth-client';
import { Menu, Search, Bell, LogOut, ChevronDown } from 'lucide-react';

interface TopbarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
  };
  toggleSidebar: () => void;
}

const roleDisplay: Record<string, string> = {
  admin: 'Admin',
  xen: 'XEN',
  connection: 'Connection Wing',
  billing: 'Billing Wing',
  complaint: 'Complaint Manager',
  consumer: 'Consumer',
};

export default function DashboardTopbar({ user, toggleSidebar }: TopbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    removeCookie('token');
    removeCookie('user');
    try { await authClient.signOut(); } catch { }
    router.push('/login');
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
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 h-16">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Hamburger + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">Dashboard</h1>
        </div>

        {/* Right: Search + Bell + User */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 gap-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-40 text-gray-600"
            />
          </div>

          {/* Notification Bell */}
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700 leading-tight">{user.name}</p>
                <p className="text-xs text-gray-400">{roleDisplay[user.role] || user.role}</p>
              </div>
              <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}