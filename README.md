# AI Photobooth

Next.js + TypeScript + Tailwind UI photobooth application with Prisma SQLite backend.

## Project Overview

- Frontend: Next.js (app router)
- Styling: Tailwind CSS
- UI: shadcn/ui components
- State: Zustand
- Backend: Prisma + SQLite
- API routes for packages, filters, transactions, admin, uploads, and AI filter generation

## Requirements

- Node.js 20+
- npm
- SQLite

## Setup

1. Set project directory:

```bash
cd /home/felichpg/Downloads/workspace-984c7b9e-3cc3-43ff-ba72-a3c08e382a8b
```

2. Install dependencies:

```bash
export PATH=/tmp/node-v20.11.0-linux-x64/bin:$PATH
npm install --legacy-peer-deps
```

3. Configure database:

```bash
cp .env .env.local
# .env already contains:
# DATABASE_URL=file:./db/photobooth.db
```

4. Initialize Prisma schema:

```bash
npm run db:push
npm run db:generate
```

5. Seed default data:

```bash
curl http://localhost:3000/api/seed || true
```

## Run

- Development server:

```bash
export PATH=/tmp/node-v20.11.0-linux-x64/bin:$PATH
npm run dev
```

- Production build:

```bash
export PATH=/tmp/node-v20.11.0-linux-x64/bin:$PATH
npm run build
```

- Start server:

```bash
export PATH=/tmp/node-v20.11.0-linux-x64/bin:$PATH
npm run start
```

## Notes

- `next.config.ts` currently allows ignoring TypeScript build errors via `ignoreBuildErrors: true`.
- `.env` is configured for a local SQLite file.
- The project build has been verified successfully.

## Useful Commands

```bash
npm run lint
npm run db:push
npm run db:generate
npm run db:migrate
npm run db:reset
```
