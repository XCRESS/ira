# IRA Platform

## Overview

IRA is a comprehensive **SME Assessment Platform** designed to evaluate companies for potential exchange listings and financial readiness. It streamlines the process of data collection, verification, and scoring through a structured workflow involving Assessors and Reviewers.

The platform integrates with **Probe42** to fetch authoritative company and financial data, reducing manual entry and ensuring data accuracy.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/) (v6)
- **Authentication**: [Better-Auth](https://github.com/better-auth/better-auth)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4)
- **UI Components**: Shadcn-like components with Lucide React icons
- **External APIs**: Probe42 (Company Data)

## Core Features

### 1. Lead Management
- **Dashboard**: Track leads through their lifecycle (`NEW` → `ASSIGNED` → `IN_REVIEW` → `COMPLETED`).
- **Organic Submissions**: Capture inquiries from external forms, verify emails, and convert them to leads.
- **Assignment**: Admins assign leads to specific Assessors.

### 2. Assessment Workflow
A 3-step structured assessment process:

- **Step 1: Company Verification**:
    - Automatic fetching of company details via **Probe42** (CIN, PAN, Registered Address).
    - Manual override support for data correction.
- **Step 2: Financial Verification**:
    - Verification of critical financial metrics: Paid-up Capital, Net Worth, Borrowings, Turnover, and EBITDA.
    - Historical data tracking (last 3 years).
- **Step 3: Questionnaire**:
    - A preset questionnaire covering Investment Readiness, Corporate Governance, and Team Structure.

### 3. Scoring Engine
- **Automated Scoring**: Calculations based on financial health and questionnaire responses.
- **Readiness Rating**: Categorizes companies as `IPO_READY`, `NEEDS_IMPROVEMENT`, or `NOT_READY`.

### 4. Roles & Permissions
- **Assessor**: Creates and fills assessments. Can only view/edit their assigned leads.
- **Reviewer**: Reviews submitted assessments. Can approve or reject with comments.

## Project Structure

```
├── actions/         # Server Actions (Business Logic)
│   ├── assessment-stepper.ts  # Assessment flow logic
│   ├── lead.ts                # Lead management
│   └── documents.ts           # Document handling
├── app/             # Next.js App Router Pages & API Routes
├── components/      # Reusable UI Components
├── lib/             # Utilities & Configuration
│   ├── dal.ts       # Data Access Layer
│   ├── probe42.ts   # Probe42 API Client
│   └── scoring-algorithm.ts # Scoring Logic
├── prisma/          # Database Schema & Migrations
└── public/          # Static Assets
```

## Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd ira
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory with the following keys:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/ira_db"
    BETTER_AUTH_SECRET="your-secret"
    PROBE42_API_KEY="your-probe42-key"
    PROBE42_BASE_URL="https://api.probe42.in/probe_pro_sandbox"
    ```

4.  **Database Setup**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server**:
    ```bash
    pnpm dev
    ```

## Key Workflows

- **Creating a Lead**: Can be done manually via Dashboard or converted from an "Organic Submission".
- **Starting Assessment**: Lead must be in `NEW` or `ASSIGNED` status.
- **Probe42 Integration**: Data is fetched automatically when `lead.cin` is available. Flattened fields are stored on the `Lead` model for quick access.

## Contribution Guidelines

- Use **Server Actions** for all data mutations.
- Ensure all new components are typed strict TypeScript.
- Run `pnpm lint` and `pnpm build` before committing.
