# Contributing to Chronos

Thanks for helping improve Chronos. This project is built to stay local-first, fast, accessible, and pleasant to use.

## Development Setup

```bash
bun install
bun dev
```

Before opening a pull request, run:

```bash
bun run type-check
bun run lint
bun test --run
bun run build
```

## Contribution Flow

1. Create a branch from `main`.
2. Keep changes focused on one feature, fix, or documentation update.
3. Use clear commits, preferably Conventional Commit style such as `feat: add timeline export`.
4. Add or update tests when behavior changes.
5. Update `CHANGELOG.md` for user-visible changes.
6. Open a pull request with a short summary and verification notes.

## Code Guidelines

- Prefer local-first behavior and browser-native storage.
- Keep UI responsive on mobile and desktop.
- Use existing stores, helpers, components, colors, and spacing patterns before adding new abstractions.
- Avoid server-only dependencies in user workflows unless the feature has a graceful local fallback.
- Keep accessibility in mind: labelled controls, keyboard paths, and visible focus states.

## Pull Request Checklist

- [ ] I ran type check, lint, tests, or explained why I could not.
- [ ] I updated docs or changelog when needed.
- [ ] I tested the main user path touched by this change.
- [ ] I did not commit secrets, local environment files, generated builds, or dependency folders.

## Issue Labels

Useful labels for contributors:

- `good first issue`
- `help wanted`
- `bug`
- `enhancement`
- `documentation`
- `accessibility`
- `local-first`
- `pwa`
- `timeline`

## Security

Do not open a public issue for sensitive security reports. Use a private channel with the maintainer and include reproduction steps, impact, and affected versions.
