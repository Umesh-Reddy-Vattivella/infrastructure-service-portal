# Infrastructure Service Portal: Deployment Guide

This document summarizes the steps taken to transition the application from a local development environment (with SQLite) to a live production environment hosted on Vercel with a Neon PostgreSQL database.

## 1. Database Migration (Neon PostgreSQL)
To ensure the application's data persists across deployments (since serverless environments like Vercel wipe local files on every deploy), we migrated from a local SQLite database to a cloud-hosted PostgreSQL database.

**Steps Taken:**
- Created a free project on **Neon.tech** (Serverless Postgres) using AWS in the Asia region.
- Obtained the connection string for the database (kept private).
- Updated the local `prisma/schema.prisma` file to change the database provider from `sqlite` to `postgresql`.
- Configured the schema to pull the database URL from standard environment variables: `url = env("DATABASE_URL")`.
- Pushed the finalized schema to the remote cloud database using `npx prisma db push`, executing the structural creation of tables (User, Ticket, Comment, Notification, Account, etc.).
- Automatically populated the new cloud database with essential initial data (Admin, Committee, Student roles and mock tickets) using the existing `prisma/seed.ts` script.

## 2. Setting Up Source Control (GitHub)
To automate the deployment pipeline, the source code needed to be hosted remotely.

**Steps Taken:**
- Installed Git for Windows.
- Initialized the local repository (`git init`).
- Committed the deployment-ready codebase, including the finalized Postgres-compatible Prisma schema.
- Linked the local codebase to a new remote repository on GitHub (`infrastructure-service-portal`).
- Pushed all code to the `main` branch.

## 3. Resolving Vercel Build & Caching Issues
Serverless platforms utilize aggressive caching to speed up builds, which requires specific configurations for ORMs like Prisma.

**Steps Taken:**
- Encountered a standard Vercel build error: `PrismaClientInitializationError`. Vercel had cached dependencies without triggering Prisma's auto-generation of the database client.
- Edited `package.json` to inject a `postinstall` script: `"postinstall": "prisma generate"`.
- This ensures that every time Vercel installs dependencies on a new build, it forcefully regenerates the exact Prisma Client required to communicate with the Neon cloud database.
- Committed and pushed this fix to GitHub, allowing Vercel to rebuild successfully.

## 4. Live Deployment (Vercel)
With the database live and the code securely pushed to GitHub, the application was deployed.

**Steps Taken:**
- Connected Vercel to the newly created GitHub repository.
- Imported the project into Vercel, allowing it to automatically detect the Next.js framework.
- Configured the Production Environment Variables directly within Vercel's dashboard before deployment:
  - Added `DATABASE_URL` (Pointing to the cloud Neon DB).
  - Added `AUTH_SECRET` (Secure 32-character string used by NextAuth to encrypt user sessions).
- Triggered the final deployment, resulting in a live, highly-available URL for the Infrastructure Service Portal.

---
*Note: Sensitive configuration keys and database credentials have been omitted from this guide for security.*
