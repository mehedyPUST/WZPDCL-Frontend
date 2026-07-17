// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-8xl font-bold text-emerald-700">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
                <p className="text-gray-600 mt-2 max-w-md mx-auto">
                    Sorry, the page you are looking for does not exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="mt-8 inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}