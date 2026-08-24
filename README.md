# Evalis

Enterprise Assessment Platform — Angular SPA demo for client proposals.

**Create. Deliver. Evaluate. Secure.**

> Product branding for this demo is **Evalis**. The client brief (`docs/detail.md`) remains the ExamGen specification source.

## Quick start

```bash
npm install
npm start
```

Open http://localhost:4200

## Flagship screens (screenshot-ready)

| Screen | Route |
|--------|-------|
| Create Exam | `/exams/create` |
| Question Builder | `/questions/new` |
| Candidate Registration | `/candidates/new` |

## All routes

- `/` — Dashboard
- `/exams` — Exam list
- `/exams/create` — Create Exam wizard
- `/questions` — Question Bank (AG Grid)
- `/questions/new` — Question Builder
- `/candidates` — Candidate list
- `/candidates/new` — Candidate Registration
- `/scheduling` — Exam Scheduler
- `/assessment/live` — Live Monitoring
- `/assessment/results` — Results
- `/admin/users` — Users & Roles
- `/admin/organization` — Organization Settings

## Stack

- Angular 19 (standalone components)
- SCSS design tokens
- AG Grid Community
- Chart.js / ng2-charts
- Angular Material (snackbars)
- In-memory seed data + mock services (no backend)
