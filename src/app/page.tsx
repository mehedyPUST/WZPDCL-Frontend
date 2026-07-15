import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-primary-800 mb-4">
          Power Distribution Made Simple
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Manage your electricity connections, pay bills, and track complaints — all in one place.
        </p>
        <Link
          href="/register"
          className="bg-primary-500 text-white px-8 py-3 rounded-lg text-lg hover:bg-primary-600 inline-block"
        >
          Get Started
        </Link>
      </section>
    </div>
  );
}