import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { EligibilityCriteria } from '@/lib/landing-types';

interface EligibilityCheckerProps {
  onComplete: (eligible: boolean, missing: string[], failureReasons: string[], advice?: string) => void;
  onCancel: () => void;
}

const QUESTIONS: EligibilityCriteria[] = [
  {
    id: 'assets',
    label: 'Is the Net Tangible Assets equal to or greater than Rs 1.5 Crore?',
    description: 'Tangible assets minus total liabilities.',
    failureFeedback: 'Listing on BSE/NSE SME platforms requires a minimum Net Tangible Assets of Rs 1.5 Cr to ensure financial stability.'
  },
  {
    id: 'track_record_company',
    label: 'Does the company/firm have a combined track record of at least 3 years?',
    description: 'Operational history of the entity.',
    failureFeedback: 'Investors and regulators require a minimum 3-year operational track record to assess business sustainability.'
  },
  {
    id: 'net_worth',
    label: 'Does the entity have a positive net worth?',
    description: 'Assets minus liabilities must be positive.',
    failureFeedback: 'A positive net worth is a fundamental requirement for listing. Negative net worth indicates financial distress.'
  },
  {
    id: 'track_record_promoter',
    label: 'Does either the company or the promoter have a track record of at least three years?',
    description: 'Experience of the driving force behind the company.',
    failureFeedback: 'Promoter experience is critical. At least 3 years of track record is mandatory for the promoters or the company.'
  },
  {
    id: 'paid_up_capital',
    label: 'Is the post-issue paid-up capital (face value) less than or equal to Rs 25 crores?',
    description: 'Requirement for SME exchange listing.',
    failureFeedback: 'For SME exchanges, the post-issue paid-up capital must not exceed Rs 25 Crores.'
  }
];

export const EligibilityChecker: React.FC<EligibilityCheckerProps> = ({ onComplete, onCancel }) => {
  // State to store 'true' for Yes, 'false' for No. Undefined means unanswered.
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnswer = (id: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const allAnswered = QUESTIONS.every(q => answers[q.id] !== undefined);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    
    setIsAnalyzing(true);
    
    // Determine missing criteria (where answer is No)
    const missing: string[] = [];
    const failureReasons: string[] = [];

    QUESTIONS.forEach(q => {
      if (answers[q.id] === false) {
        missing.push(q.label);
        if (q.failureFeedback) {
          failureReasons.push(q.failureFeedback);
        }
      }
    });

    const isEligible = missing.length === 0;
    let advice = '';

    if (!isEligible) {
      // TODO: Integrate AI advice service later
      advice = 'Our team will provide personalized recommendations to help you meet the listing requirements.';
    }

    setIsAnalyzing(false);
    onComplete(isEligible, missing, failureReasons, advice);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up relative">
        
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="bg-brand-900 p-6 md:p-8 relative">
          <h2 className="text-2xl md:text-3xl font-serif text-white font-bold mb-2">
            Preliminary Eligibility Check
          </h2>
          <p className="text-brand-200 text-sm md:text-base pr-8">
            Please answer <span className="font-bold text-white">Yes</span> or <span className="font-bold text-white">No</span> to the following questions to verify your BSE/NSE SME readiness.
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {QUESTIONS.map((q) => {
            const answer = answers[q.id];
            return (
              <div key={q.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                <div className="mb-3">
                  <h3 className="font-medium text-gray-900 text-base md:text-lg">
                    {q.label}
                  </h3>
                  {q.description && (
                    <p className="text-xs text-gray-500 mt-1">{q.description}</p>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAnswer(q.id, true)}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all border ${
                      answer === true
                        ? 'bg-green-600 text-white border-green-600 shadow-md ring-2 ring-green-100'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleAnswer(q.id, false)}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all border ${
                      answer === false
                        ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-100'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <div className="text-xs text-gray-500 hidden sm:block">
            All fields are required *
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={isAnalyzing || !allAnswered}
            className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold shadow-lg flex items-center justify-center transition-all ${
              isAnalyzing || !allAnswered
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/30'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Financials...
              </>
            ) : (
              'Check My Score'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};