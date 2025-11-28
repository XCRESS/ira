import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import Link from 'next/link'
import { FileText, Scale, Handshake, AlertCircle } from 'lucide-react'

export default function TermsOfServicePage() {
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
              Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-amber-300">Service</span>
            </h1>

            <p className="text-xl md:text-2xl text-brand-100 leading-relaxed">
              Clear rules for using IRA Score
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <p className="text-gray-600 text-sm mb-12 text-center">
          Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing or using the IRA Score platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              IRA Score is an IPO Readiness Assessment platform designed to help Indian companies evaluate their readiness for listing on BSE/NSE SME exchanges. Our Service includes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Preliminary eligibility assessment tools</li>
              <li>Comprehensive IPO readiness scoring</li>
              <li>Financial analysis and recommendations</li>
              <li>Consultation services with our financial experts</li>
              <li>Educational resources about SME exchange listing requirements</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Registration</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              To access certain features of the Service, you may be required to register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept all responsibility for activity that occurs under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Account Termination</h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for any reason, including violation of these Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to use the Service:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>For any unlawful purpose or in violation of any applicable laws</li>
              <li>To transmit any harmful code, viruses, or malware</li>
              <li>To impersonate any person or entity</li>
              <li>To interfere with or disrupt the Service or servers</li>
              <li>To collect or harvest any personally identifiable information</li>
              <li>To engage in any automated use of the system</li>
              <li>To upload or transmit false or misleading information</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property Rights</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.1 Our Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service and its original content, features, and functionality are owned by IRA Score Financial Services and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.2 Your Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You retain ownership of any content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content for the purpose of providing the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Financial Disclaimer</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
              <p className="text-gray-900 font-semibold mb-2">Important Notice</p>
              <p className="text-gray-700 leading-relaxed mb-4">
                The information and assessments provided through our Service are for informational purposes only and do not constitute:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Financial, investment, legal, or accounting advice</li>
                <li>A guarantee or promise of IPO success</li>
                <li>An offer or solicitation to buy or sell securities</li>
                <li>A substitute for professional consultation</li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed">
              You should consult with qualified professionals including chartered accountants, lawyers, and investment bankers before making any decisions regarding IPO listing. Past performance and assessments do not guarantee future results.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the maximum extent permitted by law, IRA Score Financial Services shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Loss of profits, revenue, or data</li>
              <li>Business interruption</li>
              <li>Loss of goodwill or reputation</li>
              <li>Cost of substitute services</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Our total liability to you for all claims arising from the use of the Service shall not exceed the amount you paid us in the twelve (12) months prior to the claim.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless IRA Score Financial Services, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Service may contain links to third-party websites or services that are not owned or controlled by IRA Score. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Confidentiality</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We understand that the financial information you share with us is highly confidential. We commit to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Maintaining strict confidentiality of all client information</li>
              <li>Not sharing your data with unauthorized third parties</li>
              <li>Implementing industry-standard security measures</li>
              <li>Using your information solely for the purpose of providing our Service</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              For more details, please refer to our <Link href="/privacy-policy" className="text-brand-600 hover:text-brand-700 underline">Privacy Policy</Link>.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Service Modifications</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify or discontinue the Service (or any part thereof) at any time with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of any changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Posting the new Terms on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending an email notification (for material changes)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-900 font-semibold mb-2">IRA Score Financial Services</p>
              <p className="text-gray-700">Email: <a href="mailto:piyush@cosmosfin.com" className="text-brand-600 hover:text-brand-700">piyush@cosmosfin.com</a></p>
              <p className="text-gray-700">Address: C-756 NFC, New Delhi, 110025</p>
            </div>
          </section>

          <div className="bg-brand-50 border border-brand-200 rounded-lg p-6 mt-12">
            <p className="text-sm text-brand-800">
              <strong>Acknowledgment:</strong> By using the IRA Score platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
