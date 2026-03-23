# Mokebook — API Connection Report

> This document maps every frontend call in the **Mokebook** student application to its corresponding backend endpoint, authentication requirements, and response structure.

---

## API Configuration

| Setting | Local | Production |
|---|---|---|
| **Base URL** | `http://localhost:4000/api` | `https://eduhub-backend.onrender.com/api` |
| **How selected** | Auto-detected via `window.location.hostname` | Falls back when hostname ≠ localhost |
| **Override env var** | `NEXT_PUBLIC_API_URL` | Same |
| **Org ID** | `NEXT_PUBLIC_ORG_ID` or `GK-ORG-00001` | Same |

### Authentication Headers (set by `apiFetch` in `src/lib/api.ts`)

Every request (after login) sends:
```
Authorization: Bearer <token>   ← JWT token from 'token' cookie
X-Org-Id: <orgId>              ← Organization ID
Content-Type: application/json
```

---

## 1. Organization & Public Data

| Page | Frontend Call | Backend Endpoint | Auth |
|---|---|---|---|
| All pages (init) | `GET /organizations/public/:orgId` | `/api/organizations/public/:id` | ❌ None |
| Tests page | `GET /mockbook/folders` | `/api/mockbook/folders` | ✅ Bearer |
| Tests page | `GET /mockbook/categories` | `/api/mockbook/categories` | ✅ Bearer |
| Tests page | `GET /mockbook/public` | `/api/mockbook/public` | ✅ Bearer |

---

## 2. Authentication Flow

### Login
```
POST /api/auth/login
Body: { email, password, orgId }
Response: { token, user }
```
The token is stored in the `token` cookie (7 day expiry).

### Registration
```
POST /api/auth/register
Body: { name, email, password, orgId }
```

### Profile Fetch (me)
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { data: { id, name, email, ... } }
```

---

## 3. Mock Test Lifecycle

### List Tests
```
GET /api/mockbook/tests
Headers: X-Org-Id, Authorization
```

### Test Instructions
```
GET /api/mockbook/tests/:id
Headers: X-Org-Id, Authorization
```

### Fetch Questions (Exam Page)
```
GET /api/mockbook/tests/:id/questions
Headers: X-Org-Id, Authorization
Response: { data: { name, durationMins, questions: [...] } }
```

### Start Attempt
```
POST /api/mockbook/tests/:id/attempts
Headers: Authorization, X-Org-Id
Body: { action: "start" }
Response: { data: { id, status } }
```

### Submit Attempt (**Bug-fixed**)
```
POST /api/mockbook/tests/:id/attempts
Headers: Authorization, X-Org-Id
Body: {
  action: "submit",
  answers: [
    { questionId: string, selectedOptions: string[] }
  ]
}
Response: { success: true, data: { attemptId: string, ... } }
```
> ⚠️ **Previous Bug**: The frontend was checking `res.data.id` first, but the backend returns `res.data.attemptId`. Fixed to check `attemptId || id`.

### Fetch Results
```
GET /api/mockbook/attempts/:attemptId/results
Headers: Authorization, X-Org-Id
```

---

## 4. Student Profile

```
GET /api/students/me
Headers: Authorization, X-Org-Id
Response: { data: { name, email, avatar, ... } }
```

---

## 5. Token Cookie Flow

```
1. User logs in → POST /auth/login → receives JWT
2. Frontend stores JWT in 'token' cookie (plain JS, not httpOnly)
3. Every apiFetch() call reads the cookie and adds Authorization header
4. isAuthenticated() helper verifies cookie exists and is non-empty
5. Exam page checks authentication before loading and before submitting
6. On token expiry, backend returns 401 → apiFetch throws "Unauthorized"
7. Frontend shows "Session Expired" toast and redirects to /login
```

---

## 6. Production vs Local Parity

- Both environments use the **same production Supabase database**
- The only difference is the API base URL (localhost vs render.com)
- Environment is auto-detected — no code changes needed for deployment
- CORS is configured in the backend to allow all localhost ports

---

## 7. Key Environment Variables (Mokebook `.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api   # Override API base URL
NEXT_PUBLIC_ORG_ID=GK-ORG-00001               # Your organization ID
```
