# 🔐 Auth Service

> A production-grade Authentication & Authorization service built with **TypeScript**, **Express**, **PostgreSQL**, **Prisma**, and modern backend engineering practices.

This project is inspired by authentication platforms like **Auth0**, **Clerk**, **Firebase Auth**, and **Supabase Auth**. It is designed with scalability, security, maintainability, and production readiness in mind.

---

# ✨ Features

## ✅ Authentication

- User Registration
- User Login
- JWT Authentication
- Access & Refresh Tokens
- Refresh Token Rotation
- Refresh Token Hashing
- Protected Routes
- Current User API

## ✅ Session Management

- Multi-device Sessions
- Logout Current Session
- Logout All Sessions
- List Active Sessions
- Revoke Individual Session

## ✅ Account Management

- Email Verification
- Resend Verification Email
- Forgot Password
- Reset Password
- Change Password

## ✅ Security

- Argon2 Password Hashing
- JWT Authentication
- Refresh Token Rotation
- Secure Password Reset Flow
- Zod Validation
- Helmet
- CORS
- Centralized Error Handling
- Async Error Handling
- Environment Validation

---

# 🚧 Upcoming Features

- Redis Integration
- BullMQ Workers
- Background Email Queue
- Rate Limiting
- Account Locking
- Audit Logs
- Swagger Documentation
- Docker Support
- GitHub Actions
- Unit Tests
- Integration Tests
- k6 Benchmarking
- Health & Readiness Checks
- Graceful Shutdown
- Prometheus Metrics
- OpenTelemetry Tracing

---

# 🏗 Architecture

```text
                 Client

                    │

                    ▼

              Express Router

                    │

             Authentication Middleware

                    │

                    ▼

               Controllers

                    │

                    ▼

                 Services

                    │

                    ▼

               Repositories

                    │

                    ▼

             Prisma ORM

                    │

                    ▼

              PostgreSQL
```

---

# 📂 Project Structure

```text
src
│
├── config
│
├── core
│   ├── errors
│   ├── middleware
│   ├── logger
│   ├── utils
│   └── types
│
├── database
│
├── modules
│   └── auth
│       ├── controller.ts
│       ├── service.ts
│       ├── repository.ts
│       ├── routes.ts
│       ├── validation.ts
│       ├── jwt.ts
│       ├── middleware.ts
│       └── types.ts
│
├── routes
│
├── app.ts
└── server.ts
```

---

# 📌 API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | `/auth/register` |
| POST | `/auth/login` |
| POST | `/auth/refresh` |
| POST | `/auth/logout` |
| POST | `/auth/logout-all` |
| GET | `/auth/me` |

---

## Sessions

| Method | Endpoint |
|---------|----------|
| GET | `/auth/sessions` |
| DELETE | `/auth/sessions/:id` |

---

## Email

| Method | Endpoint |
|---------|----------|
| POST | `/auth/verify-email` |
| POST | `/auth/resend-verification` |

---

## Password

| Method | Endpoint |
|---------|----------|
| POST | `/auth/forgot-password` |
| POST | `/auth/reset-password` |
| POST | `/auth/change-password` |

---

# 🛡 Security Features

- Argon2 Password Hashing
- JWT Authentication
- Refresh Token Rotation
- Refresh Token Hashing
- Password Reset Tokens
- Email Verification Tokens
- Input Validation with Zod
- Protected Routes
- Centralized Error Handling
- Secure Environment Configuration

---

# ⚙ Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | JWT |
| Password Hashing | Argon2 |
| Validation | Zod |
| Logging | Pino |
| Containerization | Docker *(Upcoming)* |
| Cache | Redis *(Upcoming)* |
| Queue | BullMQ *(Upcoming)* |
| Testing | Vitest *(Upcoming)* |

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Naval1525/authService.git
cd authService
```

## Install

```bash
npm install
```

## Environment Variables

```env
PORT=8080

DATABASE_URL=

JWT_SECRET=

JWT_REFRESH_SECRET=

EMAIL_USER=

EMAIL_PASSWORD=
```

## Prisma

```bash
npx prisma migrate dev

npx prisma generate
```

## Start

```bash
npm run dev
```

---

# 📊 Current Progress

## ✅ Completed

- Authentication APIs
- Session Management
- Email Verification
- Password Reset
- Refresh Token Rotation
- Protected Routes
- Clean Architecture
- Repository Pattern
- Service Layer
- Zod Validation
- Prisma Integration
- PostgreSQL Integration

## 🚧 In Progress

- Docker
- Redis
- BullMQ
- Swagger
- Testing
- GitHub Actions
- Rate Limiting
- Health Checks
- Performance Benchmarking

---

# 📈 Scalability

The service is designed to be stateless and horizontally scalable.

Future deployment architecture:

```text
                 Load Balancer

                      │

      ┌───────────────┼───────────────┐

      ▼               ▼               ▼

   Auth API       Auth API       Auth API

      │               │               │

      └───────────────┼───────────────┘

                      │

          PostgreSQL        Redis

                      │

                 BullMQ Workers
```

---

# 🧪 Testing (Planned)

- Unit Tests
- Integration Tests
- Repository Tests
- API Tests

---

# 🚀 CI/CD (Planned)

- GitHub Actions
- Lint
- Type Check
- Build
- Test
- Docker Build

---

# 📈 Performance (Planned)

Benchmarked using **k6**.

Metrics to include:

- Throughput
- Average Latency
- P95 Latency
- P99 Latency
- Requests/sec
- Error Rate

---

# 📚 Future Improvements

- Google OAuth
- GitHub OAuth
- MFA / TOTP
- WebAuthn / Passkeys
- RBAC
- Organizations
- API Keys
- SSO / SAML
- OpenTelemetry
- Kubernetes Deployment

---

# 🤝 Contributing

Contributions are welcome. Feel free to fork the repository and open a pull request.

---

# 📄 License

MIT License

---

# 👨‍💻 Author

**Naval Bihani**

Backend Engineer | TypeScript | Go | Distributed Systems

GitHub: https://github.com/Naval1525

LinkedIn: https://www.linkedin.com/in/naval-bihani/
