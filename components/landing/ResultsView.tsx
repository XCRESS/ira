import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, Lock, FileText, AlertTriangle, X } from 'lucide-react';

interface ResultsViewProps {
  isEligible: boolean;
  missingCriteria: string[];
  failureReasons?: string[];
  advice?: string;
  onReset: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ isEligible, missingCriteria, failureReasons = [], advice, onReset }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleLeadGen = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Logic to send email to backend would go here
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in-up relative flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onReset}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10 p-1 bg-white/50 rounded-full hover:bg-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Section */}
        <div className={`p-8 text-center flex-shrink-0 ${isEligible ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-white shadow-sm">
            {isEligible ? (
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>
          <h2 className={`text-3xl font-serif font-bold mb-2 ${isEligible ? 'text-green-800' : 'text-red-900'}`}>
            {isEligible ? "You Are IPO Ready!" : "Eligibility Gaps Identified"}
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            {isEligible
              ? "Your company meets the preliminary criteria for BSE/NSE SME listing."
              : "Your company is currently not meeting the standard eligibility criteria for the following reasons:"}
          </p>
        </div>

        {/* Content Section */}
        <div className="p-8 overflow-y-auto flex-1">
          
          {!isEligible && (
            <div className="mb-8">
              <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Why 'Yes' was required:
                </h3>
                <ul className="space-y-3">
                  {failureReasons.length > 0 ? (
                    failureReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700 bg-white p-3 rounded-md border border-red-100 shadow-sm">
                        <span className="mr-2 text-red-500 font-bold">•</span>
                        {reason}
                      </li>
                    ))
                  ) : (
                    // Fallback if failureReasons not provided
                    missingCriteria.map((crit, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700">
                        <span className="mr-2 text-red-500">•</span>
                        Criteria not met: {crit}
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {advice && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                  <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">AI Consultant Insight</div>
                  <p className="text-blue-900 text-sm italic">"{advice}"</p>
                </div>
              )}
            </div>
          )}

          {/* CTA / Lead Gen */}
          <div className="bg-brand-900 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">
                {isEligible ? "Get Your Official IRA Score™" : "Build Your Recovery Plan"}
              </h3>
              <p className="text-brand-100 text-sm mb-6">
                {submitted 
                  ? "Thank you! Our financial team will contact you shortly to schedule your deep-dive assessment."
                  : "Unlock access to our internal IRA tool. Our finance team uses 3 years of financial data to calculate your precise listing probability score."}
              </p>

              {submitted ? (
                <button onClick={onReset} className="text-sm underline text-brand-200 hover:text-white">
                  Done
                </button>
              ) : (
                <form onSubmit={handleLeadGen} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Enter work email"
                      className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 border border-brand-700"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-gold-600 hover:bg-gold-500 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center transition-colors"
                  >
                    {isEligible ? "Calculate IRA Score" : "Get Improvement Plan"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </form>
              )}
            </div>
            
            {/* Decorative lock icon background */}
            <Lock className="absolute -bottom-6 -right-6 w-32 h-32 text-brand-800 opacity-50" />
          </div>

          <div className="mt-6 flex items-center justify-center text-xs text-gray-500">
            <FileText className="w-3 h-3 mr-1" />
            <span>Strictly confidential. No data is shared with third parties.</span>
          </div>
        </div>
      </div>
    </div>
  );
};