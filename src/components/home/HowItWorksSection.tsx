// src/components/home/HowItWorksSection.tsx
import { UserPlus, Gauge, CreditCard, LineChart, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Register',
    description: 'Create your free account in seconds. No paperwork needed.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Gauge,
    title: 'Claim Meter',
    description: 'Search and link your electricity meter to your account.',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: CreditCard,
    title: 'Pay Bills',
    description: 'Pay your monthly electricity bill securely via Stripe.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: LineChart,
    title: 'Track Everything',
    description: 'View bills, connections, complaints — all in one dashboard.',
    color: 'bg-purple-100 text-purple-600',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            How It Works
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Get started in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center relative z-10">
                  {/* Step number badge */}
                  <span className="absolute top-3 right-3 text-5xl font-bold text-gray-100 group-hover:text-emerald-100 transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connecting arrow (hidden on last item and mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 z-20">
                    <ArrowRight className="text-gray-300 w-6 h-6" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}