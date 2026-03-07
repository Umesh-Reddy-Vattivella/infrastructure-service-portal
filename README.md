# Centralized Infrastructure Service Portal

## 📖 Overview
The **Centralized Infrastructure Service Portal** is a structured, technology-enabled service management system designed for institutional residential campuses. It transforms the informal, untrackable nature of WhatsApp-based complaint mechanisms into a formal service-ticket framework, improving operational efficiency, accountability, and governance.

## ✨ Key Features
- **Structured Ticketing**: Unique, traceable IDs (e.g., `INF-2026-X`) with precise timestamps for every submitted issue.
- **Defined Lifecycle**: Strict workflow stages (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `ESCALATED`, `RESOLVED`, `CLOSED`).
- **Priority & SLA Automation**: Issues are categorized by priority (Low, Medium, High). The system automatically calculates Service Level Agreement (SLA) deadlines (72h, 48h, 24h). Admins can reset priorities, which dynamically recalculates the SLA.
- **Response Time Deadlines**: When Admins resolve an issue, they set a response deadline (e.g., 24 Hours). The system utilizes a lazy-evaluation engine to automatically fully `CLOSE` the ticket if the student does not respond in time.
- **Accountable Reopening**: Admins can `REOPEN` closed tickets, but are required to log a specific reason which is permanently stamped in the ticket's history.
- **Student Verification workflow**: Students are empowered to "Accept" (Close) or "Reject" (Return to In Progress) a committee's resolution.
- **Auditable System Logs**: Every status change, assignment, and escalation generates an automated `SYSTEM` comment with exact timestamps, creating an unalterable historical audit trail.
- **Anonymity Controls**: Students can submit issues anonymously. Their identity is masked from the public feed but remains visible to the backend committee for accountability.
- **Data Analytics**: A built-in Insights Dashboard for monitoring resolution trends, SLA breach rates, and recurring issues by category (WiFi, Plumbing, Electrical, etc.).

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router, Server Actions)
- **Styling**: Tailwind CSS (with Glassmorphism UI)
- **Database**: Prisma ORM with SQLite (Easily swappable to PostgreSQL)
- **Authentication**: NextAuth.js (Auth.js v5)
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
```bash
git clone https://github.com/Umesh-Reddy-Vattivella/infrastructure-service-portal.git
cd infrastructure-service-portal
```

2. Install dependencies:
```bash
npm install
```

3. Setup your environment variables:
Create a `.env` file in the root directory and add a secret for NextAuth:
```env
AUTH_SECRET="your-super-secret-key-change-in-production"
```

4. Initialize the database:
```bash
npx prisma db push
```

5. (Optional) Seed the database with mock tickets and users:
```bash
npx tsx prisma/seed.ts
```

6. Start the development server:
```bash
npm run dev
```
The portal will be available at `http://localhost:3000`.

## 👥 Default seed.ts Roles
If you ran the seed script, you can log in with:
- **Admin**: admin@instisolve.edu / defaultpass
- **Committee**: committee@instisolve.edu / defaultpass
- **Student**: student@instisolve.edu / defaultpass

## 📝 License
This project is for educational and institutional research purposes.
