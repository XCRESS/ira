import { BarChart3, ShieldCheck, Users, Briefcase } from 'lucide-react';

export const Features = () => {
  return (
    <section className="py-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm">Beyond the Checklist</h2>
          <h3 className="mt-2 text-3xl font-serif font-bold text-gray-900 sm:text-4xl">
            The IRA Deep-Dive Assessment
          </h3>
          <p className="mt-4 text-xl text-gray-500">
            Eligibility is just the first step. Our internal IRA tool analyzes over 50+ financial data points to ensure listing success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <BarChart3 className="w-6 h-6 text-white" />,
              title: "3-Year Financial Scan",
              desc: "We parse your balance sheets and P&L statements to identify growth patterns preferred by investors."
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-white" />,
              title: "Compliance Audit",
              desc: "Automated check against the latest SEBI regulations and exchange compliance norms."
            },
            {
              icon: <Users className="w-6 h-6 text-white" />,
              title: "Peer Benchmarking",
              desc: "Compare your metrics against recently listed competitors in your sector."
            },
            {
              icon: <Briefcase className="w-6 h-6 text-white" />,
              title: "Valuation Estimator",
              desc: "Get a preliminary valuation range based on current market sentiment and fundamentals."
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center mb-4 shadow-md">
                {feature.icon}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};