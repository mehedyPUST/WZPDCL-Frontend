'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/');
        }, 5000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                <CheckCircle size={64} className="text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold text-emerald-700 mt-4">Payment Successful!</h2>
                <p className="text-gray-600 mt-2">
                    Your bill has been paid. Thank you!
                </p>
                <p className="text-sm text-gray-400 mt-4">
                    Redirecting to homepage...
                </p>
            </div>
        </div>
    );
}