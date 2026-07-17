// src/app/access-denied/page.tsx
import Link from 'next/link';

export default function AccessDeniedPage() {
    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🚫</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Access Denied</h1>
                <p className="text-gray-600 mt-3">
                    You do not have permission to view this page.
                    <br />
                    Please contact your administrator if you think this is a mistake.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/dashboard"
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        href="/"
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}