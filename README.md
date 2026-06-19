# Chronos

<p align="center">
  <img src="public/icons/icon-192.png" alt="Chronos app icon" width="96" height="96">
</p>

<p align="center">
  <strong>Chronos Cloud: local-first timelines upgraded into a full-stack SaaS workspace.</strong>
</p>

<p align="center">
  <a href="https://chronos-rho-six.vercel.app/"><img alt="Live app" src="https://img.shields.io/badge/live-Chronos%20Cloud-2563eb?style=for-the-badge&logo=vercel"></a>
  <a href="https://github.com/Aryan-singh19/chronos/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/Aryan-singh19/chronos/ci.yml?branch=main&style=for-the-badge&label=CI"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/github/license/Aryan-singh19/chronos?style=for-the-badge"></a>
  <a href="https://github.com/Aryan-singh19/chronos/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/Aryan-singh19/chronos?style=for-the-badge"></a>
</p>

## Repository

- GitHub: <https://github.com/Aryan-singh19/chronos>
- Production app: <https://chronos-rho-six.vercel.app/>
- Recommended production host: Vercel
- Recommended database: Prisma Postgres
- Billing provider: Stripe

## Why Chronos

Chronos now combines its original local-first timeline engine with a real SaaS foundation: authenticated accounts, team workspaces, billing surfaces, protected routes, server-backed operational dashboards, and Stripe-ready subscription flows.

## Highlights

- Infinite timeline canvas with pan, zoom, lanes, minimap, ruler, and scrubber.
- Timeline, Gantt, Kanban, and Calendar views for the same data.
- Local AI helpers for summaries, tag suggestions, priority detection, date inference, and related-node discovery.
- Local-first persistence with browser storage, version snapshots, imports, and exports.
- Rich project workspace with command palette, keyboard shortcuts, theme controls, PWA assets, and Docker support.
- Full-stack SaaS backend with Prisma, secure cookie sessions, memberships, invitations, audit logs, and subscriptions.
- Stripe Checkout, Stripe Billing Portal, webhooks, and production deployment guidance for Vercel + Postgres.
- CI, migration deployment workflow, health endpoint, seed scripts, and admin tooling.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| UI | React, Tailwind CSS, Radix UI, Lucide |
| State | Zustand + Immer |
| Client storage | IndexedDB via `idb` |
| Server storage | Prisma ORM + PostgreSQL |
| Auth | Secure HTTP-only cookie sessions |
| Billing | Stripe Checkout + Billing Portal |
| Motion | Framer Motion |
| Testing | Vitest |
| Runtime | Node.js / Bun compatible |

## Quick Start

```bash
git clone https://github.com/Aryan-singh19/chronos.git
cd chronos
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

## Live SaaS

- Production URL: <https://chronos-rho-six.vercel.app/>
- Sign up: <https://chronos-rho-six.vercel.app/signup>
- Sign in: <https://chronos-rho-six.vercel.app/signin>
- Workspace: <https://chronos-rho-six.vercel.app/workspace>
- Billing: <https://chronos-rho-six.vercel.app/billing>
- Health check: <https://chronos-rho-six.vercel.app/api/health>

## Scripts

```bash
npm run dev               # start local dev server
npm run build             # production build
npm run start             # start production server
npm run test:run          # run Vitest once
npm run lint              # run Next lint
npm run type-check        # run TypeScript checks
npm run db:generate       # generate Prisma client
npm run db:migrate:dev    # create a development migration
npm run db:migrate:deploy # apply migrations in CI or production
npm run db:seed           # seed first workspace/admin
npm run admin:create      # upsert an admin user
```

## Production deployment

- Recommended hosting: Vercel
- Recommended database: Prisma Postgres via the Vercel Marketplace
- Recommended billing: Stripe
- Current production deployment: `chronos-rho-six.vercel.app`

Read [docs/production-deployment.md](docs/production-deployment.md) for the full deployment checklist.

## Docker

```bash
docker compose up chronos
docker compose --profile dev up chronos-dev
```

## Project Structure

```text
src/
  app/          Next.js routes
  components/   canvas, layout, modals, nodes, panels, shared UI
  hooks/        autosave, shortcuts, celebration helpers
  lib/          local AI, IndexedDB, export, utilities
  stores/       Zustand app, project, and timeline stores
  styles/       global styles and canvas patterns
  types/        shared TypeScript contracts
tests/          Vitest coverage
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Release history lives in [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE).
