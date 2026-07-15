'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie } from '@/lib/cookies';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const appId = searchParams.get('app');
        if (!appId) {
            setStatus('error');
            setMessage('Invalid application ID.');
            return;
        }

        const token = getCookie('token');
        if (!token) {
            setStatus('error');
            setMessage('Authentication error. Please login.');
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/manual-confirm-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ applicationId: appId }),
        })
            .then((res) => res.json())
            .then((data) => {
                // ✅ সঠিক কন্ডিশন – শুধুমাত্র নির্দিষ্ট মেসেজ পেলেই সাকসেস
                if (data.message === 'Payment confirmed manually') {
                    setStatus('success');
                    setMessage('Payment confirmed! Your application is now under review.');
                    setTimeout(() => router.push('/dashboard/consumer/connections'), 3000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Failed to confirm payment.');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Something went wrong. Please contact support.');
            });
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-50">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                {status === 'loading' && (
                    <>
                        <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto" />
                        <h2 className="text-xl font-bold mt-4">Confirming your payment...</h2>
                        <p className="text-gray-500 mt-2">Please wait a moment.</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle size={64} className="text-green-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-emerald-700 mt-4">Payment Successful!</h2>
                        <p className="text-gray-600 mt-2">{message}</p>
                        <p className="text-sm text-gray-400 mt-4">Redirecting to your connections...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <XCircle size={64} className="text-red-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-red-700 mt-4">Oops!</h2>
                        <p className="text-gray-600 mt-2">{message}</p>
                        <button
                            onClick={() => router.push('/dashboard/consumer/connections')}
                            className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            Go to My Connections
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}