'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const images = [
    'https://i.ibb.co.com/LDYysd6h/images.jpg',
    'https://i.ibb.co.com/21wGWQ9Q/aicontrolled-smart-grids-optimizing-energy-distribution-realtime-cities-energy-systems-using-ai-moni.avif',
    'https://i.ibb.co.com/27GjsHgq/istockphoto-1969568700-612x612.jpg',
];

export default function HeroSection() {
    const [current, setCurrent] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev + 1) % images.length);
    }, []);

    // Auto-slide every 4 seconds
    useEffect(() => {
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, [nextSlide]);

    return (
        <section className="relative bg-gradient-to-r from-emerald-600 to-emerald-800 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-10">
                {/* Text Content */}
                <div className="flex-1 space-y-6 z-10">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        Reliable Electricity Distribution <br />
                        <span className="text-emerald-200">for Kushtia Division</span>
                    </h1>
                    <p className="text-emerald-50 text-lg max-w-lg">
                        WZPDCL provides efficient power distribution, online bill payment,
                        new connection requests, and real-time complaint management.
                    </p>
                    <div className="flex gap-4">
                        <Link
                            href="/register"
                            className="px-6 py-3 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/login"
                            className="px-6 py-3 border border-white text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
                        >
                            Sign In
                        </Link>
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex gap-2 pt-4">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`w-3 h-3 rounded-full transition ${idx === current ? 'bg-white scale-125' : 'bg-white/50'
                                    }`}
                                aria-label={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Image Slider */}
                <div className="flex-1 flex justify-center z-10">
                    <div className="relative w-full max-w-md md:max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                        {images.map((src, idx) => (
                            <div
                                key={src}
                                className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'opacity-0'
                                    }`}
                            >
                                <Image
                                    src={src}
                                    alt={`WZPDCL Slide ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={idx === 0}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}