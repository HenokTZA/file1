# CSMS Authentication & User API

A concise, production-ready reference for authenticating users in the CSMS backend, retrieving the current user profile, and viewing charge point data and session stats.

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
  -d "{"username":"henoka","email":"test1@example.com","full_name":"Henoka Tadelea","password":"MyP@ssw0rd","password2":"MyP@ssw0rd","role":"user"}"
```

Another example (super admin):

```bat
curl -s -X POST "%BASE%/api/auth/signup/" ^
  -H "Content-Type: application/json" ^
  -d "{"username":"henokaa","email":"test2@example.com","full_name":"Henokaa Tadeleaa","password":"MyP@ssw0rd","password2":"MyP@ssw0rd","role":"super_admin"}"
```

**Success (example):**
```json
{"detail":"ok"}
```

### 2) Log in (get JWT pair)

```bat
curl -s -X POST "%BASE%/api/auth/login/" ^
  -H "Content-Type: application/json" ^
  -d "{"username":"henokaa","password":"MyP@ssw0rd"}"
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
  "tenant_ws": "ws://147.93.127.215:8000/api/v16/85f8e0c7dc075c57b0f2141bc1dabe45",
  "username":"Yona",
  "full_name":"Yonatan",
  "phone":"0912122222"
}
```

### 4) Refresh access token

```bat
curl -s -X POST "%BASE%/api/auth/refresh/" ^
  -H "Content-Type: application/json" ^
  -d "{"refresh":"%REFRESH%"}"
```

**Success (example):**
```json
{ "access": "<NEW_ACCESS_JWT>" }
```

### 5) Request password reset (email is sent with reset link)

```bat
curl -s -X POST "%BASE%/api/auth/password/reset/" ^
  -H "Content-Type: application/json" ^
  -d "{"email":"ydidyatadele99@gmail.com"}"
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
  -d "{"uid":"<UID>","token":"<TOKEN>","new_password":"<NEW_PASSWORD>"}"
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
  -d "{"refresh":"%REFRESH%"}"
```

**Success (example):**
```json
{"detail":"Logout successful"}
```

### 8) List my charge points

```bat
curl -s "%BASE%/api/charge-points/" ^
  -H "Authorization: Bearer %ACCESS%"
```

**Success (example):**
```json
[{"pk":"BURA","id":"BURA","name":"BURA","connector_id":0,"status":"Unavailable","updated":"2025-08-30T19:08:13.725980Z","price_per_kwh":"10.000","price_per_hour":"10.000","location":"234","lat":"46.876700","lng":"7.559829","owner_username":"bura"},{"pk":"FIRST","id":"FIRST","name":"FIRST","connector_id":0,"status":"Unavailable","updated":"2025-08-30T18:17:56.213893Z","price_per_kwh":"15.000","price_per_hour":"12.000","location":"bole","lat":"46.860142","lng":"7.491126","owner_username":"bura"},{"pk":"SECOND","id":"SECOND","name":"SECOND","connector_id":0,"status":"Unavailable","updated":"2025-08-10T22:54:00.040422Z","price_per_kwh":null,"price_per_hour":null,"location":"eth","lat":null,"lng":null,"owner_username":"bura"},{"pk":"THIRD","id":"THIRD","name":"THIRD","connector_id":1,"status":"Preparing","updated":"2025-08-22T21:39:10.817983Z","price_per_kwh":null,"price_per_hour":null,"location":"hi","lat":"47.193309","lng":"6.642280","owner_username":"bura"}]
```

### 9) Revenue (lifetime and current month)

```bat
curl -s "%BASE%/api/sessions/revenue/" ^
  -H "Authorization: Bearer %ACCESS%"
```

**Success (example):**
```json
{"lifetime":22547.45,"month":16888.33,"month_label":"August 2025"}
```

### 10) Charge point status stats (admin)

```bat
curl -s "%BASE%/api/admin/charge-points/stats/" ^
  -H "Authorization: Bearer %ACCESS%"
```

**Success (example):**
```json
{"by_status":{"Preparing":1,"Unavailable":3},"totals":{"available":0,"unavailable":3,"charging":0,"occupied":0,"preparing":1,"other":0}}
```

### 11) List charging sessions / transactions

If you only need the last 10 sessions, use `?limit=10` (max 200). `offset` is also supported.

```bat
curl -s "%BASE%/api/sessions/?limit=10" ^
  -H "Authorization: Bearer %ACCESS%"
```

**Success (example):**
```json
[{"id":75,"cp":"FIRST","user":"","kWh":0.0,"Started":"2025-08-28T10:09:53Z","Ended":null,"price_kwh":"15.000","price_hour":"12.000","total":697.262},{"id":74,"cp":"FIRST","user":"","kWh":0.0,"Started":"2025-08-28T10:08:40Z","Ended":null,"price_kwh":"15.000","price_hour":"12.000","total":697.505},{"id":73,"cp":"FIRST","user":"","kWh":0.0,"Started":"2025-08-28T10:06:46Z","Ended":null,"price_kwh":"15.000","price_hour":"12.000","total":697.885},{"id":72,"cp":"FIRST","user":"","kWh":0.0,"Started":"2025-08-28T10:06:01Z","Ended":null,"price_kwh":"15.000","price_hour":"12.000","total":698.035},{"id":69,"cp":"FIRST","user":"Henok","kWh":0.132,"Started":"2025-08-19T21:34:55Z","Ended":"2025-08-19T21:35:23Z","price_kwh":"15.000","price_hour":"12.000","total":2.073},{"id":68,"cp":"FIRST","user":"Henok","kWh":0.18,"Started":"2025-08-19T21:33:48Z","Ended":"2025-08-19T21:34:26Z","price_kwh":"15.000","price_hour":"12.000","total":2.827},{"id":67,"cp":"FIRST","user":"Henok","kWh":0.042,"Started":"2025-08-19T21:32:53Z","Ended":"2025-08-19T21:33:04Z","price_kwh":"15.000","price_hour":"12.000","total":0.667},{"id":66,"cp":"FIRST","user":"Henok","kWh":0.0,"Started":"2025-08-19T21:32:03Z","Ended":null,"price_kwh":"15.000","price_hour":"12.000","total":3152.828},{"id":65,"cp":"FIRST","user":"Henok","kWh":0.03,"Started":"2025-08-19T21:31:03Z","Ended":"2025-08-19T21:31:11Z","price_kwh":"15.000","price_hour":"12.000","total":0.477},{"id":64,"cp":"FIRST","user":"Henok","kWh":0.0,"Started":"2025-08-19T21:14:24Z","Ended":null,"price_kwh":"15.000","price_hour":"12.000","total":3156.358}]
```

---

## Endpoint Reference

| Path                                       | Method | Description                                   | Auth Needed | Notes |
|--------------------------------------------|--------|-----------------------------------------------|-------------|-------|
| `/api/auth/signup/`                        | POST   | Create a user account                          | No          |       |
| `/api/auth/login/`                         | POST   | Obtain JWT access/refresh pair                 | No          |       |
| `/api/auth/refresh/`                       | POST   | Refresh access token                           | No*         | Uses refresh JWT |
| `/api/auth/password/reset/`                | POST   | Request password reset email                   | No          |       |
| `/api/auth/password/reset/confirm/`        | POST   | Confirm reset with UID + token + new password  | No          |       |
| `/api/auth/logout/`                        | POST   | Log out (server-side invalidate)               | Yes         | Send access + refresh |
| `/api/me/`                                 | GET    | Get current user profile                       | Yes         | Send access JWT |
| `/api/charge-points/`                      | GET    | List my charge points                          | Yes         | Current user’s charge points |
| `/api/sessions/revenue/`                   | GET    | Revenue summary (lifetime & current month)     | Yes         | Returns `lifetime`, `month`, `month_label` |
| `/api/admin/charge-points/stats/`          | GET    | Charge point status stats                       | Yes         | Admin only (`super_admin`) |
| `/api/sessions/`                           | GET    | List charging sessions / transactions          | Yes         | Query: `limit` (≤200), `offset` |

\* No `Authorization` header is required for `/auth/refresh/`, but the refresh token is mandatory in the JSON body.

---

## Authentication Model

- **JWT Access Token**: short-lived; used in the `Authorization` header.  
  Example: `Authorization: Bearer <ACCESS_JWT>`
- **JWT Refresh Token**: longer-lived; used to obtain a new access token via `/auth/refresh/`.
- **Logout** requires both:
  - `Authorization: Bearer <ACCESS_JWT>` header, and
  - JSON body `{ "refresh": "<REFRESH_JWT>" }` to invalidate the refresh token on the server.

> Never expose tokens in URLs or client-side logs. Store refresh tokens securely and rotate access tokens regularly.

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

curl -s -X POST "$BASE/api/auth/login/"   -H "Content-Type: application/json"   -d '{"username":"henokaa","password":"MyP@ssw0rd"}'
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
- `401 Unauthorized` – missing or invalid access token.
- `403 Forbidden` – authenticated but not permitted for the action.
- `404 Not Found` – endpoint or resource not found.
- `429 Too Many Requests` – client exceeded rate limits.
- `500 Internal Server Error` – unexpected server error.

Include the response body when reporting issues, especially for 4xx errors.

---

## Security Checklist

- Always use HTTPS in production.
- Keep access tokens short-lived; refresh to obtain new ones as needed.
- Store refresh tokens in an http-only, secure storage layer on trusted clients or servers.
- Revoke refresh tokens on logout and upon suspicious activity.
- Rotate credentials and monitor audit logs.

---

## Changelog

- **v1.1.0** – Added endpoints for charge points, revenue, status stats, and sessions.
- **v1.0.0** – Initial public documentation for CSMS Auth & User API.
