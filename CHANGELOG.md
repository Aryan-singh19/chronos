# Changelog

All notable changes to Chronos are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project aims to use semantic versioning.

## [1.0.0] - 2026-05-30

### Added

- Initial open-source repository setup for Chronos.
- GitHub-ready README with badges, live URL, tech stack, and setup commands.
- Contribution guide and changelog.
- CI, GitHub Pages, and contribution-documentation workflows.
- Starter project timeline creation so new projects open into a usable workspace immediately.

### Fixed

- Undo and redo replay no longer create extra history entries while applying previous actions.
- Direct project URLs now reload project state from IndexedDB before showing a not-found state.

### Changed

- New project creation now routes directly to the generated main timeline.
