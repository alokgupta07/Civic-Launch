# GovInnovate Backend (FastAPI)

Backend API for the **GovInnovate** platform — matches the React/Vite frontend
you already have (challenges, applications, evaluations, pilots, procurement).

Stack: FastAPI · SQLAlchemy · Alembic · JWT auth (python-jose) · bcrypt password
hashing (passlib) · SQLite by default (swap to Postgres with one env var).

---

## 1. Project structure

```
gov-innovate-backend/
├── app/
│   ├── main.py                # FastAPI app entry point, routers included here
│   ├── core/                  # config, security (JWT/hashing), database engine
│   ├── models/                # SQLAlchemy tables: User, Challenge, Application, Evaluation, Pilot
│   ├── schemas/                # Pydantic request/response models
│   ├── api/v1/                 # route handlers: auth, challenges, applications, evaluations, pilots
│   ├── api/deps.py             # get_current_user(), require_role() — auth guards
│   └── services/                # matching, scoring, notifications (business logic)
├── alembic/                    # DB migrations
├── scripts/seed_data.py         # loads demo data matching the frontend's dummy data
├── tests/                       # pytest suite (13 tests, all passing)
├── requirements.txt
└── .env.example
```

## 2. Setup

```bash
cd gov-innovate-backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then edit JWT_SECRET_KEY etc. if you want
```

By default `DATABASE_URL` in `.env` points at a local SQLite file
(`gov_innovate.db`) so there's nothing else to install to get running. To use
Postgres instead, set:

```
DATABASE_URL=postgresql://user:password@localhost:5432/gov_innovate
```

(`psycopg2-binary` is already in requirements.txt.)

## 3. Create the database tables

Two options — pick one:

**Quick start (dev):** tables are auto-created on first run via
`Base.metadata.create_all()` in `app/main.py` — just start the server (step 4)
and you're done.

**Proper migrations (recommended once you're iterating on the schema):**

```bash
alembic revision --autogenerate -m "initial tables"
alembic upgrade head
```

## 4. Seed demo data (optional but recommended)

Loads the same challenges/startups/evaluation/pilot data your frontend
currently hardcodes, so the API returns realistic results immediately:

```bash
python -m scripts.seed_data
```

This creates three demo logins (password for all: `password123`):

| Role       | Email                        |
|------------|-------------------------------|
| government | r.sharma@gov.example          |
| startup    | founder@agrosense.example     |
| evaluator  | a.iyer@gov.example             |

## 5. Run the API

```bash
uvicorn app.main:app --reload --port 8000
```

- API base: `http://127.0.0.1:8000/api/v1`
- Interactive docs (Swagger): `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

## 6. Run tests

```bash
python -m pytest tests/ -v
```

13 tests covering auth (register/login), challenges (create/update/role
guards), and applications (apply, ownership scoping). All run against an
in-memory SQLite DB — no setup needed.

---

## 7. Connecting the React (Vite) frontend

Your frontend currently renders everything from hardcoded arrays
(`CHALLENGES`, `STARTUPS`, etc.) inside `App.jsx`. To wire it to this API:

**a) CORS is already open for the Vite dev server.** `.env`'s `CORS_ORIGINS`
defaults to `http://localhost:5173,http://127.0.0.1:5173` — Vite's default
port. If your frontend runs elsewhere, add its origin to that list.

**b) Add a small API client to the frontend**, e.g. `src/api.js`:

```js
const API_BASE = "http://127.0.0.1:8000/api/v1";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();
  localStorage.setItem("token", data.access_token);
  return data;
}

export async function getChallenges() {
  const res = await fetch(`${API_BASE}/challenges`);
  return res.json();
}

export async function createChallenge(payload) {
  const res = await fetch(`${API_BASE}/challenges`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create challenge");
  return res.json();
}
```

**c) Replace the hardcoded `CHALLENGES` array** in `App.jsx` with a `useEffect`
that calls `getChallenges()` and stores the result in state — the rest of the
JSX (tables, cards, status badges) already reads from that shape, so no
markup changes needed as long as field names line up (they do: `id` →
`challenge_code`, `title`, `department`, `status`, `deadline`).

**d) Login flow:** replace the `setRole("government")` /
`setRole("startup")` buttons in `Header` with real calls to `login()`, then
decode the role from the JWT (or fetch `/api/v1/challenges` etc. — the
backend enforces the role server-side either way, so the frontend role state
is just for UI, not security).

**e) Vite proxy (optional, avoids CORS entirely in dev)** — add to
`vite.config.js`:

```js
export default {
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
};
```

Then call `fetch("/api/v1/challenges")` instead of the full URL.

---

## 8. API summary

| Method | Path                              | Auth              | Purpose |
|--------|------------------------------------|-------------------|---------|
| POST   | `/api/v1/auth/register`            | —                 | Create a user (government/startup/evaluator) |
| POST   | `/api/v1/auth/login`               | —                 | Get a JWT access token |
| GET    | `/api/v1/challenges`               | —                 | List challenges (Home / Startup Portal) |
| POST   | `/api/v1/challenges`               | government/admin  | Create challenge (Create Challenge wizard) |
| PATCH  | `/api/v1/challenges/{id}`          | government/admin  | Update status/details |
| GET    | `/api/v1/applications`             | any (scoped)      | List applications (startups see only their own) |
| POST   | `/api/v1/applications`             | startup           | Apply to a challenge |
| PATCH  | `/api/v1/applications/{id}`        | government/evaluator | Move through shortlisting |
| GET    | `/api/v1/evaluations/{app_id}`     | —                 | List evaluations for an application |
| POST   | `/api/v1/evaluations`              | government/evaluator | Submit rubric-based evaluation |
| GET    | `/api/v1/pilots`                   | —                 | List pilots (Pilot Monitoring page) |
| POST   | `/api/v1/pilots`                   | government/admin  | Start a pilot |
| GET    | `/api/v1/pilots/{id}/analytics`    | —                 | Progress/milestone summary |

Full interactive reference with request/response schemas: `/docs`.

## 9. Notes

- **Never commit `.env`** — it's in `.gitignore` already.
- `JWT_SECRET_KEY` in `.env.example` is a placeholder — generate a real one
  for anything beyond local dev, e.g. `python -c "import secrets; print(secrets.token_hex(32))"`.
- `app/services/matching_service.py` and `notification_service.py` are
  intentionally simple (keyword matching, console-logged notifications) so
  the project runs with zero external accounts. Swap them for a real
  embeddings model / email provider when you're ready — every route already
  calls through these modules, so that's the only place you need to touch.
