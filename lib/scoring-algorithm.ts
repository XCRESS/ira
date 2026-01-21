/**
 * IPO Readiness Scoring Algorithm
 * 
 * Calculates the IPO readiness score based on preset questionnaire answers.
 * Based on the scoring logic from the reference algorithm.
 */

import { PRESET_QUESTIONS, MAX_POSSIBLE_SCORE, type PresetAnswers } from './preset-questionnaire'

// ============================================================================
// Types
// ============================================================================

export type ScoreBreakdown = {
    q1_investment_plan: number
    q2_governance: number      // Combined Q2a-Q2d
    q3_team: number            // Combined Q3a-Q3d
    q4_paid_up_capital: number
    q5_outstanding_shares: number
    q6_net_worth: number
    q7_borrowings: number
    q8_debt_equity_ratio: number
    q9_turnover: number
    q10_ebitda: number
    q11_eps: number
}

export type ScoringResult = {
    breakdown: ScoreBreakdown
    totalScore: number
    maxScore: number
    percentage: number
    rating: 'IPO_READY' | 'NEEDS_IMPROVEMENT' | 'NOT_READY'
}

// ============================================================================
// Individual Question Scoring Functions
// ============================================================================

/**
 * Q1: Investment Plan Ready
 * Yes = 10 points, No = 0 points
 */
function scoreQ1(hasInvestmentPlan: boolean | null): number {
    return hasInvestmentPlan === true ? PRESET_QUESTIONS.q1_investment_plan.maxScore : 0
}

/**
 * Q2: Corporate Governance (4 sub-questions)
 * Each yes = 1 point, max 4 points
 */
function scoreQ2(answers: {
    q2a: boolean | null
    q2b: boolean | null
    q2c: boolean | null
    q2d: boolean | null
}): number {
    let score = 0
    if (answers.q2a === true) score += 1
    if (answers.q2b === true) score += 1
    if (answers.q2c === true) score += 1
    if (answers.q2d === true) score += 1
    return score
}

/**
 * Q3: Right Team (4 sub-questions)
 * Each yes = 1 point, max 4 points
 */
function scoreQ3(answers: {
    q3a: boolean | null
    q3b: boolean | null
    q3c: boolean | null
    q3d: boolean | null
}): number {
    let score = 0
    if (answers.q3a === true) score += 1
    if (answers.q3b === true) score += 1
    if (answers.q3c === true) score += 1
    if (answers.q3d === true) score += 1
    return score
}

/**
 * Q4: Paid Up Capital Scoring
 * 1-10 crores = value / 2 (max 5)
 * > 10 crores = 10 points
 */
function scoreQ4(paidUpCapital: number | null): number {
    if (paidUpCapital == null || paidUpCapital <= 0) return 0

    if (paidUpCapital > 10) {
        return PRESET_QUESTIONS.q4_paid_up_capital.maxScore // 10 points
    }

    // 1-10 crores: score = value / 2, capped at maxScore
    return Math.min(paidUpCapital / 2, PRESET_QUESTIONS.q4_paid_up_capital.maxScore)
}

/**
 * Q5: Outstanding Shares Scoring
 * >= 10,000 shares = 2.5 points
 */
function scoreQ5(outstandingShares: number | null): number {
    if (outstandingShares == null) return 0

    return outstandingShares >= 10000 ? PRESET_QUESTIONS.q5_outstanding_shares.maxScore : 0
}

/**
 * Q6: Net Worth Scoring
 * 5-25 crores = (value - 5) / 2
 * > 25 crores = 10 points
 */
function scoreQ6(netWorth: number | null): number {
    if (netWorth == null || netWorth < 5) return 0

    if (netWorth > 25) {
        return PRESET_QUESTIONS.q6_net_worth.maxScore // 10 points
    }

    // 5-25 crores: score = (value - 5) / 2
    return Math.min((netWorth - 5) / 2, PRESET_QUESTIONS.q6_net_worth.maxScore)
}

/**
 * Q7: Borrowings Scoring
 * 0 < borrowings < netWorth = 5 points
 */
function scoreQ7(borrowings: number | null, netWorth: number | null): number {
    if (borrowings == null || netWorth == null) return 0

    // If borrowings are positive but less than net worth, it's a healthy sign
    if (borrowings > 0 && borrowings < netWorth) {
        return PRESET_QUESTIONS.q7_borrowings.maxScore // 5 points
    }

    return 0
}

/**
 * Q8: Debt/Equity Ratio Scoring
 * Ratio = 1 → 10 points
 * Ratio > 1 → 5 points
 * Ratio < 1 → proportional (ratio * 10)
 */
function scoreQ8(debtEquityRatio: number | null): number {
    if (debtEquityRatio == null) return 0

    if (debtEquityRatio === 1) {
        return PRESET_QUESTIONS.q8_debt_equity_ratio.maxScore // 10 points
    }

    if (debtEquityRatio > 1) {
        return 5 // Partial score for higher leverage
    }

    // D/E < 1 is good - lower leverage
    // Score proportionally based on how close to 0
    return Math.min(debtEquityRatio * 10, PRESET_QUESTIONS.q8_debt_equity_ratio.maxScore)
}

/**
 * Q9: Turnover Scoring (Last 3 Years)
 * Uses latest year's turnover
 * 10-100 crores = (value - 10) * 0.083
 * > 100 crores = 7.5 points
 */
function scoreQ9(turnover: [number | null, number | null, number | null]): number {
    const latestTurnover = turnover[0] // Year 1 is latest

    if (latestTurnover == null || latestTurnover < 10) return 0

    if (latestTurnover > 100) {
        return PRESET_QUESTIONS.q9_turnover.maxScore // 7.5 points
    }

    // 10-100 crores: (value - 10) * 0.083
    return Math.min((latestTurnover - 10) * 0.083, PRESET_QUESTIONS.q9_turnover.maxScore)
}

/**
 * Q10: EBITDA Scoring (Last 3 Years)
 * Each year where EBITDA >= 20% of turnover = 5 points
 * Max 15 points (5 per year × 3 years)
 */
function scoreQ10(
    ebitda: [number | null, number | null, number | null],
    turnover: [number | null, number | null, number | null]
): number {
    let score = 0

    for (let i = 0; i < 3; i++) {
        const yearEbitda = ebitda[i]
        const yearTurnover = turnover[i]

        if (yearEbitda != null && yearTurnover != null && yearTurnover > 0) {
            const ebitdaMargin = (yearEbitda / yearTurnover) * 100
            if (ebitdaMargin >= 20) {
                score += 5
            }
        }
    }

    return Math.min(score, PRESET_QUESTIONS.q10_ebitda.maxScore)
}

/**
 * Q11: EPS Scoring
 * EPS >= 10% of latest turnover = 5 points
 */
function scoreQ11(eps: number | null, latestTurnover: number | null): number {
    if (eps == null || latestTurnover == null || latestTurnover <= 0) return 0

    // EPS as percentage of turnover
    const epsPercentage = (eps / latestTurnover) * 100

    if (epsPercentage >= 10) {
        return PRESET_QUESTIONS.q11_eps.maxScore // 5 points
    }

    return 0
}

// ============================================================================
// Main Scoring Function
// ============================================================================

/**
 * Calculate the complete IPO readiness score
 */
export function calculatePresetScore(answers: PresetAnswers): ScoringResult {
    // Calculate individual scores
    const breakdown: ScoreBreakdown = {
        q1_investment_plan: scoreQ1(answers.q1_investment_plan),
        q2_governance: scoreQ2({
            q2a: answers.q2a_governance_plan,
            q2b: answers.q2b_financial_reporting,
            q2c: answers.q2c_control_systems,
            q2d: answers.q2d_shareholding_clear,
        }),
        q3_team: scoreQ3({
            q3a: answers.q3a_senior_management,
            q3b: answers.q3b_independent_board,
            q3c: answers.q3c_mid_management,
            q3d: answers.q3d_key_personnel,
        }),
        q4_paid_up_capital: scoreQ4(answers.q4_paid_up_capital),
        q5_outstanding_shares: scoreQ5(answers.q5_outstanding_shares),
        q6_net_worth: scoreQ6(answers.q6_net_worth),
        q7_borrowings: scoreQ7(answers.q7_borrowings, answers.q6_net_worth),
        q8_debt_equity_ratio: scoreQ8(answers.q8_debt_equity_ratio),
        q9_turnover: scoreQ9(answers.q9_turnover),
        q10_ebitda: scoreQ10(answers.q10_ebitda, answers.q9_turnover),
        q11_eps: scoreQ11(answers.q11_eps, answers.q9_turnover[0]),
    }

    // Calculate total
    const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0)
    const maxScore = MAX_POSSIBLE_SCORE
    const percentage = (totalScore / maxScore) * 100

    // Determine rating
    let rating: 'IPO_READY' | 'NEEDS_IMPROVEMENT' | 'NOT_READY'
    if (percentage > 65) {
        rating = 'IPO_READY'
    } else if (percentage >= 45) {
        rating = 'NEEDS_IMPROVEMENT'
    } else {
        rating = 'NOT_READY'
    }

    return {
        breakdown,
        totalScore: Math.round(totalScore * 100) / 100, // Round to 2 decimals
        maxScore,
        percentage: Math.round(percentage * 100) / 100,
        rating,
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert Assessment model fields to PresetAnswers format
 */
export function assessmentToPresetAnswers(assessment: {
    hasInvestmentPlan: boolean | null
    q2aGovernancePlan: boolean | null
    q2bFinancialReporting: boolean | null
    q2cControlSystems: boolean | null
    q2dShareholdingClear: boolean | null
    q3aSeniorManagement: boolean | null
    q3bIndependentBoard: boolean | null
    q3cMidManagement: boolean | null
    q3dKeyPersonnel: boolean | null
    q4PaidUpCapital: number | null
    q5OutstandingShares: number | null
    q6NetWorth: number | null
    q7Borrowings: number | null
    q8DebtEquityRatio: number | null
    q9TurnoverYear1: number | null
    q9TurnoverYear2: number | null
    q9TurnoverYear3: number | null
    q10EbitdaYear1: number | null
    q10EbitdaYear2: number | null
    q10EbitdaYear3: number | null
    q11Eps: number | null
}): PresetAnswers {
    return {
        q1_investment_plan: assessment.hasInvestmentPlan,
        q2a_governance_plan: assessment.q2aGovernancePlan,
        q2b_financial_reporting: assessment.q2bFinancialReporting,
        q2c_control_systems: assessment.q2cControlSystems,
        q2d_shareholding_clear: assessment.q2dShareholdingClear,
        q3a_senior_management: assessment.q3aSeniorManagement,
        q3b_independent_board: assessment.q3bIndependentBoard,
        q3c_mid_management: assessment.q3cMidManagement,
        q3d_key_personnel: assessment.q3dKeyPersonnel,
        q4_paid_up_capital: assessment.q4PaidUpCapital,
        q5_outstanding_shares: assessment.q5OutstandingShares,
        q6_net_worth: assessment.q6NetWorth,
        q7_borrowings: assessment.q7Borrowings,
        q8_debt_equity_ratio: assessment.q8DebtEquityRatio,
        q9_turnover: [
            assessment.q9TurnoverYear1,
            assessment.q9TurnoverYear2,
            assessment.q9TurnoverYear3,
        ],
        q10_ebitda: [
            assessment.q10EbitdaYear1,
            assessment.q10EbitdaYear2,
            assessment.q10EbitdaYear3,
        ],
        q11_eps: assessment.q11Eps,
    }
}

/**
 * Get human-readable rating label
 */
export function getRatingLabel(rating: ScoringResult['rating']): string {
    switch (rating) {
        case 'IPO_READY':
            return 'IPO Ready'
        case 'NEEDS_IMPROVEMENT':
            return 'Needs Improvement'
        case 'NOT_READY':
            return 'Not Ready'
    }
}

/**
 * Get rating color for UI
 */
export function getRatingColor(rating: ScoringResult['rating']): string {
    switch (rating) {
        case 'IPO_READY':
            return 'green'
        case 'NEEDS_IMPROVEMENT':
            return 'yellow'
        case 'NOT_READY':
            return 'red'
    }
}
