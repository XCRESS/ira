import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import Link from 'next/link'
import { CheckCircle, TrendingUp, FileText, Users, BarChart3, Shield } from 'lucide-react'

export default function MethodologyPage() {
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
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-amber-300">Methodology</span>
            </h1>

            <p className="text-xl md:text-2xl text-brand-100 leading-relaxed">
              How we calculate your IPO readiness score
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-16">
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The IRA Score Framework</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our IPO Readiness Assessment (IRA) methodology is built on years of investment banking experience and deep understanding of Indian capital markets. We've distilled the complex IPO listing requirements into a structured, 57-question framework that evaluates companies across four critical dimensions.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The IRA Score provides a quantitative measure of your company's readiness to list on BSE/NSE SME exchanges, combining regulatory compliance, financial strength, operational maturity, and sector-specific factors.
              </p>
            </div>
          </section>

          {/* The 4 Assessment Pillars */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Four Assessment Pillars</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Pillar 1 */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-6">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Eligibility Criteria</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Foundation-level requirements mandated by SEBI and stock exchanges for SME listing.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Net Tangible Assets (≥ Rs 1.5 Cr)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Track record (company/promoter ≥ 3 years)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Positive net worth</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Post-issue paid-up capital (≤ Rs 25 Cr)</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Financial Health</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Deep-dive analysis of your financial statements, ratios, and growth trajectory.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Revenue growth trends (3-year CAGR)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Profitability metrics (EBITDA, PAT margins)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Debt-to-equity ratio and liquidity</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Working capital management</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Company Readiness</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Organizational structure, governance, and operational maturity for public listing.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Corporate governance practices</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Board composition and independence</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Internal controls and compliance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Management team strength</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 4 */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">4. Sector-Specific Factors</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Industry-specific considerations that impact listing success and investor appeal.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Market positioning and competitive advantage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Sector growth potential</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>Regulatory compliance (sector-specific)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>ESG and sustainability factors</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Scoring System */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">How We Calculate Your IRA Score</h2>

            <div className="bg-gray-50 rounded-xl p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Question Scoring Framework</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                    +2
                  </div>
                  <p className="font-semibold text-gray-900">Yes</p>
                  <p className="text-sm text-gray-600">Criteria fully met</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                    +1
                  </div>
                  <p className="font-semibold text-gray-900">Maybe</p>
                  <p className="text-sm text-gray-600">Partially met</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                    -1
                  </div>
                  <p className="font-semibold text-gray-900">No</p>
                  <p className="text-sm text-gray-600">Not met</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-400 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                    0
                  </div>
                  <p className="font-semibold text-gray-900">N/A</p>
                  <p className="text-sm text-gray-600">Not applicable</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Final Rating Categories</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-24 h-24 rounded-lg bg-green-50 border-2 border-green-500 flex items-center justify-center flex-shrink-0 mr-6">
                    <span className="text-2xl font-bold text-green-600">&gt;65%</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-green-600 mb-2">IPO Ready</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Your company meets or exceeds the critical requirements for SME listing. You can proceed with IPO preparation with high confidence. Recommended next steps: Engage merchant banker, prepare DRHP, and initiate compliance audit.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-24 h-24 rounded-lg bg-yellow-50 border-2 border-yellow-500 flex items-center justify-center flex-shrink-0 mr-6">
                    <span className="text-xl font-bold text-yellow-600">45-65%</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-yellow-600 mb-2">Needs Improvement</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Your company shows potential but has specific gaps that need to be addressed. With targeted improvements over 6-12 months, you can achieve IPO readiness. We'll provide a customized action plan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-24 h-24 rounded-lg bg-red-50 border-2 border-red-500 flex items-center justify-center flex-shrink-0 mr-6">
                    <span className="text-2xl font-bold text-red-600">&lt;45%</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-red-600 mb-2">Not Ready</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Significant gaps exist across multiple dimensions. Listing is not advisable at this stage. Focus on fundamental business strengthening. Estimated timeline: 18-24 months of structured development required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Sources */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Data Sources & Validation</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-6 h-6 text-brand-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Financial Documents</h3>
                </div>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Audited financial statements (last 3 years)</li>
                  <li>• Tax returns and GST filings</li>
                  <li>• Management Information System (MIS) reports</li>
                  <li>• Cash flow statements and projections</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Shield className="w-6 h-6 text-brand-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Legal & Compliance</h3>
                </div>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Certificate of Incorporation</li>
                  <li>• Board resolutions and shareholder agreements</li>
                  <li>• Regulatory licenses and approvals</li>
                  <li>• Litigation status and IP documentation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Process Timeline */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Assessment Process</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-brand-200 hidden md:block"></div>

              <div className="space-y-8">
                {[
                  {
                    step: "1",
                    title: "Preliminary Eligibility Check",
                    duration: "5 minutes",
                    description: "Quick online assessment covering the 5 fundamental eligibility criteria. Get instant results."
                  },
                  {
                    step: "2",
                    title: "Document Submission",
                    duration: "1-2 days",
                    description: "Upload financial statements, legal documents, and other required materials through our secure portal."
                  },
                  {
                    step: "3",
                    title: "Detailed Analysis",
                    duration: "3-5 days",
                    description: "Our experts analyze your data across all 57 questions, validating claims and calculating your IRA Score."
                  },
                  {
                    step: "4",
                    title: "Score Delivery & Consultation",
                    duration: "1 day",
                    description: "Receive your comprehensive report with actionable recommendations. Schedule a consultation with our IPO advisor."
                  }
                ].map((item, index) => (
                  <div key={index} className="relative flex items-start md:ml-20">
                    <div className="absolute -left-20 hidden md:flex w-16 h-16 rounded-full bg-brand-600 text-white items-center justify-center text-2xl font-bold shadow-lg">
                      {item.step}
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 flex-1 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                        <span className="text-sm font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                          {item.duration}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why Trust Our Methodology */}
          <section className="mb-16">
            <div className="bg-brand-900 text-white rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">Why Trust Our Methodology?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-gold-500 mb-2">15+</div>
                  <p className="text-brand-100">Years of investment banking experience</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gold-500 mb-2">50+</div>
                  <p className="text-brand-100">Successful SME IPO listings supported</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gold-500 mb-2">100%</div>
                  <p className="text-brand-100">SEBI-compliant assessment framework</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-brand-50 to-gold-50 rounded-2xl p-12 border border-brand-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Get Your IRA Score?
              </h2>
              <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
                Start with our free preliminary eligibility check. It takes less than 5 minutes and gives you immediate feedback.
              </p>
              <Link
                href="/"
                className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all hover:scale-105"
              >
                Start Free Assessment
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
