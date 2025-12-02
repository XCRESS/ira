export interface EligibilityCriteria {
  id: string;
  label: string;
  description?: string;
  failureFeedback?: string; // Explanation for why 'No' is an issue
}

export interface AssessmentResult {
  isEligible: boolean;
  score: number;
  missingCriteria: string[]; // Labels of criteria that failed
  failureReasons: string[]; // Specific feedback for why they failed
  advice?: string;
}

export enum Step {
  LANDING = 'LANDING',
  ASSESSMENT = 'ASSESSMENT',
  RESULTS = 'RESULTS',
  LEAD_FORM = 'LEAD_FORM',
  SUCCESS = 'SUCCESS'
}