'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const type = searchParams.get('type');
        const id = searchParams.get('id'); // billId

        if (type === 'bill' && id) {
            // বিল পেমেন্ট কনফার্ম করতে API কল
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/confirm-bill-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ billId: id }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.message) setStatus('success');
                    else setStatus('error');
                })
                .catch(() => setStatus('error'));
        } else {
            setStatus('success'); // type=bill না হলে (connection payment) webhook ধরে নিচ্ছি
        }
    }, [searchParams]);

    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => router.push('/'), 5000);
            return () => clearTimeout(timer);
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                    <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto" />
                    <h2 className="text-xl font-bold mt-4">Confirming your payment...</h2>
                    <p className="text-gray-500 mt-2">Please wait a moment.</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                    <p className="text-red-500 mb-4">Could not confirm payment. Please contact support.</p>
                    <button onClick={() => router.push('/')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                <CheckCircle size={64} className="text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold text-emerald-700 mt-4">Payment Successful!</h2>
                <p className="text-gray-600 mt-2">Your bill has been paid. Thank you!</p>
                <p className="text-sm text-gray-400 mt-4">Redirecting to homepage...</p>
            </div>
        </div>
    );
}