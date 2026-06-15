<div align="center">

# ⚡ Pulse

**Issue tracking that keeps up with you.**

A fast, keyboard-first task tracker for product teams — Kanban boards, real-time
activity, a command palette, and an end-to-end type-safe stack.

[Stack](#stack) · [Features](#features) · [Architecture](#architecture) · [Getting started](#getting-started)

</div>

---

## Stack

| Layer        | Tech                                                        |
| ------------ | ----------------------------------------------------------- |
| Framework    | **Next.js 16** (App Router, React 19, Server Components)    |
| Language     | **TypeScript** (strict, end-to-end)                         |
| API          | **tRPC v11** + **Zod** — one source of truth, no codegen    |
| Data         | **Prisma 6** + **PostgreSQL**                               |
| Server state | **TanStack Query** (via tRPC)                               |
| Styling      | **Tailwind CSS v4** + custom design tokens                  |
| Motion       | **Framer Motion**                                           |
| Drag & drop  | **dnd-kit** with fractional ordering                        |
| Auth         | **jose** (JWT) + **bcrypt**, httpOnly cookie sessions       |
| Tooling      | **Docker**, **GitHub Actions** CI                           |

## Features

- **Kanban boards** with drag-and-drop across columns. Reordering uses
  fractional indexing, so a move is a single `UPDATE` — no re-indexing the list.
- **Optimistic UI** — cards move the instant you drop them; the network catches
  up, and rolls back on error.
- **Command palette** (`⌘K` / `Ctrl+K`) to jump between projects and run actions.
- **Real-time activity feed** — every create / move / assign / comment is logged
  and streamed into a live timeline.
- **Role-based access control** — `OWNER` / `ADMIN` / `MEMBER`, enforced on the
  server for every project and task operation.
- **Auth from scratch** — registration, login, hashed passwords, signed JWT
  sessions in httpOnly cookies.
- **Task detail drawer** — priority, assignee, comments, full history.
- A **landing page** and polished empty / loading (skeleton) states throughout.

## Architecture

```
src/
├─ app/                      # Next.js App Router
│  ├─ page.tsx               # landing
│  ├─ login / register       # auth screens
│  ├─ app/                   # authenticated workspace (server-guarded layout)
│  │  ├─ page.tsx            # projects dashboard
│  │  └─ [projectId]/        # board view
│  └─ api/trpc/[trpc]/       # tRPC fetch handler
├─ server/
│  ├─ trpc.ts                # context, transformer, public/protected procedures
│  ├─ access.ts              # RBAC guard (assertProjectAccess)
│  ├─ db.ts                  # Prisma singleton
│  └─ routers/               # auth · project · task · comment · activity
├─ components/               # ui primitives, board, app shell, landing
└─ lib/                      # auth (jwt/bcrypt), trpc client, utils, constants
prisma/schema.prisma         # User · Project · Task · Label · Comment · Activity
```

**Type safety** flows from the database to the browser: Prisma generates the DB
types, tRPC infers the API contract from the routers, and the React client
consumes those inferred types directly (`RouterInputs` / `RouterOutputs`). A
breaking change on the server surfaces as a red squiggle on the client.

**Authorization** lives on the server. Every task/project procedure calls
`assertProjectAccess(db, projectId, userId, minRole)` before touching data, so
membership and role are checked in one place.

## Getting started

> Requires Node 22+ and Docker.

```bash
# 1. install
npm install

# 2. start postgres
docker compose up -d

# 3. set up the schema + demo data
cp .env.example .env          # adjust AUTH_SECRET
npm run db:push
npm run db:seed

# 4. run
npm run dev
```

Open http://localhost:3000 and sign in with the seeded account:

```
email:    demo@pulse.app
password: password123
```

### Scripts

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Dev server                           |
| `npm run build`    | `prisma generate` + production build |
| `npm run db:push`  | Sync Prisma schema to the database   |
| `npm run db:seed`  | Seed demo users, project, and tasks  |
| `npm run db:studio`| Open Prisma Studio                   |
| `npm run lint`     | ESLint                               |

### Docker

```bash
docker build -t pulse .
docker run -p 3000:3000 --env-file .env pulse
```

---

<div align="center">
A portfolio project. Built with Next.js, tRPC, Prisma & PostgreSQL.
</div>
