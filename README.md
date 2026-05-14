# 🎓 CET Result System

### College Entrance Test Result Management Platform

**“Your Future, Your Result”**

<p align="center">
  <img src="./public/new.png" alt="CET Result System Logo" width="180" />
</p>

<p align="center">
  A secure, responsive, and modern web-based system for managing, publishing, and accessing College Entrance Test results.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/System-CET%20Result%20System-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Access-Secure-blue?style=for-the-badge" />
</p>

## 📌 Overview

The **CET Result System** is a centralized web-based platform that enables students to securely access their College Entrance Test results online while allowing the Testing and Evaluation Center to efficiently manage applicants, publish results, monitor records, and generate reports. The system reduces long queues, transportation costs, waiting time, and manual workload by providing a streamlined and accessible digital experience.

## ✨ Features

The platform consists of two major components: a **Student Portal** and an **Admin Panel**.

### 👨‍🎓 Student Portal

Students can securely log in to access their results, with enforced first-login password updates for added protection. Once results are published, students can view and download their official results instantly. If results are not yet available, the system clearly communicates the status. The platform also includes OTP-based password recovery via email and is fully responsive across mobile and desktop devices.

### 🛠️ Admin Panel

Administrators have access to a powerful dashboard that provides an overview of applicants, results, and system status. They can manage applicants (add, edit, delete, import, export), generate reference numbers automatically, manage school years and exam schedules, publish or unpublish results, and generate downloadable PDF reports including ranking summaries.

## 🧰 Technology Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,tailwind,supabase" />
</p>

The system is built using modern technologies including **Next.js** for the core framework, **React** for UI components, **Tailwind CSS** for styling, **ShadCN UI** for interface design, and **Supabase** for authentication, database, and backend services.

## 🏗️ System Architecture

```txt
Students / Admin
       |
       v
Next.js + React Frontend
       |
       v
Supabase Authentication
       |
       v
Supabase PostgreSQL Database
       |
       v
Secure Result Access / Admin Management
```

## 🔐 Security

Security is a core part of the system design. It includes secure authentication, private result access with no public listings, OTP-based password recovery, row-level security enforcement, controlled publishing of results, and mandatory password updates during first login.

## 🧭 User Flows

### Student Journey

A student opens the system, logs in using their credentials, and the system verifies their identity. If results are available, the student can immediately view and download them. If not, the system displays a clear “result under review” status.

### Password Recovery

If a student forgets their password, they can request a reset, receive an OTP via email, verify it, and set a new password securely.

### Admin Workflow

An administrator logs in, accesses the dashboard, manages applicants and schedules, inputs or imports results, publishes them when ready, monitors system status, and generates reports.

## 📄 Result Output

Each generated result includes the student name, overall ability rating, school year, examination date, reference number, validity period, official testing center format, and a generated timestamp.

## ⚙️ Installation & Setup

```bash
git clone https://github.com/your-username/cet-result-system.git
cd cet-result-system
npm install
npm run dev
```

Open in browser:

```
http://localhost:3000
```

## 🔑 Environment Variables

Create a `.env.local` file and configure:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Build & Deployment

```bash
npm run build
npm start
```

Recommended platforms: Vercel, Netlify, or any Node.js-compatible hosting.

## 📁 Project Structure

```txt
cet-result-system/
├── app/
│   ├── student/
│   ├── admin/
│   ├── auth/
│   └── result/
├── components/
│   ├── ui/
│   ├── forms/
│   └── layout/
├── lib/
│   └── supabase/
├── public/
│   └── logo.png
├── styles/
├── .env.local
├── package.json
└── README.md
```

## 🚀 Future Enhancements

Planned improvements include a notification system for released results, advanced analytics dashboard, enhanced mobile optimization, multi-school support, and integration of aptitude exam results.

## 👨‍💻 Developer

**Jaymar H. Maruji**
BS Computer Science
Basilan State College

## 🏫 Proposed For

Testing and Evaluation Center
Basilan State College

## 📜 License

For educational and institutional use.

## 💬 Final Note

The CET Result System is designed to provide a more efficient, secure, and student-centered experience—ensuring that every student can access their results with confidence, convenience, and reliability.







This is the BEST way your BASC CET result should look visually.

Modern universities now place the verification section at the bottom-right or bottom-center of the result/certificate. QR-based verification is already widely used by schools and universities to fight fake results and forged documents.

THIS IS THE IDEAL LAYOUT
 ------------------------------------------------------
|                                                      |
|              BASILAN STATE COLLEGE                   |
|          TESTING AND EVALUATION CENTER               |
|                                                      |
|          COLLEGE ENTRANCE TEST RESULT                |
|                                                      |
|                 JUAN DELA CRUZ                       |
|                                                      |
|              OVERALL ABILITY RATING                  |
|                        87%                           |
|                                                      |
|------------------------------------------------------|
| Valid until: SY 2025-2026                            |
| Date Examined: March 10, 2026                        |
| Reference No: CET-2026-0001                          |
|                                                      |
| Verification Code: BASC-X91A-K2L                    |
|                                                      |
| This document can be verified online                 |
| Scan QR or visit: basc.edu.ph/verify                 |
|                                                      |
|                     [ QR CODE ]                      |
|                                                      |
|                    VERIFIED ✓                        |
 ------------------------------------------------------
WHAT THE QR SHOULD DO

When scanned:

https://basc.edu.ph/verify/8fd91ab2x

Then your verification page opens.

WHAT THE VERIFICATION PAGE SHOULD LOOK LIKE

This is what admin/employers see after scanning:

 ------------------------------------------------------
|                RESULT VERIFICATION                   |
|                                                      |
|                 VERIFIED AUTHENTIC ✓                 |
|                                                      |
| Applicant Name: Juan Dela Cruz                       |
| Reference No: CET-2026-0001                          |
| Score: 87%                                           |
| Status: QUALIFIER                                    |
| Date Published: March 15, 2026                       |
|                                                      |
| Verification Token: 8fd91ab2x                        |
|                                                      |
| Verified by: BASC Testing and Evaluation Center      |
 ------------------------------------------------------

If fake:

 ------------------------------------------------------
|                 INVALID RESULT ✕                     |
|                                                      |
| This document does not exist in the                  |
| official BASC CET verification database.             |
 ------------------------------------------------------
BEST POSITIONING INSIDE YOUR RESULT SHEET

I recommend:

Bottom-right corner

Like this:

 -----------------------------
| Note...                     |
|                              |
|                [ QR CODE ]   |
|                              |
| Verify Online                |
| basc.edu.ph/verify           |
 -----------------------------

This is the most professional placement.

WHAT SHOULD BE HIDDEN

DO NOT expose:

secret admin key
verification hash
encryption
signing algorithm

Only the backend knows those.

The QR only contains:

token
verification URL
WHAT SHOULD BE VISIBLE

Visible to everyone:

✅ QR Code
✅ Verification Code
✅ Reference Number
✅ Verification URL
✅ Published Timestamp

That’s enough for professional verification.

WHAT THE SECRET VALIDATION LOOKS LIKE

Hidden backend process:

hash(
 applicant_id +
 score +
 published_at +
 SECRET_ADMIN_KEY
)

If hash matches:
✅ authentic

If changed:
❌ fake/tampered

The user NEVER sees this.

BEST UI FOR YOUR SYSTEM

I strongly recommend adding:

Inside result sheet footer
This result can be verified online.
Scan the QR code to confirm authenticity.

Then:

QR code
verification code under it
EVEN BETTER LOOK

You can make the verification area look like this:

 ┌────────────────────┐
 │   VERIFIED RESULT  │
 │                    │
 │    [ QR CODE ]     │
 │                    │
 │  Verify Authenticity
 │  basc.edu.ph/verify
 │                    │
 │ Ref: BASC-X91A-K2L │
 └────────────────────┘

This looks VERY institutional.

WHAT MOST UNIVERSITIES USE NOW

Common real-world setup:

QR code
online verification page
unique verification token
real-time database validation
issuer-controlled verification portal

That’s exactly what you should implement.