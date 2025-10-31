# IRA - IPO Readiness Assessment

Internal tool for 4 users to score client companies on 57 questions.

## Quick Start

```bash
pnpm install
pnpm dev
# Open http://localhost:3000
```

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 (9 glassmorphism themes)
- Vercel Postgres + Prisma
- NextAuth v5

## Workflow

Create → Fetch Probe Data → Upload Docs → Score (57Q) → Review → Report

## Scoring

- Yes=2, Maybe=1, No=-1, NA=0
- >65% = IPO Ready
- 45-65% = Needs Improvement
- <45% = Not Ready

## Context

Read **[claude.md](claude.md)** for full project details.
