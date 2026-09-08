from tests.conftest import register_and_login


def test_list_challenges_is_public(client):
    resp = client.get("/api/v1/challenges")
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_challenge_requires_government_role(client):
    headers = register_and_login(client, "startup1@example.com", role="startup")
    resp = client.post(
        "/api/v1/challenges",
        headers=headers,
        json={
            "challenge_code": "GC-2026-099",
            "title": "Test Challenge",
            "department": "Ministry of Power",
        },
    )
    assert resp.status_code == 403


def test_government_can_create_challenge(client):
    headers = register_and_login(client, "officer1@gov.example", role="government")
    resp = client.post(
        "/api/v1/challenges",
        headers=headers,
        json={
            "challenge_code": "GC-2026-099",
            "title": "Smart Grid Monitoring",
            "department": "Ministry of Power",
            "status": "PUBLISHED",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["challenge_code"] == "GC-2026-099"
    assert body["status"] == "PUBLISHED"


def test_duplicate_challenge_code_rejected(client):
    headers = register_and_login(client, "officer2@gov.example", role="government")
    payload = {
        "challenge_code": "GC-2026-100",
        "title": "Duplicate Test",
        "department": "Ministry of Power",
    }
    client.post("/api/v1/challenges", headers=headers, json=payload)
    resp = client.post("/api/v1/challenges", headers=headers, json=payload)
    assert resp.status_code == 400


def test_update_challenge_status(client):
    headers = register_and_login(client, "officer3@gov.example", role="government")
    create_resp = client.post(
        "/api/v1/challenges",
        headers=headers,
        json={
            "challenge_code": "GC-2026-101",
            "title": "Update Test",
            "department": "Ministry of Power",
        },
    )
    challenge_id = create_resp.json()["id"]

    resp = client.patch(
        f"/api/v1/challenges/{challenge_id}", headers=headers, json={"status": "PUBLISHED"}
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "PUBLISHED"
