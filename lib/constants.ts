// IRA Platform - Application Constants
// Centralized configuration values for better maintainability

// ============================================
// AUTO-SAVE CONFIGURATION
// ============================================

export const AUTO_SAVE = {
  // Debounce delays (milliseconds)
  // ✅ OPTIMIZED: Reduced debounce for instant feedback (was 1000ms)
  ELIGIBILITY_DEBOUNCE_MS: 500, // Save after 0.5s of inactivity
  ASSESSMENT_DEBOUNCE_MS: 800,  // Save after 0.8s of inactivity

  // Retry configuration
  MAX_RETRY_ATTEMPTS: 2, // Total of 3 attempts (initial + 2 retries)
  RETRY_BASE_DELAY_MS: 1000, // Base delay for exponential backoff

  // Error messages
  RETRY_MESSAGE: "Retrying...",
  FAILURE_MESSAGE: "Failed to save. Changes will be lost if you leave.",
} as const

// ============================================
// REVIEW HISTORY CONFIGURATION
// ============================================

export const REVIEW_HISTORY = {
  MAX_ENTRIES: 50, // Maximum number of review history entries to keep
  ENTRIES_TO_KEEP: 49, // Keep last 49 + new entry = 50 total
} as const

// ============================================
// SCORING CONFIGURATION
// ============================================

export const SCORING = {
  // Answer scores
  NO: -1,
  NA: 0,
  MAYBE: 1,
  YES: 2,

  // Rating thresholds (percentage)
  IPO_READY_THRESHOLD: 65,
  NEEDS_IMPROVEMENT_THRESHOLD: 45,

  // Rating labels
  IPO_READY: "IPO_READY",
  NEEDS_IMPROVEMENT: "NEEDS_IMPROVEMENT",
  NOT_READY: "NOT_READY",
} as const

// ============================================
// UI CONFIGURATION
// ============================================

export const UI = {
  // Mobile breakpoint (matches Tailwind's md: breakpoint)
  MOBILE_BREAKPOINT_PX: 768,

  // Touch target sizes (mobile-first)
  MIN_TOUCH_TARGET_PX: 44,

  // Z-index layers
  Z_INDEX: {
    TAB_BAR: 40,
    FIXED_BUTTONS: 50,
    DIALOG: 50,
    TOAST: 9999,
  },

  // Bottom spacing for mobile tab bar
  TAB_BAR_HEIGHT_REM: 4, // 64px = 4rem
} as const

// ============================================
// VALIDATION CONFIGURATION
// ============================================

export const VALIDATION = {
  // Lead validation
  MIN_COMPANY_NAME_LENGTH: 2,
  MAX_COMPANY_NAME_LENGTH: 200,
  MIN_ADDRESS_LENGTH: 10,
  MAX_ADDRESS_LENGTH: 500,

  // Question validation
  MIN_QUESTION_LENGTH: 10,
  MAX_QUESTION_LENGTH: 1000,
  MAX_HELP_TEXT_LENGTH: 1000,

  // Assessment validation
  MAX_REMARK_LENGTH: 1000,
  MAX_REVIEW_COMMENTS_LENGTH: 2000,
  MIN_REJECT_COMMENTS_LENGTH: 10,

  // Confirmation text
  OLD_QUESTIONS_CONFIRMATION: "USEOLDQUESTIONS",
} as const

// ============================================
// DATABASE CONFIGURATION
// ============================================

export const DATABASE = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Limits
  MAX_QUESTIONS_PER_TYPE: 1000, // Soft limit, not enforced
} as const

// ============================================
// LEAD ID GENERATION
// ============================================

export const LEAD_ID = {
  PREFIX: "LD",
  SEQUENCE_PADDING: 3, // LD-2024-001
} as const

// ============================================
// PROBE42 API CONFIGURATION
// ============================================

export const PROBE42 = {
  // Search configuration
  SEARCH_LIMIT: 25,
  MIN_SEARCH_LENGTH: 4, // API requires more than 3 characters
  DEBOUNCE_DELAY_MS: 500,

  // Display limits
  MAX_SIGNATORIES_DISPLAY: 5,

  // API timeout
  API_TIMEOUT_MS: 10000, // 10 seconds
  MAX_RETRIES: 2,

  // Identifier regex patterns
  PATTERNS: {
    CIN: /^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/,
    LLPIN: /^[A-Z]{3}-\d{4}$/,
    PAN: /^[A-Z]{5}\d{4}[A-Z]$/,
  },

  // Sector mappings for classification
  SECTOR_MAPPINGS: {
    TECHNOLOGY: ['technology', 'software', 'it services', 'computer'],
    FINANCIAL_SERVICES: ['financial', 'banking', 'insurance', 'nbfc'],
    HEALTHCARE: ['healthcare', 'pharma', 'pharmaceutical', 'hospital', 'medical'],
    MANUFACTURING: ['manufacturing', 'factory', 'production', 'industrial'],
    RETAIL: ['retail', 'commerce', 'e-commerce', 'trading'],
  } as const,
} as const
