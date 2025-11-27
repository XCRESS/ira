import { ClipboardCheck, LineChart, Building } from 'lucide-react';

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-gray-50" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm">Our Process</h2>
          <h3 className="mt-2 text-3xl font-serif font-bold text-gray-900 sm:text-4xl">
            Your Journey to Listing
          </h3>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            From initial check to ringing the bell, we guide you through every step of the IPO process.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <ClipboardCheck className="w-8 h-8 text-brand-600 group-hover:text-white" />
              </div>
              <div className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">STEP 1</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Check Eligibility</h4>
              <p className="text-gray-600 text-sm">
                Use our free instant tool on irascore.com to check if you meet the basic criteria for BSE/NSE listing. It takes less than 2 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <LineChart className="w-8 h-8 text-brand-600 group-hover:text-white" />
              </div>
              <div className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">STEP 2</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">IRA Deep Dive</h4>
              <p className="text-gray-600 text-sm">
                Our internal IRA tool analyzes your last 3 years of financial data, compliance history, and sector performance to generate your readiness score.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Building className="w-8 h-8 text-brand-600 group-hover:text-white" />
              </div>
              <div className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">STEP 3</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">IPO Listing</h4>
              <p className="text-gray-600 text-sm">
                If eligible, we manage your DRHP filing, merchant banker selection, and roadshows. If not, we provide a strategic plan to get you there.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};