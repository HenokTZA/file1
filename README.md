# CSMS Authentication & User API

A concise, production‑ready reference for authenticating users in the CSMS backend and retrieving the current user profile.

> **Base URL**
>
> ```text
> http://147.93.127.215:8000
> ```
>
> All endpoints below are prefixed with `/api`.

---

## Quick Start (Windows CMD)

```bat
:: Base URL
set BASE=http://147.93.127.215:8000
```

### 1) Sign up

```bat
curl -s -X POST "%BASE%/api/auth/signup/" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"henoka\",\"email\":\"test1@example.com\",\"full_name\":\"Henoka Tadelea\",\"password\":\"MyP@ssw0rd\",\"password2\":\"MyP@ssw0rd\",\"role\":\"user\"}"
```

Another example (super admin):

```bat
curl -s -X POST "%BASE%/api/auth/signup/" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"henokaa\",\"email\":\"test2@example.com\",\"full_name\":\"Henokaa Tadeleaa\",\"password\":\"MyP@ssw0rd\",\"password2\":\"MyP@ssw0rd\",\"role\":\"super_admin\"}"
```

**Success (example):**
```json
{"detail":"ok"}
```

### 2) Log in (get JWT pair)

```bat
curl -s -X POST "%BASE%/api/auth/login/" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"henokaa\",\"password\":\"MyP@ssw0rd\"}"
```

**Success (example):**
```json
{
  "refresh": "<REFRESH_JWT>",
  "access": "<ACCESS_JWT>",
  "role":"super_admin"
}
```

Save tokens in env vars for later calls:

```bat
set ACCESS=<ACCESS_JWT>
set REFRESH=<REFRESH_JWT>
```

### 3) Get current user

```bat
curl "%BASE%/api/me/" -H "Authorization: Bearer %ACCESS%"
```

**Success (example):**
```json
{
  "id": 48,
  "email": "test2@example.com",
  "role": "super_admin",
  "tenant_id": 23,
  "tenant_ws": "ws://147.93.127.215:8000/api/v16/85f8e0c7dc075c57b0f2141bc1dabe45"
}
```

### 4) Refresh access token

```bat
curl -s -X POST "%BASE%/api/auth/refresh/" ^
  -H "Content-Type: application/json" ^
  -d "{\"refresh\":\"%REFRESH%\"}"
```

**Success (example):**
```json
{ "access": "<NEW_ACCESS_JWT>" }
```

### 5) Request password reset (email is sent with reset link)

```bat
curl -s -X POST "%BASE%/api/auth/password/reset/" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"ydidyatadele99@gmail.com\"}"
```

**Success (example):**
```json
{"detail":"Password reset e-mail sent"}
```

Email contains a link like:
```
http://147.93.127.215:5173/reset-password/<UID>/<TOKEN>
```

### 6) Confirm password reset

After opening the link above and choosing a new password, call:

```bat
curl -s -X POST "%BASE%/api/auth/password/reset/confirm/" ^
  -H "Content-Type: application/json" ^
  -d "{\"uid\":\"<UID>\",\"token\":\"<TOKEN>\",\"new_password\":\"<NEW_PASSWORD>\"}"
```

**Success (example):**
```json
{"detail":"Password has been reset"}
```

### 7) Log out (invalidate tokens / end session)

```bat
curl -s -X POST "%BASE%/api/auth/logout/" ^
  -H "Authorization: Bearer %ACCESS%" ^
  -H "Content-Type: application/json" ^
  -d "{\"refresh\":\"%REFRESH%\"}"
```

**Success (example):**
```json
{"detail":"Logout successful"}
```

---

## Endpoint Reference

| Path                                  | Method | Description                                   | Auth Needed | Notes            |
|---------------------------------------|--------|-----------------------------------------------|-------------|------------------|
| `/api/auth/signup/`                   | POST   | Create a user account                          | No          |                  |
| `/api/auth/login/`                    | POST   | Obtain JWT access/refresh pair                 | No          |                  |
| `/api/auth/refresh/`                  | POST   | Refresh access token                           | No*         | Uses refresh JWT |
| `/api/auth/password/reset/`           | POST   | Request password reset email                   | No          |                  |
| `/api/auth/password/reset/confirm/`   | POST   | Confirm reset with UID + token + new password  | No          |                  |
| `/api/auth/logout/`                   | POST   | Log out (server-side invalidate)               | Yes         | Send access + refresh |
| `/api/me/`                            | GET    | Get current user profile                       | Yes         | Send access JWT  |

\* *No user auth header is required for `/auth/refresh/`, but the **refresh token** is mandatory in the JSON body.*

---

## Authentication Model

- **JWT Access Token**: short‑lived; used in the `Authorization` header.
  - Example: `Authorization: Bearer <ACCESS_JWT>`
- **JWT Refresh Token**: longer‑lived; used to obtain a new access token via `/auth/refresh/`.
- **Logout** requires both:
  - `Authorization: Bearer <ACCESS_JWT>` header, and
  - JSON body `{ "refresh": "<REFRESH_JWT>" }` to invalidate the refresh token on the server.

> **Never** expose tokens in URLs or client‑side logs. Store refresh tokens securely and rotate access tokens regularly.

---

## Example Responses

### Login
```json
{
  "refresh":"<REFRESH_JWT>",
  "access":"<ACCESS_JWT>",
  "role":"super_admin"
}
```

### Refresh
```json
{
  "access":"<NEW_ACCESS_JWT>"
}
```

### Me
```json
{
  "id":48,
  "email":"test2@example.com",
  "role":"super_admin",
  "tenant_id":23,
  "tenant_ws":"ws://147.93.127.215:8000/api/v16/85f8e0c7dc075c57b0f2141bc1dabe45"
}
```

---

## cURL (bash) equivalents

```bash
BASE="http://147.93.127.215:8000"

curl -s -X POST "$BASE/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"henokaa","password":"MyP@ssw0rd"}'
```

Add the header when calling authenticated endpoints:
```bash
curl "$BASE/api/me/" -H "Authorization: Bearer $ACCESS"
```

---

## Postman Tips

1. **Create an Environment** with `BASE`, `ACCESS`, and `REFRESH` variables.
2. **Login** request: save `access` to `ACCESS` and `refresh` to `REFRESH` via a **Tests** script:
   ```js
   let data = pm.response.json();
   pm.environment.set("ACCESS", data.access);
   pm.environment.set("REFRESH", data.refresh);
   ```
3. **Authenticated requests**: set an **Authorization** header with `Bearer {{ACCESS}}`.
4. **Token refresh**: call `/auth/refresh/` with body `{ "refresh": "{{REFRESH}}" }` and update `ACCESS` in the **Tests** tab.
5. **Logout**: send both the `Authorization: Bearer {{ACCESS}}` header and the JSON body `{ "refresh": "{{REFRESH}}" }`.

---

## Error Handling (common HTTP codes)

- `400 Bad Request` – malformed input or validation error.
- `401 Unauthorized` – missing/invalid access token.
- `403 Forbidden` – authenticated but not permitted for the action.
- `404 Not Found` – endpoint or resource not found.
- `429 Too Many Requests` – client exceeded rate limits.
- `500 Internal Server Error` – unexpected server error.

Include the response body when reporting issues—especially for 4xx errors.

---

## Security Checklist

- Always use HTTPS in production.
- Keep access tokens short‑lived; refresh to obtain new ones as needed.
- Store refresh tokens in an http‑only, secure storage layer on trusted clients/servers.
- Revoke refresh tokens on logout and upon suspicious activity.
- Rotate credentials and monitor audit logs.

---

## Changelog

- **v1.0.0** – Initial public documentation for CSMS Auth & User API.
