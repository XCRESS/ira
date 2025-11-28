
export const Testimonials = () => {
  return (
    <section className="py-24 bg-brand-50 border-t border-brand-100" id="success-stories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">
              "They didn't just tell us we were ready; they helped us get listed."
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We started with a simple eligibility check on irascore.com. The IRA team then helped us restructure our assets to meet the 1.5 Cr NTA requirement, guiding us all the way to the bell-ringing ceremony.
            </p>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-gray-300 mr-4 flex-shrink-0">
                 <img src="https://picsum.photos/100/100" alt="CEO" className="rounded-full h-full w-full object-cover" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Rajesh Kumar</div>
                <div className="text-brand-600 text-sm">Managing Director, Apollo Green Energy</div>
              </div>
            </div>
          </div>
          <div className="relative px-4 md:px-0">
             <div className="absolute inset-0 md:-inset-4 bg-gold-500/20 rounded-2xl transform rotate-3"></div>
            <img
              src="https://picsum.photos/600/400"
              alt="Apollo Green Energy Listing Ceremony"
              className="relative rounded-xl shadow-2xl w-full object-cover h-64 md:h-80 grayscale hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
              <span className="text-brand-900 font-bold text-xs uppercase tracking-wide">Listing Day</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};