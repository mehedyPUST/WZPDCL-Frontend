import Link from 'next/link';

export default function CTASection() {
    return (
        <section className="py-16 bg-emerald-600 text-white text-center">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-emerald-100 mb-6">Join thousands of satisfied consumers today.</p>
                <Link href="/register" className="px-6 py-3 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-gray-100 transition">
                    Create Free Account
                </Link>
            </div>
        </section>
    );
}