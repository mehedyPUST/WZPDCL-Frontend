'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import Link from 'next/link';
import {
    Loader2, FileText, Users, DollarSign, TrendingUp,
    AlertCircle, Zap, PlusCircle,
    CheckCircle
} from 'lucide-react';

export default function BillingWingDashboard() {
    const [stats, setStats] = useState({
        totalBills: 0,
        paidBills: 0,
        unpaidBills: 0,
        totalConsumers: 0,
        todayCollection: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }
        const headers = { Authorization: `Bearer ${token}` };

        Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/all`, { headers }).then(r => r.json()),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/consumers/all`, { headers }).then(r => r.json()),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/all`, { headers }).then(r => r.json()),
        ])
            .then(([billsData, consumersData, paymentsData]) => {
                const bills = Array.isArray(billsData) ? billsData : [];
                const consumers = Array.isArray(consumersData) ? consumersData : [];
                const payments = Array.isArray(paymentsData) ? paymentsData : [];

                const paid = bills.filter((b: any) => b.status === 'paid');
                const unpaid = bills.filter((b: any) => b.status !== 'paid');
                const today = new Date().toLocaleDateString();
                const todayPayments = payments.filter((p: any) =>
                    new Date(p.createdAt).toLocaleDateString() === today
                );

                setStats({
                    totalBills: bills.length,
                    paidBills: paid.length,
                    unpaidBills: unpaid.length,
                    totalConsumers: consumers.length,
                    todayCollection: todayPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
                });
            })
            .catch(() => setError('Failed to load data'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;
    if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div>
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                        <DollarSign size={28} className="text-emerald-600" />
                    </div>
                    Billing Dashboard
                </h2>
                <p className="text-gray-500 mt-1 ml-14">Overview of bills, collections, and quick actions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<FileText size={24} />} label="Total Bills" value={stats.totalBills} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<CheckCircle size={24} />} label="Paid" value={stats.paidBills} color="bg-green-100 text-green-600" />
                <StatCard icon={<AlertCircle size={24} />} label="Unpaid" value={stats.unpaidBills} color="bg-red-100 text-red-600" />
                <StatCard icon={<Users size={24} />} label="Consumers" value={stats.totalConsumers} color="bg-purple-100 text-purple-600" />
            </div>

            {/* Today's Collection & Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Today's Collection</p>
                        <p className="text-3xl font-bold text-emerald-700">৳{stats.todayCollection.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="text-emerald-400 mt-2" size={24} />
                </div>
                <Link href="/dashboard/billing_wings/generate-bills"
                    className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow flex flex-col items-center gap-3 justify-center text-center">
                    <div className="p-3 bg-emerald-100 rounded-full">
                        <PlusCircle size={24} className="text-emerald-600" />
                    </div>
                    <span className="font-medium text-gray-700">Generate New Bill</span>
                </Link>
                <Link href="/dashboard/billing_wings/all-bills"
                    className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow flex flex-col items-center gap-3 justify-center text-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <FileText size={24} className="text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700">View All Bills</span>
                </Link>
            </div>

            {/* Unpaid Bills Section (quick list) */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Unpaid Bills</h3>
                <UnpaidBillsList />
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-5 border flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

function UnpaidBillsList() {
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getCookie('token');
        if (!token) { setLoading(false); return; }
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/all`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                const unpaid = Array.isArray(data) ? data.filter((b: any) => b.status !== 'paid').slice(0, 5) : [];
                setBills(unpaid);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loader2 className="animate-spin text-emerald-600 mx-auto" size={24} />;
    if (bills.length === 0) return <p className="text-gray-400 text-center">No unpaid bills</p>;

    return (
        <div className="space-y-2">
            {bills.map(bill => (
                <div key={bill._id} className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm font-medium">{bill.meterNumber}</span>
                    <span className="text-sm">৳{bill.amount}</span>
                    <span className="text-xs text-gray-400">{new Date(bill.dueDate).toLocaleDateString()}</span>
                </div>
            ))}
        </div>
    );
}