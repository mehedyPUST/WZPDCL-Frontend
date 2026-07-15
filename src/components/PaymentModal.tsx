// src/components/PaymentModal.tsx
'use client';

import React, { useState } from 'react';
import { getCookie } from '@/lib/cookies';
import { X, CreditCard, Loader2, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
    applicationId: string;
    connectionType: string;
    connectionFee: number;
    securityDeposit: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({
    applicationId,
    connectionType,
    connectionFee,
    securityDeposit,
    onClose,
    onSuccess,
}: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const totalAmount = connectionFee + securityDeposit;

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        const token = getCookie('token');
        if (!token) {
            setError('Authentication error.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-connection-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    applicationId,
                    amount: totalAmount,
                    connectionType,
                    description: `New Connection Fee - ${applicationId}`,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to create payment session');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL received');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <CreditCard size={20} className="text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Pay Now</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-gray-600">Application ID</span>
                            <span className="text-sm font-medium">{applicationId}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t border-gray-200">
                            <span className="text-sm text-gray-600">Connection Type</span>
                            <span className="text-sm font-medium capitalize">{connectionType}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t border-gray-200">
                            <span className="text-sm text-gray-600">Connection Fee</span>
                            <span className="text-sm font-medium">৳{connectionFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t border-gray-200">
                            <span className="text-sm text-gray-600">Security Deposit</span>
                            <span className="text-sm font-medium">৳{securityDeposit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t border-gray-200 font-semibold">
                            <span className="text-sm text-gray-800">Total Amount</span>
                            <span className="text-lg font-bold text-emerald-600">৳{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
                            <AlertCircle size={16} className="text-red-600" />
                            {error}
                        </div>
                    )}

                    <p className="text-xs text-gray-500 text-center">
                        You will be redirected to Stripe to complete your payment securely.
                    </p>

                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                            {loading ? 'Processing...' : `Pay ৳${totalAmount.toLocaleString()}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}