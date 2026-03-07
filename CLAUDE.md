# TCG Marketplace

## Project Structure
- `frontend/` — Next.js 16 App Router with Tailwind CSS v4 and shadcn/ui
- `backend/` — NestJS microservices
- `infra/` — AWS CloudFormation stacks

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS v4, shadcn/ui, amazon-cognito-identity-js
- **Backend**: NestJS
- **Infrastructure**: AWS CloudFormation (Cognito, ECS, RDS, S3, VPC)
- **Auth**: AWS Cognito User Pool with email verification

## Conventions
- Use conventional commits (e.g., `feat:`, `fix:`, `chore:`)
- Do not add co-author lines to commits
- Use shadcn/ui components wherever possible
- Keep UI responsive across mobile, sm, md, lg, xl breakpoints
- Tailwind CSS v4 with `@theme inline` for CSS variables
- Dark/light theme with class-based toggling on `<html>`

## Key Paths
- `frontend/src/app/` — Next.js pages and layouts
- `frontend/src/components/` — Shared components (app-header, theme-toggle, ui/)
- `frontend/src/context/AuthContext.tsx` — Auth state management
- `frontend/src/lib/cognito.ts` — Cognito SDK helpers
- `infra/stacks/` — CloudFormation templates (01-08)

## Frontend Route Structure
- `/` — Public landing page
- `/login` — Sign in / Sign up (tabs, `?tab=signin|signup`)
- `/(app)/dashboard` — Protected dashboard
- `/(app)/profile` — User profile (Cognito attributes)
- `/(app)/admin` — Admin dashboard

## Git
- Main branch: `develop`
- Always push to `develop`
