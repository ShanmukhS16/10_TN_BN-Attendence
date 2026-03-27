NCC Attendance Management System

A scalable, full-stack web application designed to manage attendance for NCC (National Cadet Corps) units across multiple colleges.
Built to handle large-scale deployments (100+ institutions, 10,000+ cadets) with real-time tracking, analytics, and admin controls.

Overview

Managing attendance across multiple NCC units manually is inefficient and error-prone.
This system digitizes the process by providing:

Centralized attendance tracking
Bulk student onboarding
Role-based access control
Real-time analytics and reporting

Designed for practical deployment in real NCC environments

Key Features

Admin Panel
Approve/reject new users
Manage colleges and cadets
Monitor system activity

Attendance Management
Mark attendance per session
Track cadet-wise attendance percentage
Eligibility calculation (e.g., ≥75%)

Bulk Student Upload
Upload Excel sheets to import students
Automatic parsing and validation
Duplicate detection via regimental numbers

Reports & Analytics
College-wise performance insights
Attendance trends
Export reports to Excel

Authentication & Authorization
Secure login system
Role-based access (Admin / User)
Protected routes

Tech Stack
Layer	Technology
Frontend	React + TypeScript + Tailwind CSS
Backend	Next.js API Routes
Database	Supabase
Deployment	Vercel
🌐 Live Demo

👉 https://10-tn-bn-attendence.vercel.app/



System Architecture
Frontend communicates with backend APIs via REST
Supabase handles:
Authentication
Database operations
Backend processes:
Attendance logic
Bulk uploads
Report generation

📂 Project Structure
├── app/api/               # Backend API routes
├── src/components/        # UI components
│   ├── admin/             # Admin-specific components
│   ├── ui/                # Reusable UI elements
├── pages/                 # Application pages
├── utils/                 # Helper functions

Security Features
Role-based access control
Protected routes using authentication middleware
Input validation for forms and uploads
Secure backend API handling

Scalability

This system is designed to scale:

Supports 35+ colleges
Handles 2,000+ users
Optimized for bulk operations and analytics
Future Enhancements
Geo-location based attendance
Activity logging & audit trails
Author

Shanmukh Srinivas

GitHub: https://github.com/ShanmukhS16
