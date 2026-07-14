# Architecture

Diagrams for the Authentication Service. All diagrams use [Mermaid](https://mermaid.js.org/) and render natively on GitHub.

---

## 1. High-Level Architecture

```mermaid
flowchart LR
  Client["Client\n(web / mobile)"]

  subgraph API["API Process (Express)"]
    MW["Middleware\ncors · helmet · rate limiter · auth"]
    RT["Routes\n/api/v1/auth/*"]
    CTRL["Controllers\n(Zod validation)"]
    SVC["Service Layer\n(business logic)"]
    REPO["Repository\n(Prisma)"]
    PROD["Job Producers\n(BullMQ)"]
  end

  subgraph Worker["Worker Process"]
    WRK["Email Worker\n(BullMQ)"]
    MAIL["Mailer\n(Nodemailer)"]
  end

  PG[("PostgreSQL")]
  RD[("Redis")]
  SMTP["SMTP Provider"]

  Client -->|HTTP| MW --> RT --> CTRL --> SVC
  SVC --> REPO --> PG
  SVC --> PROD -->|enqueue| RD
  MW -->|rate limit counters| RD
  RD -->|jobs| WRK --> MAIL --> SMTP
```

---

## 2. Authentication Flow (Register → Verify → Login)

```mermaid
sequenceDiagram
  actor U as User
  participant API
  participant DB as PostgreSQL
  participant Q as Redis (queue)
  participant W as Worker

  U->>API: POST /auth/register
  API->>DB: create user (Argon2 hash)
  API->>Q: enqueue verification email
  API-->>U: 201 Created
  Q->>W: verify-email job
  W-->>U: verification email (SMTP)

  U->>API: POST /auth/verify-email { token }
  API->>DB: mark isEmailVerified = true
  API-->>U: 200 OK

  U->>API: POST /auth/login { email, password }
  API->>DB: verify password (Argon2)
  API->>DB: create session (refresh token hash)
  API-->>U: 200 { accessToken, refreshToken }

  U->>API: GET /auth/me (Bearer accessToken)
  API->>API: verify JWT
  API-->>U: 200 { user }
```

---

## 3. Refresh Token Rotation

```mermaid
sequenceDiagram
  actor U as User
  participant API
  participant DB as PostgreSQL

  U->>API: POST /auth/refresh { refreshToken }
  API->>DB: find session by token hash
  alt token valid & not expired
    API->>DB: rotate — replace refresh token hash
    API-->>U: 200 { new accessToken, new refreshToken }
  else token reused / invalid / expired
    API-->>U: 401 Unauthorized
  end
```

Each refresh **rotates** the stored token hash, so a previously issued refresh
token can be used only once. A reused (already-rotated) token is rejected.

---

## 4. Session Management

```mermaid
flowchart TD
  Login["Login / Refresh"] -->|create / update| S[(Session rows\nper device)]

  S --> L["GET /auth/sessions\nlist active sessions"]
  S --> R["DELETE /auth/sessions/:id\nrevoke one"]
  S --> LO["POST /auth/logout\nrevoke current"]
  S --> LA["POST /auth/logout-all\nrevoke all"]

  R -->|delete row| S
  LO -->|delete current| S
  LA -->|delete all for user| S
```

Every login creates a session row (device, IP, timestamps). Sensitive actions
such as password reset/change revoke other sessions.

---

## 5. Deployment Architecture (Docker Compose)

```mermaid
flowchart TB
  subgraph Host["Docker Compose"]
    direction TB
    PG[("postgres:16\nvolume: postgres_data")]
    RD[("redis:7\nvolume: redis_data")]
    MG["migrate\n(prisma migrate deploy)\none-shot"]
    API["api\nnode dist/server.js\n:8080"]
    WK["worker\nnode dist/worker.js"]
  end

  PG -. healthcheck .-> MG
  MG -->|completed| API
  MG -->|completed| WK
  PG --> API
  RD --> API
  PG --> WK
  RD --> WK

  Internet["Client"] -->|:8080| API
```

`migrate` runs once and exits after applying migrations; `api` and `worker`
start only after it succeeds and after Postgres/Redis report healthy. `api` and
`worker` are the **same image** with different start commands.
