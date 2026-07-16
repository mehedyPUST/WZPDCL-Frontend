import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-300 py-10">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-white text-lg font-bold mb-2">WZPDCL</h3>
                    <p className="text-sm">Sales & Distribution Division-1, Kushtia</p>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-2">Quick Links</h4>
                    <ul className="space-y-1 text-sm">
                        <li><Link href="/" className="hover:text-white">Home</Link></li>
                        <li><Link href="/about" className="hover:text-white">About</Link></li>
                        <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-2">Contact</h4>
                    <p className="text-sm">📞 01322810864</p>
                    <p className="text-sm">✉️ support@wzpdcl.gov.bd</p>
                </div>
            </div>
            <div className="text-center text-sm text-gray-500 mt-8 border-t border-gray-700 pt-4">
                © {new Date().getFullYear()} WZPDCL. All rights reserved.
            </div>
        </footer>
    );
}