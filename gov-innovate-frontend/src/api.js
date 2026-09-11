/* ============================================================
   API client for the GovInnovate FastAPI backend.
   Requests go through the Vite dev proxy (see vite.config.js),
   so we call relative paths like /api/v1/... — no CORS setup needed.
   ============================================================ */

const API_BASE = "/api/v1";

function authHeaders() {
  const token = localStorage.getItem("gi_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  return res.json();
}

/* ---------------- Auth ---------------- */

export async function register({ name, email, password, role, organization }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role, organization }),
  });
  return handle(res);
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handle(res);
  localStorage.setItem("gi_token", data.access_token);
  return data;
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
  return handle(res);
}

export function logout() {
  localStorage.removeItem("gi_token");
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("gi_token"));
}

/* ---------------- Challenges ---------------- */

/* ---------------- Challenges ---------------- */

export async function getChallenges(statusFilter) {
  const url = statusFilter
    ? `${API_BASE}/challenges?status_filter=${encodeURIComponent(statusFilter)}`
    : `${API_BASE}/challenges`;

  const res = await fetch(url);
  return handle(res);
}

export async function getChallenge(id) {
  const res = await fetch(`${API_BASE}/challenges/${id}`);
  return handle(res);
}

export async function createChallenge(payload) {
  const res = await fetch(`${API_BASE}/challenges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handle(res);
}

export async function updateChallenge(id, payload) {
  const res = await fetch(`${API_BASE}/challenges/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handle(res);
}

/* ---------------- Applications ---------------- */

export async function getApplications(challengeId) {
  const url = challengeId
    ? `${API_BASE}/applications?challenge_id=${challengeId}`
    : `${API_BASE}/applications`;
  const res = await fetch(url, { headers: authHeaders() });
  return handle(res);
}

export async function applyToChallenge(challengeId, applicationData) {
  const res = await fetch(`${API_BASE}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      challenge_id: challengeId,
      proposal: applicationData.proposal,
      technology_approach: applicationData.technology_approach,
      expected_impact: applicationData.expected_impact,
      team_details: applicationData.team_details,
      estimated_budget: applicationData.estimated_budget,
      pilot_plan: applicationData.pilot_plan,
    }),
  });

  return handle(res);
}

export async function updateApplication(id, payload) {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

/* ---------------- Evaluations ---------------- */

export async function getEvaluationsForApplication(applicationId) {
  const res = await fetch(`${API_BASE}/evaluations/${applicationId}`, { headers: authHeaders() });
  return handle(res);
}

export async function submitEvaluation(applicationId, scores, remarks) {
  const res = await fetch(`${API_BASE}/evaluations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ application_id: applicationId, scores, remarks }),
  });
  return handle(res);
}

/* ---------------- Pilots ---------------- */

export async function getPilots()
 {
  const res = await fetch(`${API_BASE}/pilots`);
  return handle(res);
}
export async function updatePilot(pilotId, payload) {
  const res = await fetch(`${API_BASE}/pilots/${pilotId}`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handle(res);
}
export async function createPilot(payload) {
  const res = await fetch(`${API_BASE}/pilots`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handle(res);
}
