# ResourceX

**ResourceX** is a cross-campus resource sharing platform designed to help
university students securely lend, borrow, and manage academic and personal
resources within a trusted campus community.

**ResourceX** is developed as part of a **Level 2 Term 2** coursework project
at the **Department of Computer Science and Engineering (CSE), CUET**.

## Features

- Secure student authentication with email verification
- Browse, search, and filter resource listings
- Lend and borrow academic or personal resources
- Manage the complete booking lifecycle
- Real-time messaging between users
- Reviews and a trust-based reputation system
- Reporting and moderation tools
- Role-based dashboards and access control

## Tech Stack

| Layer    | Technologies                                                         |
| -------- | -------------------------------------------------------------------- |
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS                          |
| Backend  | Java 21, Spring Boot 3.3.5, Spring Security, Spring Data JPA, Flyway |
| Database | Aiven MySQL (Production), H2 (Local Development)                     |
| Other    | JWT Authentication, WebSocket, Maven, Docker                         |

## Live Demo

🌐 <https://resourcex-web.vercel.app>

## Getting Started

Follow the steps below to run the project locally.

### Prerequisites

- Java 21
- Node.js 18+ and npm

The backend ships with the Maven Wrapper (`./mvnw` / `mvnw.cmd`), so a global
Maven installation is not required.

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend/web
npm install
npm run dev
```

## Project Status

ResourceX has been successfully deployed to production. Production verification
is currently in progress, and a more comprehensive README — covering
architecture, screenshots, deployment guide, API documentation, and other
supporting material — will be added once verification is complete.
