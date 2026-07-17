// src/components/home/FAQSection.tsx
'use client';

import { useState, useMemo } from 'react';
import { HelpCircle, ChevronDown, Search, Mail } from 'lucide-react';
import Link from 'next/link';

const faqs = [
    {
        q: 'How do I claim my meter?',
        a: 'After logging in, go to <strong>My Bills → Claim a Meter</strong> and search your meter number. If the meter is available, click "Claim" to link it to your account.',
        category: 'meter',
    },
    {
        q: 'Can I pay bills without logging in?',
        a: 'Yes! Use the <strong>Pay Bill</strong> button on the homepage. Simply enter your meter number, find the unpaid bill, and pay securely via Stripe.',
        category: 'billing',
    },
    {
        q: 'How to apply for a new connection?',
        a: 'Log in, go to <strong>Connections → Apply New Connection</strong>, fill out the form, and pay the application fee. Your request will be reviewed by XEN.',
        category: 'connection',
    },
    {
        q: 'How long does it take to get a new connection?',
        a: 'After payment and XEN approval, the Connection Wing dispatches a team. Typically, the entire process takes 5-10 working days.',
        category: 'connection',
    },
    {
        q: 'What should I do if my bill is incorrect?',
        a: 'First, check your meter reading. If there is a discrepancy, register a complaint under <strong>My Complaints</strong>. The Billing Wing will review and adjust if necessary.',
        category: 'billing',
    },
    {
        q: 'How can I track my complaint status?',
        a: 'Visit <strong>My Complaints</strong> in your dashboard. You will see real‑time updates: Pending → Team Sent → Resolved.',
        category: 'complaints',
    },
    {
        q: 'Is there a fee for registering a complaint?',
        a: 'No, registering a complaint is completely free for all consumers.',
        category: 'complaints',
    },
    {
        q: 'Can I change my registered email or phone number?',
        a: 'Yes, go to <strong>Profile</strong> in your dashboard and update your personal information.',
        category: 'account',
    },
];

const categoryLabels: Record<string, string> = {
    all: 'All Questions',
    meter: 'Meter & Billing',
    connection: 'New Connection',
    complaints: 'Complaints',
    account: 'Account',
};

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredFaqs = useMemo(() => {
        let result = faqs;
        if (activeCategory !== 'all') {
            result = result.filter(f => f.category === activeCategory);
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                f =>
                    f.q.toLowerCase().includes(term) ||
                    f.a.toLowerCase().replace(/<[^>]*>/g, '').includes(term)
            );
        }
        return result;
    }, [searchTerm, activeCategory]);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-4">
                        <HelpCircle className="text-emerald-600" size={28} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                        Quick answers to common queries about our services
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search your question..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50"
                    />
                </div>

                {/* Category chips */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {Object.entries(categoryLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => { setActiveCategory(key); setOpenIndex(null); }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === key
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-3">
                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <HelpCircle size={40} className="mx-auto mb-3 opacity-30" />
                            <p>No questions found matching your search.</p>
                            <p className="text-sm">Try a different keyword or browse the categories above.</p>
                        </div>
                    ) : (
                        filteredFaqs.map((faq, i) => {
                            const isOpen = openIndex === i;
                            return (
                                <div
                                    key={i}
                                    className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-gray-300"
                                >
                                    <button
                                        onClick={() => toggleAccordion(i)}
                                        className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50/50 transition-colors"
                                    >
                                        <span className="font-semibold text-gray-800 pr-4">
                                            {faq.q}
                                        </span>
                                        <ChevronDown
                                            size={20}
                                            className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        <p
                                            className="px-4 pb-4 text-sm text-gray-600 leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: faq.a }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Still have questions? */}
                <div className="mt-12 text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <Mail size={24} className="text-emerald-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-800 mb-1">Still have questions?</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Can&apos;t find the answer you&apos;re looking for? Reach out to our support team.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        <Mail size={16} />
                        Contact Support
                    </Link>
                </div>
            </div>
        </section>
    );
}