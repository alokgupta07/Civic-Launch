from tests.conftest import register_and_login


def _create_challenge(client, headers, code="GC-2026-200"):
    resp = client.post(
        "/api/v1/challenges",
        headers=headers,
        json={"challenge_code": code, "title": "Test Challenge", "department": "Ministry of Power"},
    )
    return resp.json()["id"]


def test_startup_can_apply_to_challenge(client):
    gov_headers = register_and_login(client, "officer10@gov.example", role="government")
    challenge_id = _create_challenge(client, gov_headers)

    startup_headers = register_and_login(client, "startup10@example.com", role="startup")
    resp = client.post(
        "/api/v1/applications",
        headers=startup_headers,
        json={"challenge_id": challenge_id, "proposal": "Our AI-based solution."},
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "SUBMITTED"


def test_government_cannot_apply(client):
    gov_headers = register_and_login(client, "officer11@gov.example", role="government")
    challenge_id = _create_challenge(client, gov_headers, code="GC-2026-201")

    resp = client.post(
        "/api/v1/applications",
        headers=gov_headers,
        json={"challenge_id": challenge_id, "proposal": "Should not be allowed."},
    )
    assert resp.status_code == 403


def test_startup_sees_only_own_applications(client):
    gov_headers = register_and_login(client, "officer12@gov.example", role="government")
    challenge_id = _create_challenge(client, gov_headers, code="GC-2026-202")

    startup_a = register_and_login(client, "startupA@example.com", role="startup")
    startup_b = register_and_login(client, "startupB@example.com", role="startup")

    client.post(
        "/api/v1/applications", headers=startup_a,
        json={"challenge_id": challenge_id, "proposal": "From startup A"},
    )
    client.post(
        "/api/v1/applications", headers=startup_b,
        json={"challenge_id": challenge_id, "proposal": "From startup B"},
    )

    resp = client.get("/api/v1/applications", headers=startup_a)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["proposal"] == "From startup A"


def test_government_sees_all_applications(client):
    gov_headers = register_and_login(client, "officer13@gov.example", role="government")
    challenge_id = _create_challenge(client, gov_headers, code="GC-2026-203")
    startup_headers = register_and_login(client, "startup13@example.com", role="startup")

    client.post(
        "/api/v1/applications", headers=startup_headers,
        json={"challenge_id": challenge_id, "proposal": "Proposal"},
    )

    resp = client.get("/api/v1/applications", headers=gov_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
