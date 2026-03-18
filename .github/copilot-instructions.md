# MCSB v2 Security Dashboard

## Project Goal
A React + TypeScript dashboard that visualizes all Microsoft Cloud Security Benchmark v2 (MCSB v2) 
security domains and controls, including automation capabilities via KQL queries, 
Azure Policy, and Defender for Cloud.

## Stack
- React 18 + TypeScript + Vite
- Tailwind CSS for styling
- React Router for navigation between domains
- Recharts or Chart.js for compliance visualizations

## Security Domains (MCSB v2)
- Identity Management (IM)
- Network Security (NS)
- Data Protection (DP)
- Asset Management (AM)
- Logging & Threat Detection (LT)
- Incident Response (IR)
- Posture & Vulnerability Management (PV)
- Endpoint Security (ES)
- Backup & Recovery (BR)
- DevOps Security (DS)
- Governance & Strategy (GS)
- AI Security (AI) — new in v2

## Dashboard Structure
- Overview page: all domains with compliance score
- Domain detail page: controls with status (compliant / non-compliant / manual)
- Per control: KQL query, Azure Policy definition, and automation step
- Filter options: by domain, by status, by automation type

## Guidelines
- Use functional React components with hooks
- TypeScript strict mode enabled
- Tailwind utility classes for styling, no inline styles
- Data via local JSON files (mock data) so it works without an Azure connection
- Keep components small and reusable
- Write tests with Vitest

## Naming Conventions
- Components: PascalCase (e.g. DomainCard, ControlDetail)
- Files: kebab-case (e.g. domain-card.tsx)
- Types/interfaces in /src/types/
- Mock data in /src/data/