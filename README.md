Wellbeing & Small-Group Community App – Backend

Overview

This project is a backend API for a wellbeing application that supports small, private groups.
The goal is to reduce loneliness and stress by enabling calm, low-threshold social interaction.
The backend was developed as part of a UX / User-Centered Design (UCD) course project.

Purpose
Support small closed groups (4–12 users)
Ensure privacy and GDPR compliance
Enable a calm user experience with minimal notifications
Provide a secure and reliable API for frontend development

Target Group & Stakeholders
Young adults and adults seeking social connection
Group facilitators
Developers
Educational institution

Core Backend Features
User registration and secure login (JWT)
User profiles and privacy settings
Small group creation and invitation-based membership
Group-only posts and comments (no public feed)
Event creation and RSVP handling

Technology
Node.js & TypeScript
Express.js
PostgreSQL + Prisma ORM
JWT authentication
Swagger / OpenAPI documentation
Docker (development)

Architecture
The backend follows a layered architecture:
Routes → Controllers → Services → Database
This supports clean separation of concerns, easy testing, and agile development.

Running the Project
Install dependencies
npm install
Set environment variables
cp .env.example .env
Start database (Docker)
docker-compose -f docker-compose.dev.yml up -d
Run migrations
npm run prisma:migrate
Start server
npm run dev
Server runs at: http://localhost:3000

UX & Course Alignment
Designed to support User-Centered Design
Backend enables usability testing and iteration
Features map directly to user stories
Supports agile, sprint-based development
Privacy-first and calm UX by design
