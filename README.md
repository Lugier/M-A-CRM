# Bachert CRM 🚀
## Next-Gen M&A Management & Pipeline Execution

Bachert CRM is a premium, high-performance platform tailored for high-stakes M&A advisory. Built with **Next.js 14**, **Prisma**, and **PostgreSQL**, it combines robust data management with a world-class user experience.

---

## 💎 Key Features

### 📊 Advanced Dashboard
- **Pipeline Overview**: Visualize your deal flow across *Pitch*, *Mandate*, and *Closing* stages.
- **KPI Tracking**: Real-time monitoring of Success Fees and Volume.
- **Team Insights**: Clickable team member profiles with workload distribution.

### 🧩 Intelligent Kanban Board
- **Drag-and-Drop Pipeline**: Effortlessly move deals through the lifecycle.
- **Rich Deal Cards**: Quick access to deal leads, team members, and open tasks.
- **Status Integration**: Real-time updates on pitch success and mandates.

### 👤 Premium User Profiles
- **Unified Expertise**: Dedicated views for Skills, Core Sectors, and Regions.
- **Interactive Timeline**: A beautiful, vertical activity stream (Activity Stream) for every team member.
- **Mandate & Contact Links**: Direct connections to owned projects and responsible contacts.

### 📂 Comprehensive Entity Management
- **Organizations**: Track targets, buyers, PE funds, and financial data (AuM, Revenue).
- **Contacts**: Deeply integrated contact management with cross-references to deals.
- **Activities**: Smart logging with automatic type detection (Call, Meeting, Decision, etc.).

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS.
- **UI Components**: Radix UI, Shadcn/UI (Customized for premium aesthetics).
- **Icons**: Lucide React.
- **Database**: PostgreSQL (Hosted on Supabase).
- **ORM**: Prisma.
- **State/Data**: Server Actions & React Hooks.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/logiermann/CRM.git
   cd CRM
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/dbname"
   ```

4. **Database Init:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```

---

## 🛡 Security & Best Practices
- **Data Protection**: Sensitive credentials are kept in `.env` (already git-ignored).
- **Standardized Workflows**: Consistent use of `router.back()` for intuitive navigation.
- **Modular Codebase**: Decoupled components for maximum maintainability.

---

## 📄 License
Internal proprietary software for Bachert Unternehmensberatung GmbH & Co. KG.
