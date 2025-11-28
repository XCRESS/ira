import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import Link from 'next/link'
import { Building2, FileCheck, Users, TrendingUp, Shield, AlertCircle } from 'lucide-react'

export default function SMEExchangeRulesPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-brand-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
              BSE & NSE <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-amber-300">SME Rules</span>
            </h1>

            <p className="text-xl md:text-2xl text-brand-100 leading-relaxed">
              Complete guide to listing requirements for Indian SMEs
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-16">
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What is SME IPO?</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SME (Small and Medium Enterprise) IPO is a simplified listing process designed specifically for smaller companies looking to raise capital through public markets. Both BSE (Bombay Stock Exchange) and NSE (National Stock Exchange) operate dedicated SME platforms with relaxed eligibility criteria compared to mainboard listings.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The SME segment allows companies with post-issue paid-up capital of up to Rs 25 crores to get listed, providing easier access to capital markets for growing businesses.
              </p>
            </div>
          </section>

          {/* Key Eligibility Criteria */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Eligibility Criteria</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-brand-200 rounded-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center mr-4">
                    <Building2 className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Financial Requirements</h3>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 text-xl">✓</span>
                    <div>
                      <strong>Net Tangible Assets:</strong> Minimum Rs 1.5 crore (calculated as tangible assets minus total liabilities)
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 text-xl">✓</span>
                    <div>
                      <strong>Net Worth:</strong> Must be positive (assets exceed liabilities)
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 text-xl">✓</span>
                    <div>
                      <strong>Post-Issue Paid-Up Capital:</strong> Not exceeding Rs 25 crore (face value basis)
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white border-2 border-brand-200 rounded-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center mr-4">
                    <TrendingUp className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Track Record</h3>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 text-xl">✓</span>
                    <div>
                      <strong>Company Track Record:</strong> Minimum 3 years of operational history OR
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 text-xl">✓</span>
                    <div>
                      <strong>Promoter Track Record:</strong> Promoters must have at least 3 years of experience in the same business
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 text-xl">ℹ</span>
                    <div className="text-sm">
                      Note: Either the company OR the promoters must have a 3-year track record
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Issue Size & Structure */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Issue Size & Structure</h2>

            <div className="bg-gray-50 rounded-xl p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Minimum Issue Size</h3>
                  <p className="text-3xl font-bold text-brand-600 mb-2">Rs 1 Cr</p>
                  <p className="text-sm text-gray-600">Minimum amount to be raised through the IPO</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Allotment Size</h3>
                  <p className="text-3xl font-bold text-brand-600 mb-2">Rs 1-2 Lakh</p>
                  <p className="text-sm text-gray-600">Minimum application amount per investor</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Market Lot</h3>
                  <p className="text-3xl font-bold text-brand-600 mb-2">Rs 1 Lakh</p>
                  <p className="text-sm text-gray-600">Minimum trading lot size post-listing</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white border border-gray-200 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Reservation Categories</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-700 font-medium">Market Maker</span>
                  <span className="text-brand-600 font-bold">15%</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-700 font-medium">Retail Individual Investors (RII)</span>
                  <span className="text-brand-600 font-bold">Minimum 35%</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-700 font-medium">Non-Institutional Investors (NII)</span>
                  <span className="text-brand-600 font-bold">Balance</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Qualified Institutional Buyers (QIB)</span>
                  <span className="text-brand-600 font-bold">Optional</span>
                </div>
              </div>
            </div>
          </section>

          {/* Mandatory Requirements */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Mandatory Requirements</h2>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Market Maker</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Compulsory appointment of a SEBI-registered Market Maker for providing liquidity. The Market Maker must:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      <li>Provide two-way quotes (buy and sell) for a minimum period of 3 years</li>
                      <li>Maintain inventory of at least 5% of the total issued capital</li>
                      <li>Offer bid-ask spread not exceeding 10%</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-4 flex-shrink-0">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Promoter Lock-in</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Promoter shareholding is subject to lock-in requirements:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      <li><strong>20% of post-issue capital:</strong> Locked for 3 years from listing date</li>
                      <li><strong>Remaining promoter holding:</strong> Locked for 1 year from listing date</li>
                      <li>Applies to promoters, promoter group, and persons in control</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-4 flex-shrink-0">
                    <FileCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Mandatory Documents</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>Draft Red Herring Prospectus (DRHP)</li>
                        <li>3 years audited financials</li>
                        <li>Board resolution approving IPO</li>
                        <li>Certificate of Incorporation</li>
                      </ul>
                      <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>MOA & AOA</li>
                        <li>Due diligence certificate</li>
                        <li>SEBI observation letter</li>
                        <li>IPO grading (optional)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Listing Process */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Listing Process Timeline</h2>

            <div className="space-y-4">
              {[
                { step: "1", title: "Appoint Merchant Banker", duration: "1 week", description: "Select and appoint SEBI-registered merchant banker (lead manager)" },
                { step: "2", title: "Due Diligence", duration: "2-3 weeks", description: "Financial, legal, and business due diligence by merchant banker" },
                { step: "3", title: "DRHP Preparation", duration: "3-4 weeks", description: "Draft Red Herring Prospectus preparation with all disclosures" },
                { step: "4", title: "SEBI Filing", duration: "1 week", description: "File DRHP with SEBI for review and observations" },
                { step: "5", title: "SEBI Observations", duration: "4-6 weeks", description: "SEBI reviews DRHP and provides observations/comments" },
                { step: "6", title: "RHP Filing", duration: "1 week", description: "Incorporate SEBI observations and file Red Herring Prospectus" },
                { step: "7", title: "IPO Marketing", duration: "1-2 weeks", description: "Roadshows and investor meetings (if applicable)" },
                { step: "8", title: "IPO Opening", duration: "3 days", description: "IPO opens for subscription (minimum 3 working days)" },
                { step: "9", title: "Allotment & Listing", duration: "1-2 weeks", description: "Share allotment and stock exchange listing" }
              ].map((item, index) => (
                <div key={index} className="flex items-start bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0 mr-6">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                      <span className="text-sm font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full ml-4">
                        {item.duration}
                      </span>
                    </div>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
              <p className="text-gray-700">
                <strong>Total Timeline:</strong> The entire SME IPO process typically takes 4-6 months from start to listing, assuming no major delays or complications.
              </p>
            </div>
          </section>

          {/* Costs Involved */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Estimated Costs</h2>

            <div className="bg-gray-50 rounded-xl p-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-700 font-medium">Merchant Banker Fees</span>
                  <span className="text-gray-900 font-bold">3-5% of issue size</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-700 font-medium">Legal Fees</span>
                  <span className="text-gray-900 font-bold">Rs 3-5 lakhs</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-700 font-medium">Registrar Fees</span>
                  <span className="text-gray-900 font-bold">Rs 2-4 lakhs</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-700 font-medium">Printing & Advertising</span>
                  <span className="text-gray-900 font-bold">Rs 5-10 lakhs</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-700 font-medium">SEBI Filing Fees</span>
                  <span className="text-gray-900 font-bold">Rs 50,000-2 lakhs</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-700 font-medium">Exchange Listing Fees</span>
                  <span className="text-gray-900 font-bold">Rs 5-10 lakhs</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-700 font-medium">Market Maker Fees</span>
                  <span className="text-gray-900 font-bold">Rs 5-15 lakhs</span>
                </div>
                <div className="flex justify-between items-center pt-3 bg-brand-50 -mx-4 px-4 py-3 rounded">
                  <span className="text-gray-900 font-bold text-lg">Total Estimated Cost</span>
                  <span className="text-brand-600 font-bold text-xl">Rs 25-60 lakhs</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              * Costs vary based on issue size, complexity, and service providers. The above are indicative estimates only.
            </p>
          </section>

          {/* Benefits */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits of SME Listing</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-900 mb-4">Financial Benefits</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Access to capital for business expansion</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Improved valuation and liquidity for shareholders</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Better credit rating and negotiating power</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Exit opportunity for early investors</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Strategic Benefits</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Enhanced brand visibility and credibility</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Ability to attract and retain talent with ESOPs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Pathway to mainboard listing (migration option)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Improved corporate governance and transparency</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Post-Listing Compliance */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Post-Listing Compliance</h2>

            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quarterly Requirements</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Financial results (unaudited)</li>
                    <li>• Corporate governance report</li>
                    <li>• Shareholding pattern</li>
                    <li>• Investor grievances report</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Annual Requirements</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Audited financial statements</li>
                    <li>• Annual report</li>
                    <li>• AGM within statutory timelines</li>
                    <li>• Secretarial audit report</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-brand-900 to-brand-800 text-white rounded-2xl p-12">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Your SME IPO Journey?
              </h2>
              <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
                Check if your company meets the eligibility criteria with our free preliminary assessment.
              </p>
              <Link
                href="/"
                className="inline-block bg-gold-600 hover:bg-gold-500 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all hover:scale-105"
              >
                Start Free Eligibility Check
              </Link>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-12">
            <p className="text-sm text-gray-800">
              <strong>Disclaimer:</strong> The information provided on this page is for general guidance only and should not be considered as legal, financial, or professional advice. SME exchange rules and regulations are subject to change by SEBI and stock exchanges. Please consult with qualified professionals for specific advice related to your company's IPO.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
