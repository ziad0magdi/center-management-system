# 🎓 SmartCenter — Full-Stack Educational Center Management System

A production-ready, full-stack Smart Educational Center Management application featuring a **React.js** frontend and a **Node.js (Express)** backend connected to **Microsoft SQL Server (MSSQL)** with secure HTTP-Only JWT authentication, server-side session management, real-time QR code attendance scanning, automated WhatsApp parent absence notifications, and monthly payments tracking.

---

## 🏛 Architecture & Tech Stack

### 1. Backend (Node.js & Express — N-Tier Architecture)
- **Database:** Microsoft SQL Server (`mssql` package).
- **Authentication:** JWT (JSON Web Tokens) stored securely in **HTTP-Only Cookies**, paired with `express-session` for server-side state.
- **Naming Conventions & Layers:**
  - `config/`: `db.config.js`, `session.config.js`
  - `models/`: `student.model.js`, `teacher.model.js`, `group.model.js`, `session.model.js`, `attendance.model.js`, `payment.model.js`, `student_notes.model.js` (Raw SQL queries / procedures)
  - `services/`: `student.service.js`, `teacher.service.js`, `group.service.js`, `session.service.js`, `attendance.service.js`, `payment.service.js`, `student_notes.service.js`, `auth.service.js`, `whatsapp.service.js`
  - `controllers/`: `student.controller.js`, `teacher.controller.js`, `group.controller.js`, `session.controller.js`, `attendance.controller.js`, `payment.controller.js`, `student_notes.controller.js`, `auth.controller.js`
  - `routes/`: Express routers for all entities
  - `server.js`: Entry point with CORS (`credentials: true`), cookie-parser, session middleware, and global error handlers.

### 2. Frontend (React.js + Vite)
- **State Management & Caching:** `@tanstack/react-query` (React Query).
- **HTTP Client:** `axios` configured with `withCredentials: true` to automatically pass cookies and session IDs.
- **Strict Folder Structure:**
  - `src/apis/`: `auth.api.js`, `student.api.js`, `teacher.api.js`, `group.api.js`, `session.api.js`, `attendance.api.js`, `payment.api.js`, `student_notes.api.js` (No fetch logic inside UI components)
  - `src/pages/`: `AdminView.jsx`, `TeacherView.jsx`, `StudentView.jsx`, `Login.jsx`
  - `src/components/`: `QRScanner.jsx`, `StudentTable.jsx`, `SessionCard.jsx`, `PaymentModal.jsx`, `WhatsAppModal.jsx`, `StudentQRModal.jsx`, `GroupEnrollModal.jsx`, `HomeworkModal.jsx`, `PersonalNoteModal.jsx`, `Navbar.jsx`
  - `src/App.jsx` & `src/main.jsx`: Wrapped with `QueryClientProvider` and `AuthProvider`.

---

## 🔑 Demo Credentials

For quick evaluation, convenient 1-click login presets are provided on the Login page:

| Role | Username | Password | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full student, teacher, group CRUD, payments tracking matrix, QR scanner |
| **Teacher** | `tamer_physics` | `password123` | Assigned groups only, homework notes, live QR attendance, Send WhatsApp to absent students |
| **Student** | `omar_khaled` | `password123` | Digital QR badge, monthly payment status, lesson homework, personal study notes |

---

## 🚀 Getting Started

### 1. Database Setup (SQL Server)
Execute the schema and seeding scripts in SQL Server Management Studio (SSMS) or via CLI:
- Schema: [`Database/CMS_schema.sql`](file:///c:/Users/ziad.magdy/Desktop/Projects/CMS/Database/CMS_schema.sql)
- Seed Data: [`Database/seed.sql`](file:///c:/Users/ziad.magdy/Desktop/Projects/CMS/Database/seed.sql)

### 2. Start the Backend API
```bash
cd backend
npm run dev
# or: node server.js
```
*Backend runs on `http://localhost:5000` with API health check at `/api/health`.*

### 3. Start the React Frontend
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173` with proxy configured to backend.*

---

## 🌟 Core Domain Features

1. **Admin Portal:**
   - Manage students with auto-generated unique QR codes (e.g. `STD-2026-0001-OKM`).
   - Group enrollment and batch assignment modal.
   - Monthly payments tracking matrix (paid vs unpaid for any month/year, total revenue, collection rate).
   - Real-time attendance QR scanner.

2. **Teacher Portal:**
   - Strictly scoped to groups assigned to the authenticated teacher.
   - Schedule sessions and attach homework instructions.
   - Live camera QR code scanner + 1-click test simulator.
   - **Send Absence WhatsApp Alerts:** Filters absent students in the session and dispatches templated parent notifications with delivery confirmation.

3. **Student Portal:**
   - Digital Student ID Card with high-resolution scannable QR code.
   - Current month tuition fee payment status badge (Paid / Pending / Unpaid).
   - Lessons & homework view.
   - Attach personal study notes (`student_notes`) to any session.
