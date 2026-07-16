const steps = [
  { step: '01', title: 'Register', description: 'Create your account in seconds.' },
  { step: '02', title: 'Claim Meter', description: 'Link your meter number to your account.' },
  { step: '03', title: 'Pay Bills', description: 'Pay your monthly electricity bill online.' },
  { step: '04', title: 'Track Everything', description: 'View bills, connections & complaints.' },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}