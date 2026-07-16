import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-3xl font-bold text-emerald-800 mb-6">Contact Us</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                        <p className="text-gray-600 mb-2"><strong>Office:</strong> S&D Division-1, Kushtia</p>
                        <p className="text-gray-600 mb-2"><strong>Phone:</strong> 01322810864</p>
                        <p className="text-gray-600 mb-2"><strong>Email:</strong> support@wzpdcl.gov.bd</p>
                    </div>
                    <form className="space-y-4">
                        <input type="text" placeholder="Your Name" className="w-full border border-gray-200 rounded-lg px-4 py-2.5" />
                        <input type="email" placeholder="Your Email" className="w-full border border-gray-200 rounded-lg px-4 py-2.5" />
                        <textarea rows={4} placeholder="Your Message" className="w-full border border-gray-200 rounded-lg px-4 py-2.5" />
                        <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Send Message</button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}