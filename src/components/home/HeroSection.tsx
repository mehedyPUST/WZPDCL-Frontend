'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const slides = [
    {
        image: 'https://i.ibb.co.com/LDYysd6h/images.jpg',
        alt: 'Smart Grid',
    },
    {
        image: 'https://i.ibb.co.com/21wGWQ9Q/aicontrolled-smart-grids-optimizing-energy-distribution-realtime-cities-energy-systems-using-ai-moni.avif',
        alt: 'AI Controlled Grid',
    },
    {
        image: 'https://i.ibb.co.com/27GjsHgq/istockphoto-1969568700-612x612.jpg',
        alt: 'Electricity Infrastructure',
    },
];

export default function HeroSection() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative bg-gradient-to-r from-emerald-600 to-emerald-800 text-white overflow-hidden">
            {/* Sliding background images */}
            <div className="absolute inset-0">
                {slides.map((slide, idx) => (
                    <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-1000 ${idx === current ? 'opacity-30' : 'opacity-0'
                            }`}
                    >
                        <Image
                            src={slide.image}
                            alt={slide.alt}
                            fill
                            className="object-cover"
                            priority={idx === 0}
                        />
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        Reliable Electricity Distribution <br />
                        <span className="text-emerald-200">for Kushtia Division</span>
                    </h1>
                    <p className="text-emerald-50 text-lg max-w-lg">
                        WZPDCL provides efficient power distribution, online bill payment,
                        new connection requests, and real‑time complaint management.
                    </p>
                    <div className="flex gap-4">
                        <Link
                            href="/register"
                            className="px-6 py-3 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/pay-bill"
                            className="px-6 py-3 border border-white text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
                        >
                            Pay Bill
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}