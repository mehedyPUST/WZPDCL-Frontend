// src/components/home/CTASection.tsx
import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';

export default function CTASection() {
    return (
        <section className="relative py-20 md:py-28 bg-emerald-600 overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                    <Zap className="text-white" size={28} />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to Experience Hassle‑Free Electricity Service?
                </h2>
                <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-10">
                    Join thousands of satisfied consumers who pay bills, track connections, and resolve complaints online.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/register"
                        className="px-8 py-3.5 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                    >
                        Create Free Account
                        <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="/pay-bill"
                        className="px-8 py-3.5 border border-white/50 text-white rounded-xl font-semibold hover:bg-white/10 transition-all inline-flex items-center gap-2"
                    >
                        Pay Bill Now
                        <Zap size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
}