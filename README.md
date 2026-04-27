# 🎓 CET Result System  
### College Entrance Test Result Management Platform  
**“Your Future, Your Result”**

<p align="center">
  <img src="./public/logo.png" alt="CET Result System Logo" width="180" />
</p>

<h1 align="center">College Entrance Test Result System</h1>

<p align="center">
  A secure, responsive, and modern web-based system for managing, publishing, and accessing College Entrance Test results.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/System-CET%20Result%20System-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Access-Secure-blue?style=for-the-badge" />
</p>

---

## 📌 Overview

The **CET Result System** is a web-based platform designed to help students securely access their College Entrance Test results online while allowing the Testing and Evaluation Center to manage applicants, publish results, monitor progress, and generate reports efficiently.

The system aims to reduce long queues, transportation costs, waiting time, and manual workload by providing a more accessible and organized result management process.

---

## ✨ Key Features

### 👨‍🎓 Student Portal

- Secure student login
- First-login password change protection
- View official CET result online
- Download official result automatically
- Forgot password recovery via OTP email
- “Result not yet available” page for unpublished results
- Fully responsive design for mobile and desktop

### 🛠️ Admin Panel

- Secure admin login
- Dashboard overview of applicants, results, published, and pending records
- Add, edit, delete, import, and export applicants
- Auto-generate student reference numbers
- Publish and unpublish results
- Manage school years
- Manage exam schedules
- Generate ranking reports
- Download PDF reports

---

## 🧰 Tools & Frameworks Used

<p align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,tailwind,supabase" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-Frontend-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/React-UI%20Library-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-Styling-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Shadcn%2FUI-Components-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Supabase-Backend%20%26%20Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
</p>

---

## ⚙️ Technology Description

| Technology | Purpose |
|----------|---------|
| **Next.js** | Main framework used for building the web application |
| **React** | Used for creating reusable and dynamic user interface components |
| **Tailwind CSS** | Used for fast, responsive, and consistent styling |
| **ShadCN UI** | Used for clean and modern UI components |
| **Supabase** | Used for authentication, database, storage, and backend services |

---

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