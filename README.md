# Chronos

<p align="center">
  <img src="public/icons/icon-192.png" alt="Chronos app icon" width="96" height="96">
</p>

<p align="center">
  <strong>Local-first infinite timelines for research, stories, projects, and history.</strong>
</p>

<p align="center">
  <a href="https://aryan-singh19.github.io/chronos/"><img alt="Live demo" src="https://img.shields.io/badge/live-GitHub%20Pages-0969da?style=for-the-badge&logo=github"></a>
  <a href="https://github.com/Aryan-singh19/chronos/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/Aryan-singh19/chronos/ci.yml?branch=main&style=for-the-badge&label=CI"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/github/license/Aryan-singh19/chronos?style=for-the-badge"></a>
  <a href="https://github.com/Aryan-singh19/chronos/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/Aryan-singh19/chronos?style=for-the-badge"></a>
</p>

## Live App

- GitHub Pages: <https://aryan-singh19.github.io/chronos/>
- Repository: <https://github.com/Aryan-singh19/chronos>

## Why Chronos

Chronos is a private, zero-cost timeline and knowledge compiler. It runs in the browser, stores data in IndexedDB, works offline as a PWA, and gives you multiple ways to visualize the same body of work.

## Highlights

- Infinite timeline canvas with pan, zoom, lanes, minimap, ruler, and scrubber.
- Timeline, Gantt, Kanban, and Calendar views for the same data.
- Local AI helpers for summaries, tag suggestions, priority detection, date inference, and related-node discovery.
- Local-first persistence with browser storage, version snapshots, imports, and exports.
- Rich project workspace with command palette, keyboard shortcuts, theme controls, PWA assets, and Docker support.
- CI, GitHub Pages publishing, contribution checks, and open-source docs ready for collaboration.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| UI | React, Tailwind CSS, Radix UI, Lucide |
| State | Zustand + Immer |
| Storage | IndexedDB via `idb` |
| Motion | Framer Motion |
| Testing | Vitest |
| Runtime | Bun |

## Quick Start

```bash
git clone https://github.com/Aryan-singh19/chronos.git
cd chronos
bun install
bun dev
```

Open <http://localhost:3000>.

## Scripts

```bash
bun dev          # start local dev server
bun run build   # production build
bun start        # start production server
bun test         # run Vitest
bun run lint     # run Next lint
bun run type-check
```

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
