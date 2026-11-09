# GraPhex

GraPhex is a responsive, frontend-only preview of a private one-to-one messaging product. The current app uses local mock data; it does not create accounts, send messages to other people, or provide real encryption.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

## Quality checks

```sh
npm run build
npm run lint
npm audit
```

## Frontend structure

- `src/App.tsx` — application shell, messaging flows, settings and preview auth screens.
- `src/data/` — dedicated mock conversations, profile and preference data.
- `src/types/messaging.ts` — user, conversation, message, attachment and preference types.
- `src/services/messagingTransport.ts` — transport boundary for a future Go API.
- `src/styles.css` — responsive monochrome design tokens and component styling.

The future Go service can replace the preview state through `MessagingTransport`. Its planned REST routes are `GET /api/v1/conversations`, `GET /api/v1/conversations/{id}/messages`, and `POST /api/v1/conversations/{id}/messages`; live events use `/ws?conversation_id={id}`. No backend or database is included in this phase.

## Deploy

Vercel detects the Vite app and builds with `npm run build`, serving `dist/`. The GitHub Actions workflow runs lint and production build checks on pushes and pull requests.
