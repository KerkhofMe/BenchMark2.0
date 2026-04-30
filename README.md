# Microsoft Cloud Security Benchmark v2 — Dashboard

A React dashboard that visualizes all Microsoft Cloud Security Benchmark v2 (MCSB v2) security domains and controls, including automation capabilities via KQL queries, Azure Policy, and Defender for Cloud.

## Features

- **Interactive compliance assessment** — mark each control as Compliant, Partial, Non-Compliant, Manual Review, or Unchecked
- **Persistent state** — all statuses, notes, and evidence links are saved automatically in browser localStorage
- **Overview dashboard** — compliance score per domain, assessment progress bar, and status breakdown (compliant / partial / non-compliant / manual / unchecked)
- **Domain detail pages** — filter controls by status, view per-control KQL queries, Azure Policy links, remediation steps, and data source requirements
- **Full-text search** — search across all controls by ID, title, description, or domain name, with status filtering
- **Assessment notes** — add a free-text note per control (auto-saved with debounce)
- **Evidence links** — attach one or more URLs per control as compliance evidence
- **Prerequisites** — toggle shared setup steps (e.g., Microsoft Sentinel) to declutter control cards once infrastructure is in place
- **CSV export** — export all controls or a single domain's controls, including statuses, notes, evidence links, and remediation details
- **Reset** — clear all assessment data with a single confirmed action

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS 4
- React Router 7
- Vitest for testing

## Getting Started

### Docker (recommended)

```bash
docker compose up --build -d
```

Open [http://localhost:8080](http://localhost:8080).

```bash
# Stop
docker compose down
```

### Local Development

Requires Node 22+.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
npm run test         # Run tests (single pass)
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint
```

## Security Domains (MCSB v2)

| Code | Domain |
|------|--------|
| IM | Identity Management |
| NS | Network Security |
| DP | Data Protection |
| AM | Asset Management |
| LT | Logging & Threat Detection |
| IR | Incident Response |
| PV | Posture & Vulnerability Management |
| ES | Endpoint Security |
| BR | Backup & Recovery |
| DS | DevOps Security |
| GS | Governance & Strategy |
| AI | AI Security |

## Project Structure

```
src/
  components/    # Reusable UI components (DomainCard, ControlCard, Navbar, Sidebar, …)
  data/          # Mock data (JSON) and data utilities (compute-scores, export-csv)
  pages/         # Route pages (Dashboard, DomainDetail, Search)
  types/         # TypeScript interfaces (Control, Domain, …)
  utils/         # Helper functions (status colours/labels)
  __tests__/     # Vitest tests
scripts/         # Node.js data-generation and maintenance scripts
docs/            # Additional documentation
```
