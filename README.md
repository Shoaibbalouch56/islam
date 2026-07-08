# Door-to-Door Islam Backend

NestJS REST API for the Door-to-Door Islam app — authentication, role-based access (User, Student, Teacher), and Google SSO.

**Base URL:** `http://localhost:3000`  
**Swagger UI:** `http://localhost:3000/api`  
**Auth:** `Authorization: Bearer <jwt_token>`

---

## Quick Start

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, SMTP, Firebase
npx prisma migrate deploy
npm run dev
```

---

## Auth API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Sign up → sends OTP email |
| POST | `/auth/verify-otp` | Verify 6-digit OTP → JWT |
| POST | `/auth/login` | Email/password login |
| POST | `/auth/google` | Google SSO (Firebase token) |
| POST | `/auth/forgot-password` | Send password reset OTP |
| POST | `/auth/verify-reset-otp` | Verify reset OTP |
| POST | `/auth/reset-password` | Set new password |
| GET | `/auth/me` | Current user (JWT required) |
| GET | `/users/me` | Get profile |
| PATCH | `/users/me` | Update profile |

---

## Roles

- **USER** — Explore app & share knowledge
- **STUDENT** — Learn Quran, Hadith & Islamic studies
- **TEACHER** — Manage classes & students

---

## Database

PostgreSQL database: `islam`

```bash
npm run db:migrate          # Create new migration (dev)
npm run db:migrate:deploy   # Apply migrations (production)
```
