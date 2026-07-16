import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white">
            <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        Reliable Electricity Distribution <br />
                        <span className="text-emerald-200">for Kushtia Division</span>
                    </h1>
                    <p className="text-emerald-50 text-lg max-w-lg">
                        WZPDCL provides efficient power distribution, online bill payment,
                        new connection requests, and real-time complaint management.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/register" className="px-6 py-3 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-gray-100 transition">
                            Get Started
                        </Link>
                        <Link href="/login" className="px-6 py-3 border border-white text-white rounded-lg font-semibold hover:bg-emerald-700 transition">
                            Sign In
                        </Link>
                    </div>
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="w-80 h-80 bg-emerald-500/30 rounded-full flex items-center justify-center">
                        <span className="text-6xl">⚡</span>
                    </div>
                </div>
            </div>
        </section>
    );
}