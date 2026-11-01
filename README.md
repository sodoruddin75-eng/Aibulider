# BuildAI Pro - Premium AI Website, Web App & Android App Builder SaaS Platform

BuildAI Pro is a complete, production-ready, full-stack SaaS platform that allows users to enter a text prompt and generate professional websites, web applications, Android apps, landing pages, and other digital projects using AI.

---

## 🚀 Quick Start Guide

### 1. Requirements
- Node.js 18.0 or higher
- npm or bun

### 2. Installation
```bash
# Extract the archive
unzip buildai-pro-source.zip
cd buildai-pro

# Install dependencies
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Google Gemini API key in `.env`:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
PORT=3000
```
*(If no API key is provided, the system gracefully informs users to configure the Gemini API key).*

### 4. Running the Application
```bash
# Run full-stack development server (Express backend + Vite frontend)
npm run dev
```
Open your browser and navigate to:
**`http://localhost:3000`**

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🔐 Super Admin Credentials

Only one super admin is authorized to access the Admin Panel:

- **Admin Email**: `tanvirahamedapon99@gmail.com`
- **Password**: `A@2$dh:;`
- **Admin Dashboard**: `http://localhost:3000/admin` (or click the discreet "Admin" button in the navigation bar after logging in).

All other user accounts are strictly forbidden from accessing the Admin panel, database metrics, settings, payouts, or user management.

---

## 🌟 Key Features

1. **6 AI Builders**:
   - AI Website Builder (HTML + Tailwind + JS)
   - AI Web App Builder (React + Tailwind)
   - AI Android App Builder (Kotlin / Compose architecture)
   - AI Landing Page Builder
   - AI E-commerce Builder
   - AI Code Generator
2. **Interactive Project Editor**:
   - Live iframe & responsive preview
   - Multi-file tab viewer & syntax highlighting
   - Inline code editor with Save Project feature
   - 1-Click ZIP export for all generated projects
3. **Credit Management**:
   - 250 free credits upon registration (strictly anti-abuse protected)
   - Atomic credit deduction & automatic refund on generation failures
   - Permanent credit ledger & transaction history
4. **Subscription Plans & Manual Payment Approval**:
   - Starter ($250), Growth ($350), Enterprise ($500)
   - Unique purchase IDs (e.g. `PUR-123456`)
   - Manual payment verification & admin approval workflow
5. **Unlimited Referral System & Commissions**:
   - Unique referral links (`/register?ref=CODE`)
   - Click tracking, signups, and commission rate calculations ($100 / $200 / $350)
   - Manual payout request & admin payout review
6. **Complete Admin Dashboard**:
   - Real-time business metrics & analytics
   - User management (view credits, suspend/activate, adjust balances)
   - Plan pricing & credit tier editor
   - Payment approvals & rejections
   - Commission payout approvals
   - Platform settings & Facebook group links
   - Support ticket replies
   - Audit logs with IP tracking
