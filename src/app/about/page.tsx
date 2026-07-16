import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-3xl font-bold text-emerald-800 mb-6">About WZPDCL</h1>
                <p className="text-gray-600 leading-relaxed mb-4">
                    West Zone Power Distribution Company Limited (WZPDCL) is responsible for distributing
                    electricity in the Kushtia region. We provide reliable power supply, handle new
                    connections, bill management, and consumer complaints efficiently.
                </p>
                <p className="text-gray-600 leading-relaxed">
                    Our digital platform allows consumers to manage their accounts, pay bills, apply for
                    new connections, and track complaints — all from the comfort of their homes.
                </p>
            </main>
            <Footer />
        </div>
    );
}