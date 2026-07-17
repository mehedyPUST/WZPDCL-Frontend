// src/app/about/page.tsx (or src/pages/about.tsx)
'use client';

import { useEffect, useRef, useState } from 'react';
import CountUp from 'react-countup';
import {
    Users,
    Target,
    Eye,
    Zap,
    CreditCard,
    AlertTriangle,
    BarChart3,
    Power,
    Route,
    Box,
    Gauge,
    Smartphone,
    Grid,
    Shield,
    Award,
    TrendingUp,
    Phone,
    Calendar,
} from 'lucide-react';

export default function AboutPage() {
    // ─── Refs & State for Scroll Animations ───────────────────────────────
    const sectionRefs = {
        stats: useRef<HTMLDivElement>(null),
        infra: useRef<HTMLDivElement>(null),
        journey: useRef<HTMLDivElement>(null),
    };
    const [visibleSections, setVisibleSections] = useState({
        stats: false,
        infra: false,
        journey: false,
    });

    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        Object.entries(sectionRefs).forEach(([key, ref]) => {
            if (!ref.current) return;
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setVisibleSections((prev) => ({ ...prev, [key]: true }));
                        observer.disconnect();
                    }
                },
                { threshold: 0.15 }
            );
            observer.observe(ref.current);
            observers.push(observer);
        });

        return () => observers.forEach((obs) => obs.disconnect());
    }, []);

    // ─── Data from PDF ──────────────────────────────────────────────────────
    const statsData = [
        {
            icon: Power,
            value: 97,
            label: 'Distribution Substations',
            description: '33/11 kV · 2966 MVA capacity',
            suffix: '',
            color: 'bg-blue-100 text-blue-600',
            borderColor: 'border-blue-200',
        },
        {
            icon: Route,
            value: 12879,
            label: 'Distribution Lines',
            description: '12,879 km total network',
            suffix: ' km',
            color: 'bg-emerald-100 text-emerald-600',
            borderColor: 'border-emerald-200',
        },
        {
            icon: Grid,
            value: 701,
            label: 'Feeders',
            description: '176 (33 kV) + 525 (11 kV)',
            suffix: '',
            color: 'bg-purple-100 text-purple-600',
            borderColor: 'border-purple-200',
        },
        {
            icon: Box,
            value: 10226,
            label: 'Distribution Transformers',
            description: '1910.7 MVA capacity',
            suffix: '',
            color: 'bg-amber-100 text-amber-600',
            borderColor: 'border-amber-200',
        },
        {
            icon: Gauge,
            value: 809,
            label: 'Peak Demand (Day)',
            description: 'Night peak: 766 MW',
            suffix: ' MW',
            color: 'bg-rose-100 text-rose-600',
            borderColor: 'border-rose-200',
        },
        {
            icon: Smartphone,
            value: 646209,
            label: 'Smart Meters Installed',
            description: 'Online G-Payment network',
            suffix: '',
            color: 'bg-indigo-100 text-indigo-600',
            borderColor: 'border-indigo-200',
        },
        {
            icon: Users,
            value: 1390,
            label: 'Dedicated Employees',
            description: '440 officers · 950 staff',
            suffix: '',
            color: 'bg-pink-100 text-pink-600',
            borderColor: 'border-pink-200',
        },
    ];

    const infrastructure = [
        {
            title: 'Substations',
            icon: Power,
            stats: '97',
            sub: '2966 MVA',
            details: ['33/11 kV substations', '61 source substations', '36 single source'],
        },
        {
            title: 'Lines & Network',
            icon: Route,
            stats: '12,879',
            sub: 'km total',
            details: ['2091 km (33 kV)', '10,788 km (LT)'],
        },
        {
            title: 'Transformers',
            icon: Box,
            stats: '10,226',
            sub: '1910.7 MVA',
            details: ['11/0.4 kV distribution', 'Across the region'],
        },
        {
            title: 'Feeders',
            icon: Grid,
            stats: '701',
            sub: 'total',
            details: ['176 (33 kV)', '525 (11 kV)'],
        },
        {
            title: 'Capacitor Banks',
            icon: Zap,
            stats: '3,664',
            sub: '1363.6 MVAR',
            details: ['114 own installations', '3550 consumer level'],
        },
        {
            title: 'Smart Metering',
            icon: Smartphone,
            stats: '646k+',
            sub: 'connected',
            details: ['572,958 online', '73,251 offline'],
        },
    ];

    const journey = [
        { year: '2011', title: 'Foundation Laid', desc: 'WZPDCL began its journey to power the Kushtia region.' },
        { year: '2015', title: 'Digital Transformation', desc: 'Launched online bill pay and digital consumer services.' },
        { year: '2020', title: 'Smart Grid Initiative', desc: 'Deployed advanced metering and real-time monitoring.' },
        { year: '2024', title: 'Expansion & Excellence', desc: 'Reached 646k+ smart meters and record reliability.' },
    ];

    return (
        <main className="overflow-hidden">
            {/* ─── MINIMAL PAGE HEADER ──────────────────────────────────────── */}
            <section className="py-16 md:py-20 bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-4">
                        About Us
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
                        West Zone Power Distribution Company Ltd.
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Empowering the Kushtia region with reliable, digitally‑managed electricity distribution
                        since 2011.
                    </p>
                </div>
            </section>

            {/* ─── MISSION & VISION ────────────────────────────────────────── */}
            <section className="py-16 md:py-20 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="group relative bg-white rounded-3xl p-10 border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="p-3 bg-emerald-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Eye className="w-7 h-7 text-emerald-700" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">Our Mission</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                To ensure uninterrupted, affordable, and high‑quality electricity supply while
                                delivering exceptional consumer service through digital innovation and operational
                                excellence.
                            </p>
                        </div>

                        <div className="group relative bg-white rounded-3xl p-10 border border-teal-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="p-3 bg-teal-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Target className="w-7 h-7 text-teal-700" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">Our Vision</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                To become the benchmark for smart, sustainable, and consumer‑centric power
                                distribution in Bangladesh, leveraging technology for a brighter, greener future.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── KEY STATISTICS (with CountUp) ──────────────────────────── */}
            <section ref={sectionRefs.stats} className="py-16 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="inline-block text-emerald-600 text-sm font-semibold uppercase tracking-[0.2em] bg-emerald-100/50 px-4 py-1.5 rounded-full mb-3">
                            At a Glance
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-800">Our Operational Footprint</h2>
                        <p className="mt-2 text-gray-500 max-w-2xl mx-auto">
                            Real‑time infrastructure powering the Kushtia region
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {statsData.map((stat, idx) => {
                            const Icon = stat.icon;
                            const delay = idx * 100;
                            return (
                                <div
                                    key={idx}
                                    className={`group bg-white rounded-2xl border ${stat.borderColor} p-7 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden`}
                                    style={{
                                        opacity: visibleSections.stats ? 1 : 0,
                                        transform: visibleSections.stats ? 'translateY(0)' : 'translateY(30px)',
                                        transition: `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
                                    }}
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                        <Icon size={28} strokeWidth={1.8} />
                                    </div>

                                    <div className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight leading-none mb-1">
                                        {visibleSections.stats ? (
                                            <CountUp
                                                start={0}
                                                end={stat.value}
                                                duration={2.5}
                                                suffix={stat.suffix}
                                            />
                                        ) : (
                                            '0'
                                        )}
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-800 mt-1">{stat.label}</h4>
                                    <p className="text-sm text-gray-500 mt-0.5">{stat.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── WHY CHOOSE US ────────────────────────────────────────────── */}
            <section className="py-16 md:py-20 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="inline-block text-emerald-600 text-sm font-semibold uppercase tracking-[0.2em] bg-emerald-100/50 px-4 py-1.5 rounded-full mb-3">
                            Trust & Reliability
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-800">Why WZPDCL?</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: 'Unmatched Reliability',
                                desc: 'We ensure stable, uninterrupted power supply through a robust network of 97 substations and over 12,000 km of lines.',
                                color: 'bg-blue-50 border-blue-200 text-blue-600',
                            },
                            {
                                icon: TrendingUp,
                                title: 'Digital Innovation',
                                desc: 'With 646k+ smart meters and an integrated online portal, we bring transparency and convenience to every consumer.',
                                color: 'bg-emerald-50 border-emerald-200 text-emerald-600',
                            },
                            {
                                icon: Award,
                                title: 'Consumer First',
                                desc: 'Our dedicated team of 1,390 professionals works tirelessly to resolve complaints and ensure a seamless experience.',
                                color: 'bg-purple-50 border-purple-200 text-purple-600',
                            },
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className={`group rounded-3xl border ${item.color} bg-opacity-30 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}
                                >
                                    <div className={`w-16 h-16 rounded-2xl ${item.color} bg-opacity-20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={32} strokeWidth={1.8} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── INFRASTRUCTURE DEEP DIVE ────────────────────────────────── */}
            <section ref={sectionRefs.infra} className="py-16 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="inline-block text-emerald-600 text-sm font-semibold uppercase tracking-[0.2em] bg-emerald-100/50 px-4 py-1.5 rounded-full mb-3">
                            Network Overview
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-800">Infrastructure at a Glance</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {infrastructure.map((item, idx) => {
                            const Icon = item.icon;
                            const delay = idx * 80;
                            return (
                                <div
                                    key={idx}
                                    className="group bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                                    style={{
                                        opacity: visibleSections.infra ? 1 : 0,
                                        transform: visibleSections.infra ? 'scale(1)' : 'scale(0.95)',
                                        transition: `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
                                    }}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-emerald-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <Icon className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-800">{item.title}</h4>
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-4xl font-black text-gray-800">{item.stats}</span>
                                        <span className="text-sm font-medium text-gray-500">{item.sub}</span>
                                    </div>
                                    <ul className="space-y-1.5">
                                        {item.details.map((point, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── OUR JOURNEY (Timeline) ───────────────────────────────────── */}
            <section ref={sectionRefs.journey} className="py-16 md:py-20 bg-gray-50/50">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="inline-block text-emerald-600 text-sm font-semibold uppercase tracking-[0.2em] bg-emerald-100/50 px-4 py-1.5 rounded-full mb-3">
                            Since 2011
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-800">Our Journey</h2>
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-200 via-teal-200 to-cyan-200 rounded-full" />

                        {journey.map((item, idx) => {
                            const isLeft = idx % 2 === 0;
                            const delay = idx * 150;
                            return (
                                <div
                                    key={idx}
                                    className={`relative flex flex-col md:flex-row items-start md:items-center mb-12 last:mb-0 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                                        }`}
                                    style={{
                                        opacity: visibleSections.journey ? 1 : 0,
                                        transform: visibleSections.journey ? 'translateX(0)' : `translateX(${isLeft ? '-30px' : '30px'})`,
                                        transition: `all 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
                                    }}
                                >
                                    <div className="absolute left-4 md:left-1/2 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 z-10" />

                                    <div className={`ml-14 md:ml-0 md:w-5/12 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                                        <div className="bg-white backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-2">
                                                {item.year}
                                            </span>
                                            <h4 className="text-xl font-bold text-gray-800">{item.title}</h4>
                                            <p className="text-gray-600 mt-1">{item.desc}</p>
                                        </div>
                                    </div>

                                    <div className="hidden md:block md:w-5/12" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── SERVICES ──────────────────────────────────────────────────── */}
            <section className="py-16 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="inline-block text-emerald-600 text-sm font-semibold uppercase tracking-[0.2em] bg-emerald-100/50 px-4 py-1.5 rounded-full mb-3">
                            Consumer Services
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-800">What We Offer</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: CreditCard, title: 'Online Bill Pay', desc: 'Pay your bills securely from anywhere, anytime.', color: 'bg-blue-100 text-blue-600' },
                            { icon: Zap, title: 'New Connection', desc: 'Apply for a fresh electricity connection in minutes.', color: 'bg-yellow-100 text-yellow-600' },
                            { icon: AlertTriangle, title: 'Complaint Management', desc: 'Register and track complaints 24/7 with real‑time updates.', color: 'bg-red-100 text-red-600' },
                            { icon: BarChart3, title: 'Live Analytics', desc: 'Monitor revenue, connections, and performance in dashboards.', color: 'bg-purple-100 text-purple-600' },
                        ].map((service, i) => {
                            const Icon = service.icon;
                            return (
                                <div key={i} className="group bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                                    <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                        <Icon size={28} />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h4>
                                    <p className="text-gray-500 leading-relaxed">{service.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── CALL TO ACTION ───────────────────────────────────────────── */}
            <section className="py-16 bg-emerald-700 text-white">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl font-bold">Get in Touch</h2>
                    <p className="mt-3 text-emerald-100">Have questions or need assistance? Reach out to our support team.</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <a href="#" className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                            <Phone className="w-5 h-5" /> Helpline: 16365
                        </a>
                        <a href="#" className="inline-flex items-center gap-2 bg-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-500 transition">
                            <AlertTriangle className="w-5 h-5" /> File a Complaint
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}