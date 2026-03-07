# Project Folder Structure Description

This document describes the structure and purpose of the directories and files within the project `Project_1`. This is a Next.js application designed as an Infrastructure Issue Portal.

## Root Directory

- **`README.md`**: The primary documentation file containing a high-level overview of the application, instructions on how to run it, and basic features.
- **`package.json` & `package-lock.json`**: Define the project's NPM dependencies and scripts.
- **`next.config.ts`**: Configuration file for Next.js.
- **`tsconfig.json`**: TypeScript compiler configuration.
- **`.env`**: Contains sensitive environment variables for local development (not committed to Git).
- **`dev.db`**: Local SQLite database file for Prisma.

## `src/` Directory
Contains the actual source code of the application.

- **`src/app/`**: Next.js App Router directory.
  - `page.tsx`: The landing page of the application.
  - `api/`: API routes (e.g., authentication routes via `auth/[...nextauth]`).
  - `dashboard/`: Directory containing dashboard views for both Students and Committees.
  - `register/`: Directory containing user registration forms.
  - `ticket/`: Directory for individual ticket viewing pages.
- **`src/components/`**: Reusable React components.
  - `StudentDashboard.tsx`, `CommitteeDashboard.tsx`: Core dashboard views for role-based users.
  - `LoginForm.tsx`, `RegisterForm.tsx`: Forms for authentication.
  - `TicketManager.tsx`: Component to create new or manage existing tickets.
  - `CommentThread.tsx`: Displays and manages the discussion/comment thread for each ticket.
  - `Navbar.tsx`: Shared navigation bar.
- **`src/actions/`**: Server Actions for handling forms and mutations natively.
  - `auth.ts`, `comment.ts`, `ticket.ts`: Server-side mutation and fetching actions.
- **`src/lib/`**: Utility files and shared libraries (like the configured Prisma Client instance).
- **`src/types/`**: TypeScript type definitions.

## `prisma/` Directory
Everything related to the Prisma ORM.
- **`schema.prisma`**: The schema definitions determining how tables relate (User, Ticket, Comment, Notification).
- **`seed.ts`**: Script to seed the database with initial users (`admin@example.com`, `student@example.com`).

## `public/` Directory
Contains static assets, like images or SVG icons (`next.svg`, `vercel.svg`, etc).

## `scripts/` Directory
Helper scripts, e.g., `seed-tickets.ts` for populating dummy tickets into the database during development.

---

### Documentation Locations

*   **Standard Documentation:** Mostly found in the `README.md` at the root folder (`c:\Users\UMESH_VATTIVELLA\Project_1\README.md`). 
*   **Infrastructure Design Docs:** Some architectural notes and implementation plans generated previously exist in your `.gemini/antigravity/brain/...` directories.
