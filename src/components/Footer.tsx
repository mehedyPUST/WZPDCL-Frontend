import Link from 'next/link';
import { Zap, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Top wave / gradient bar */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-3">
                        <Link href="/" className="flex items-center gap-2 text-white">
                            <div className="bg-emerald-600 p-1.5 rounded-lg">
                                <Zap size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-bold">WZPDCL</span>
                        </Link>
                        <p className="text-sm leading-relaxed">
                            West Zone Power Distribution Company Limited – Sales & Distribution Division‑1, Kushtia.
                        </p>
                        <div className="flex gap-3 pt-2">
                            {/* social icons – replace # with real links later */}
                            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56v14.88A4.56 4.56 0 0119.44 24H4.56A4.56 4.56 0 010 19.44V4.56A4.56 4.56 0 014.56 0h14.88A4.56 4.56 0 0124 4.56zm-7.48 4.15h-1.86c-.69 0-1.18.14-1.18 1.03v1.38h2.79l-.36 2.79h-2.43v7.11h-2.91v-7.11h-1.86v-2.79h1.86V9.64c0-2.26 1.32-3.48 3.34-3.48.97 0 1.8.07 2.05.1v2.45h-1.44z" /></svg>
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.57v-2.01c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.54-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17a4.66 4.66 0 011.23 3.22c0 4.61-2.8 5.63-5.47 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.82.57C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                            <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link></li>
                            <li><Link href="/pay-bill" className="hover:text-emerald-400 transition-colors">Pay Bill</Link></li>
                            <li><Link href="/register" className="hover:text-emerald-400 transition-colors">Register</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Services</h4>
                        <ul className="space-y-2 text-sm">
                            <li><span className="hover:text-emerald-400 transition-colors cursor-default">New Connection</span></li>
                            <li><span className="hover:text-emerald-400 transition-colors cursor-default">Bill Payment</span></li>
                            <li><span className="hover:text-emerald-400 transition-colors cursor-default">Complaint Management</span></li>
                            <li><span className="hover:text-emerald-400 transition-colors cursor-default">Meter Claim</span></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Contact</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <MapPin size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                                <span>S&D Division‑1, Kushtia, Bangladesh</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone size={16} className="text-emerald-400 shrink-0" />
                                <span>01322810864</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail size={16} className="text-emerald-400 shrink-0" />
                                <span>support@wzpdcl.gov.bd</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} WZPDCL. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}