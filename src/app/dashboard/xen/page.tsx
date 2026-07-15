'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import { Users, AlertTriangle, FileText, DollarSign, Loader2 } from 'lucide-react';

export default function XenDashboard() {
    const [stats, setStats] = useState({
        totalConsumers: 0,
        totalComplaints: 0,
        newApplications: 0,
        totalBills: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }

        const fetchStats = async () => {
            try {
                // আমরা বিভিন্ন এন্ডপয়েন্ট থেকে সংখ্যা নিচ্ছি (রিয়েল প্রজেক্টে summary endpoint বানানো ভালো)
                const [consumersRes, complaintsRes, connectionsRes, billsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/consumers/all`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/complaints/all`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/all`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/all`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                const consumers = await consumersRes.json();
                const complaints = await complaintsRes.json();
                const connections = await connectionsRes.json();
                const bills = await billsRes.json();

                setStats({
                    totalConsumers: Array.isArray(consumers) ? consumers.length : 0,
                    totalComplaints: Array.isArray(complaints) ? complaints.length : 0,
                    newApplications: Array.isArray(connections) ? connections.filter((c: any) => c.status === 'pending_payment' || c.status === 'payment_done').length : 0,
                    totalBills: Array.isArray(bills) ? bills.length : 0,
                });
            } catch (err) {
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">XEN Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Users size={24} />} label="Total Consumers" value={stats.totalConsumers} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<AlertTriangle size={24} />} label="Total Complaints" value={stats.totalComplaints} color="bg-yellow-100 text-yellow-600" />
                <StatCard icon={<FileText size={24} />} label="New Applications" value={stats.newApplications} color="bg-purple-100 text-purple-600" />
                <StatCard icon={<DollarSign size={24} />} label="Total Bills" value={stats.totalBills} color="bg-green-100 text-green-600" />
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}