// src/app/dashboard/connection/new-connections-stats/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCookie } from '@/lib/cookies';
import {
    Loader2, BarChart3, TrendingUp, AlertCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function NewConnectionsStatsPage() {
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalConnections, setTotalConnections] = useState(0);

    useEffect(() => {
        const token = getCookie('token');
        if (!token) { setError('Not authenticated'); setLoading(false); return; }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/all`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                const connections = Array.isArray(data) ? data : [];
                setTotalConnections(connections.length);
                // Last 12 months aggregation
                const monthly: Record<string, number> = {};
                const last12 = getLast12Months();
                last12.forEach(m => monthly[m] = 0);

                connections.forEach((conn: any) => {
                    const month = formatMonth(new Date(conn.createdAt));
                    if (monthly.hasOwnProperty(month)) {
                        monthly[month] += 1;
                    }
                });

                const chartArray = last12.map(m => ({
                    month: m,
                    connections: monthly[m],
                }));
                setChartData(chartArray);
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
                        <BarChart3 size={28} className="text-emerald-600" />
                    </div>
                    New Connections Statistics
                </h2>
                <p className="text-gray-500 mt-1 ml-14">Monthly new connection applications for the last 12 months</p>
            </div>

            {/* Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-5 border flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600"><TrendingUp size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Connections</p>
                        <p className="text-2xl font-bold text-gray-800">{totalConnections}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-100 text-green-600"><BarChart3 size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">This Month</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {chartData.length > 0 ? chartData[chartData.length - 1].connections : 0}
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-100 text-purple-600"><BarChart3 size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Avg / Month</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {chartData.length > 0 ? Math.round(totalConnections / 12) : 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Monthly New Connections</h3>
                {chartData.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">No data available</p>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                formatter={(value: any) => [value, 'New Connections']}
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Bar dataKey="connections" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === chartData.length - 1 ? '#059669' : '#10b981'}
                                        opacity={index === chartData.length - 1 ? 1 : 0.7}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Monthly Breakdown</h3>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Month</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Connections</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trend</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {chartData.map((item, idx) => {
                            const prev = idx > 0 ? chartData[idx - 1].connections : item.connections;
                            const change = prev > 0 ? ((item.connections - prev) / prev) * 100 : 0;
                            return (
                                <tr key={item.month} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{item.month}</td>
                                    <td className="px-6 py-4">{item.connections}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
                                            }`}>
                                            {change > 0 ? '↑' : change < 0 ? '↓' : '−'}
                                            {Math.abs(change).toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function formatMonth(date: Date): string {
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
}

function getLast12Months(): string[] {
    const months: string[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(formatMonth(d));
    }
    return months;
}