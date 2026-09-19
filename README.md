# AI Accessibility Auditor for Websites 🌐♿

> An AI-powered, automated Web Accessibility (**WCAG 2.1 AA**) auditing platform that scans live websites or raw HTML code, explains accessibility violations in plain English, generates context-aware code remediation using **Groq Llama-3**, tracks multi-verification continuous historical score trends against baseline audits, enforces multi-tenant MongoDB Atlas data isolation, and exports executive PDF compliance audit reports.

---

## 🚀 Key Features

### 1. 🛡️ Deterministic WCAG 2.1 AA Rule Engine
- **Missing Image Alt Text** (`WCAG 1.1.1`): Identifies `<img>` elements without descriptive alternative text or appropriate decorative `alt=""`.
- **Color Contrast Ratio** (`WCAG 1.4.3`): Evaluates foreground vs background color contrast to ensure minimum 4.5:1 ratio for normal text.
- **Form Element Labels** (`WCAG 1.3.1` / `4.1.2`): Checks form inputs for associated `<label>` elements or valid `aria-label`/`aria-labelledby` attributes.
- **Heading Hierarchy** (`WCAG 1.3.1`): Detects skipped heading levels (e.g., `<h1>` directly to `<h3>`) and missing page `<h1>`.
- **Generic & Vague Link Text** (`WCAG 2.4.4`): Identifies uninformative links ("click here", "read more", "link").
- **Uncaptioned Video Elements** (`WCAG 1.2.2`): Flags `<video>` elements missing `<track kind="captions">`.
- **Missing HTML `lang` Attribute** (`WCAG 3.1.1`): Ensures the root `<html>` tag specifies a valid language attribute.
- **Unlabelled Button Elements** (`WCAG 4.1.2`): Flags `<button>` elements missing accessible names or ARIA labels.

---

### 2. 🤖 AI Plain-English Remediation (Groq Llama-3)
- Integrates **Groq Llama-3** (`llama-3.3-70b-versatile`, `llama3-8b-8192`, `mixtral-8x7b-32768`) with automatic fallback handling.
- Translates technical WCAG errors into plain-English explanations.
- Generates side-by-side **Before vs After** code diff snippets for immediate developer copy-pasting.

---

### 3. ⚡ SHA-256 Code Hashing & Change Rescan Detection
- Computes a SHA-256 cryptographic hash (`contentHash`) for all URL HTML fetches and raw HTML code uploads.
- **Identical HTML Code**: If re-submitted HTML matches a previous scan hash, the system returns `{ unchanged: true }` with a notification: *"No HTML changes detected since previous scan"*.
- **Modified HTML Code**: If code is altered, a new scan version ($V_n$) is generated, stored in MongoDB Atlas, compared against prior versions ($V_{n-1} \to V_n$), and updates the performance & accessibility trend graphs.

---

### 4. 🔒 Mandatory Auth Gate & Multi-Tenant Data Isolation
- **Strict Auth Gate**: Unauthenticated visitors (`!isAuthenticated`) are presented with a non-dismissible Sign In / Create Account modal. The background application is blurred (`filter blur-sm pointer-events-none`) until authentication completes.
- **Automatic Form Resetting**: Form text fields (`name`, `email`, `password`) and error messages in the modal automatically reset when opening, switching modes (*Sign In* $\leftrightarrow$ *Create Account*), logging in, or logging out.
- **MongoDB Data Isolation**: Multi-tenant architecture binds all `Scan` and `Website` records to `userId`. History and trend queries filter strictly by the authenticated user's ID.

---

### 5. 📈 Two-Track Baseline Improvement Engine
- **Long-Term Track ($V_1 \to V_n$)**: Tracks overall score points gain (+32 pts), relative score change (+61.5%), total issues reduced (-42 issues, 72.41%), and category score progress against the immutable $V_1$ baseline scan.
- **Short-Term Track ($V_{n-1} \to V_n$)**: Computes scan-to-scan score deltas (+8 pts) and 4-state issue lifecycle classifications:
  - `FIXED`: Issues present in previous scan but resolved in current scan.
  - `NEW`: Newly introduced accessibility violations.
  - `PERSISTING`: Violations remaining unresolved across scans.
  - `REGRESSED`: Previously resolved issues that reappeared in the latest build.

---

### 6. 🌐 Categorized Page Discovery & Manual Batch Audit
- Crawls internal site links and ranks page priority (`/`=100, `/contact`=90, `/about`=90, `/services`=85, `/pricing`=80).
- Categorizes discovered URLs (*Core*, *Business*, *Content*, *Utility & Legal*).
- Allows custom manual batch selection or automated top-page batch scanning.

---

### 7. 🛡️ Robust Access Error Handling
- Handles URL access failures gracefully (`ACCESS_DENIED` HTTP 403/401, `NOT_FOUND` 404, `TIMEOUT`, `DNS_ERROR`).
- Renders an alert card detailing the failure reason and offering direct HTML code upload as an instant alternative.

---

### 8. 📄 Executive PDF Compliance Reports
- Generates downloadable PDF compliance audit reports formatted with executive summaries, severity counts, WCAG rule breakdowns, and remediation code diffs using `pdfkit`.

---

## 🏗️ System Architecture

```text
                                USER
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     React 18 + Vite     │
                    │   Tailwind CSS + Glass  │
                    │ Auth Gate & Trend Cards │
                    └────────────┬────────────┘
                                 │ JWT Bearer Token
                                 ▼
                    ┌─────────────────────────┐
                    │     Node + Express      │
                    │ Auth Middleware (JWT)   │
                    │ Access Error Classifier │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Cheerio + Rules │    │   Groq Llama-3   │    │ PDFKit Reporter  │
│  WCAG 2.1 AA     │    │  AI Remediation  │    │ PDF Audit Export │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ MongoDB Atlas / Mongoose│
                    │ User / Website / Scan   │
                    │ (Disk JSON Fallback)    │
                    └─────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Modern Dark Glassmorphism UI
- **Icons**: Lucide React
- **HTTP Client**: Axios with Bearer JWT Interceptor & Global Error Handling

### Backend
- **Runtime**: Node.js + Express.js
- **HTML DOM Parsing**: Cheerio + Axios HTTP fetcher
- **AI Engine**: Groq SDK (`groq-sdk`) with Llama-3 models (`llama-3.3-70b-versatile`)
- **PDF Engine**: PDFKit (`pdfkit`)
- **Security & Auth**: `bcryptjs` password hashing, `jsonwebtoken` (JWT), `validator`, `crypto` SHA-256
- **Database**: MongoDB Atlas / Mongoose ORM with automatic disk JSON fallback storage

---

## 📁 Repository Directory Layout

```text
AI_Accessibility_Auditor/
├── backend/
│   ├── data/
│   │   └── scans.json               # Disk JSON fallback storage
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # MongoDB Mongoose connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # User Auth routes handler
│   │   │   └── scan.controller.js   # Single/Batch scan & trend controller
│   │   ├── middleware/
│   │   │   └── auth.middleware.js   # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── User.js              # User schema with bcrypt pre-save hook
│   │   │   ├── Website.js           # Website domain registry schema
│   │   │   └── Scan.js              # Scan schema with contentHash & userId
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── scan.routes.js
│   │   │   └── report.routes.js
│   │   ├── services/
│   │   │   ├── ai.service.js        # Groq Llama-3 AI remediation service
│   │   │   ├── auth.service.js      # Register & login authentication logic
│   │   │   ├── browser.service.js   # Cheerio HTML parser & error classifier
│   │   │   ├── comparison.service.js# Version comparison engine
│   │   │   ├── customRules.service.js # Deterministic WCAG rule checks
│   │   │   ├── report.service.js    # PDFKit PDF report generator
│   │   │   ├── scoring.service.js   # Score calculation engine
│   │   │   ├── storage.service.js   # MongoDB storage with disk fallback
│   │   │   ├── trend.service.js     # Two-track baseline trend engine
│   │   │   └── website.service.js   # Website domain registry service
│   │   └── server.js                # Express app entry point (Port 5000)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AccessDeniedCard.jsx # URL error handling alert card
│   │   │   ├── BatchScoreCard.jsx   # Batch scan score gauge card
│   │   │   ├── CategoryBreakdown.jsx# Category progress grid
│   │   │   ├── ComparisonDashboard.jsx # 4-state version comparison
│   │   │   ├── ConfirmLogoutModal.jsx # Session logout confirmation modal
│   │   │   ├── HistoryDrawer.jsx    # Scan history slide-over panel
│   │   │   ├── IssueCard.jsx        # Issue card with AI code diffs
│   │   │   ├── IssueFilter.jsx      # Search & filter controls
│   │   │   ├── LoginModal.jsx       # Auth gate modal with auto form reset
│   │   │   ├── ManualReview.jsx     # Manual review checklist
│   │   │   ├── Navbar.jsx           # Top header with logo, health & auth status
│   │   │   ├── PageDiscoveryModal.jsx # Categorized page selection modal
│   │   │   ├── PerformanceSEOImpact.jsx # Usability & SEO benefit breakdown
│   │   │   ├── ScanForm.jsx         # Single URL / Raw HTML / Batch form
│   │   │   ├── ScanProgress.jsx     # Loading progress animation
│   │   │   ├── ScoreCard.jsx        # Accessibility score gauge card
│   │   │   └── TrendTimelineChart.jsx # Interactive baseline trend graph
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT Auth provider & local state manager
│   │   ├── services/
│   │   │   └── api.js               # Axios client with JWT interceptor
│   │   ├── App.jsx                  # Main application container with Auth Gate
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## ⚙️ Environment Configuration

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net/accessibility_auditor?appName=Cluster0
JWT_SECRET=secret_key
```

---

## 🚀 Steps to Run Locally

### 1. Start Backend API Server
```bash
cd backend
npm install
npm start
```
*The Express backend server will start on `http://localhost:5000` and connect to MongoDB Atlas.*

### 2. Start Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
*The React Vite web application will launch on `http://localhost:3000`.*

---

## 📡 API Endpoints Reference

### 🔐 Authentication Routes
- `POST /api/auth/register` — Register a new auditor account
- `POST /api/auth/login` — Sign in and receive Bearer JWT token
- `GET /api/auth/me` — Retrieve current authenticated user profile

### 🔍 Accessibility Auditing Routes
- `POST /api/scan` — Perform single page URL scan or raw HTML code audit (with SHA-256 change detection)
- `POST /api/scan/batch/discover` — Crawl and rank internal site links by category
- `POST /api/scan/batch` — Run batch accessibility audit across selected pages
- `GET /api/scan/history` — List user's saved scan history

### 📈 Analytics & Trends Routes
- `GET /api/scan/websites/:websiteId/trends` — Fetch two-track baseline improvement analytics
- `GET /api/scan/compare/:id1/:id2` — Generate 4-state version comparison (`FIXED`/`NEW`/`PERSISTING`/`REGRESSED`)

### 📄 Report Generation Routes
- `GET /api/report/:scanId/pdf` — Stream and download compliance PDF audit report

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
