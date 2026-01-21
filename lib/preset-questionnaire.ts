/**
 * Preset Questionnaire Definitions
 * 
 * Defines the 11 preset questions for IPO readiness assessment.
 * These replace the dynamic question bank system.
 */

// ============================================================================
// Question Definitions
// ============================================================================

export const PRESET_QUESTIONS = {
  // Q1: Investment Plan
  q1_investment_plan: {
    id: 'q1_investment_plan',
    number: 1,
    label: 'Are you ready with your investment plan?',
    type: 'boolean' as const,
    section: 'readiness',
    maxScore: 10,
  },

  // Q2: Corporate Governance (4 sub-questions, 1 point each = 4 points max)
  q2a_governance_plan: {
    id: 'q2a_governance_plan',
    number: '2A',
    label: 'Is the corporate governance plan in place with at least the requirements of Indian corporate listing norms?',
    type: 'boolean' as const,
    section: 'governance',
    maxScore: 1,
  },
  q2b_financial_reporting: {
    id: 'q2b_financial_reporting',
    number: '2B',
    label: 'Does your financial reporting comply with statutory laws, rules, listing norms, accounting standards, etc.?',
    type: 'boolean' as const,
    section: 'governance',
    maxScore: 1,
  },
  q2c_control_systems: {
    id: 'q2c_control_systems',
    number: '2C',
    label: 'Does your company have robust financial, operational, and internal control systems ensuring effective governance and risk management?',
    type: 'boolean' as const,
    section: 'governance',
    maxScore: 1,
  },
  q2d_shareholding_clear: {
    id: 'q2d_shareholding_clear',
    number: '2D',
    label: 'Is your shareholding clear and transparent?',
    type: 'boolean' as const,
    section: 'governance',
    maxScore: 1,
  },

  // Q3: Right Team (4 sub-questions, 1 point each = 4 points max)
  q3a_senior_management: {
    id: 'q3a_senior_management',
    number: '3A',
    label: 'Does the company have a professional and well-qualified senior management team with industry experience and a good track record?',
    type: 'boolean' as const,
    section: 'team',
    maxScore: 1,
  },
  q3b_independent_board: {
    id: 'q3b_independent_board',
    number: '3B',
    label: 'Are there credible independent members on the board who add value to the company?',
    type: 'boolean' as const,
    section: 'team',
    maxScore: 1,
  },
  q3c_mid_management: {
    id: 'q3c_mid_management',
    number: '3C',
    label: 'Is there experienced staff at the mid-management level?',
    type: 'boolean' as const,
    section: 'team',
    maxScore: 1,
  },
  q3d_key_personnel: {
    id: 'q3d_key_personnel',
    number: '3D',
    label: 'Are key personnel within the organization recognized as per accepted market practices, regulatory norms, and corporate governance requirements (e.g., compliance officer appointed)?',
    type: 'boolean' as const,
    section: 'team',
    maxScore: 1,
  },

  // Q4-Q11: Financial Data (variable scoring)
  q4_paid_up_capital: {
    id: 'q4_paid_up_capital',
    number: 4,
    label: 'Enter the present paid-up capital of your company as per the last audited balance sheet.',
    helpText: 'Amount in Crores (₹)',
    type: 'number' as const,
    section: 'financial',
    unit: 'crores',
    maxScore: 10,
  },
  q5_outstanding_shares: {
    id: 'q5_outstanding_shares',
    number: 5,
    label: 'Enter the number of shares outstanding as per the last audited balance sheet.',
    helpText: 'Total number of shares',
    type: 'number' as const,
    section: 'financial',
    unit: 'shares',
    maxScore: 2.5,
  },
  q6_net_worth: {
    id: 'q6_net_worth',
    number: 6,
    label: "Enter your company's net worth.",
    helpText: 'Amount in Crores (₹)',
    type: 'number' as const,
    section: 'financial',
    unit: 'crores',
    maxScore: 10,
  },
  q7_borrowings: {
    id: 'q7_borrowings',
    number: 7,
    label: "Enter your company's short-term and long-term borrowings.",
    helpText: 'Combined total in Crores (₹)',
    type: 'number' as const,
    section: 'financial',
    unit: 'crores',
    maxScore: 5,
  },
  q8_debt_equity_ratio: {
    id: 'q8_debt_equity_ratio',
    number: 8,
    label: "Enter your company's Debt–Equity Ratio.",
    helpText: 'Ratio value (e.g., 0.5, 1.0, 1.5)',
    type: 'number' as const,
    section: 'financial',
    unit: 'ratio',
    maxScore: 10,
  },
  q9_turnover: {
    id: 'q9_turnover',
    number: 9,
    label: "Enter your company's turnover for the last 3 years.",
    helpText: 'Amount in Crores (₹) for each year',
    type: 'array' as const,
    section: 'financial',
    unit: 'crores',
    maxScore: 7.5,
    arrayLength: 3,
    yearLabels: ['Year 1 (Latest)', 'Year 2', 'Year 3'],
  },
  q10_ebitda: {
    id: 'q10_ebitda',
    number: 10,
    label: "Enter your company's EBITDA for the last 3 years.",
    helpText: 'Amount in Crores (₹) for each year',
    type: 'array' as const,
    section: 'financial',
    unit: 'crores',
    maxScore: 15,
    arrayLength: 3,
    yearLabels: ['Year 1 (Latest)', 'Year 2', 'Year 3'],
  },
  q11_eps: {
    id: 'q11_eps',
    number: 11,
    label: "Enter your company's Earnings Per Share (EPS).",
    helpText: 'Value in ₹',
    type: 'number' as const,
    section: 'financial',
    unit: 'rupees',
    maxScore: 5,
  },
} as const

// ============================================================================
// Types
// ============================================================================

export type PresetQuestionId = keyof typeof PRESET_QUESTIONS

export type PresetAnswers = {
  // Q1
  q1_investment_plan: boolean | null
  
  // Q2: Governance
  q2a_governance_plan: boolean | null
  q2b_financial_reporting: boolean | null
  q2c_control_systems: boolean | null
  q2d_shareholding_clear: boolean | null
  
  // Q3: Team
  q3a_senior_management: boolean | null
  q3b_independent_board: boolean | null
  q3c_mid_management: boolean | null
  q3d_key_personnel: boolean | null
  
  // Q4-Q11: Financial
  q4_paid_up_capital: number | null
  q5_outstanding_shares: number | null
  q6_net_worth: number | null
  q7_borrowings: number | null
  q8_debt_equity_ratio: number | null
  q9_turnover: [number | null, number | null, number | null]
  q10_ebitda: [number | null, number | null, number | null]
  q11_eps: number | null
}

// ============================================================================
// Grouped Questions for UI
// ============================================================================

export const QUESTION_SECTIONS = {
  readiness: {
    title: 'IPO Readiness',
    description: 'Assess your preparation for going public',
    questions: ['q1_investment_plan'],
  },
  governance: {
    title: 'Corporate Governance',
    description: 'About your company\'s Corporate Governance Structure',
    questions: ['q2a_governance_plan', 'q2b_financial_reporting', 'q2c_control_systems', 'q2d_shareholding_clear'],
  },
  team: {
    title: 'Right Team',
    description: 'Do you have the right team?',
    questions: ['q3a_senior_management', 'q3b_independent_board', 'q3c_mid_management', 'q3d_key_personnel'],
  },
  financial: {
    title: 'Financial Data',
    description: 'Enter your company financial information',
    questions: ['q4_paid_up_capital', 'q5_outstanding_shares', 'q6_net_worth', 'q7_borrowings', 'q8_debt_equity_ratio', 'q9_turnover', 'q10_ebitda', 'q11_eps'],
  },
} as const

// Get ordered list of all question IDs
export const ORDERED_QUESTION_IDS = Object.values(QUESTION_SECTIONS)
  .flatMap(section => section.questions) as PresetQuestionId[]

// Calculate max possible score
export const MAX_POSSIBLE_SCORE = Object.values(PRESET_QUESTIONS)
  .reduce((sum, q) => sum + q.maxScore, 0)

// Helper to check if all required questions are answered
export function areAllQuestionsAnswered(answers: Partial<PresetAnswers>): boolean {
  return (
    answers.q1_investment_plan != null &&
    answers.q2a_governance_plan != null &&
    answers.q2b_financial_reporting != null &&
    answers.q2c_control_systems != null &&
    answers.q2d_shareholding_clear != null &&
    answers.q3a_senior_management != null &&
    answers.q3b_independent_board != null &&
    answers.q3c_mid_management != null &&
    answers.q3d_key_personnel != null &&
    answers.q4_paid_up_capital != null &&
    answers.q5_outstanding_shares != null &&
    answers.q6_net_worth != null &&
    answers.q7_borrowings != null &&
    answers.q8_debt_equity_ratio != null &&
    answers.q9_turnover?.[0] != null &&
    answers.q10_ebitda?.[0] != null &&
    answers.q11_eps != null
  )
}
