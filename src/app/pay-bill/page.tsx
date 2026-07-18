'use client';

import { useState } from 'react';
import { Search, Loader2, Zap } from 'lucide-react';

export default function PayBillPage() {
    const [meterNumber, setMeterNumber] = useState('');
    const [bill, setBill] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paying, setPaying] = useState(false);

    const searchBill = async () => {
        if (!meterNumber.trim()) return;
        setLoading(true);
        setError('');
        setBill(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/bill/${meterNumber}`);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'No unpaid bill found');
            }
            const data = await res.json();
            setBill(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        if (!bill) return;
        setPaying(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ billId: bill._id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Payment error');
            // Redirect to Stripe Checkout
            window.location.href = data.url;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setPaying(false);
        }
    };

    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-emerald-100">
                <div className="text-center mb-8">
                    <div className="bg-emerald-100 p-3 rounded-full inline-flex mb-3">
                        <Zap className="text-emerald-600" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-emerald-800">Pay Electricity Bill</h1>
                    <p className="text-gray-500 text-sm mt-1">Enter your meter number to find unpaid bill</p>

                    <div className='text-sm text-gray-500'>
                        <p className='text-red-500 text-xl'>Request to Examiner</p>
                        <p>To Check This Functionality</p>
                        <br />
                        <ol>

                            <li>1. Add a Meter From Connection Dashboard</li>
                            <li>2. Generate Bill From Billings</li>
                            <li>3. Then Enter The Meter Number Here</li>
                            <li>4. You Can Also Pay Bill by Logging in a consumer Account and Claiming a meter</li>
                        </ol>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Meter Number"
                            value={meterNumber}
                            onChange={(e) => setMeterNumber(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchBill()}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <button
                        onClick={searchBill}
                        disabled={loading || !meterNumber.trim()}
                        className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                        {loading ? 'Searching...' : 'Find Bill'}
                    </button>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {bill && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Meter Number</span>
                                <span className="font-medium">{bill.meterNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Amount Due</span>
                                <span className="font-bold text-emerald-700">৳{bill.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Due Date</span>
                                <span>{new Date(bill.dueDate).toLocaleDateString()}</span>
                            </div>
                            <button
                                onClick={handlePay}
                                disabled={paying}
                                className="w-full mt-3 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {paying ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                                {paying ? 'Redirecting...' : 'Pay Now'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}