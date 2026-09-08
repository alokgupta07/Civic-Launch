def test_register_new_user(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Nodal Officer",
            "email": "officer@gov.example",
            "password": "password123",
            "role": "government",
            "organization": "Ministry of Power",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "officer@gov.example"
    assert "password" not in body


def test_register_duplicate_email_rejected(client):
    payload = {
        "name": "Founder",
        "email": "founder@example.com",
        "password": "password123",
        "role": "startup",
    }
    client.post("/api/v1/auth/register", json=payload)
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 400


def test_login_success_returns_token(client):
    client.post(
        "/api/v1/auth/register",
        json={"name": "Founder", "email": "founder2@example.com", "password": "password123", "role": "startup"},
    )
    resp = client.post(
        "/api/v1/auth/login", json={"email": "founder2@example.com", "password": "password123"}
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password_rejected(client):
    client.post(
        "/api/v1/auth/register",
        json={"name": "Founder", "email": "founder3@example.com", "password": "password123", "role": "startup"},
    )
    resp = client.post(
        "/api/v1/auth/login", json={"email": "founder3@example.com", "password": "wrong-password"}
    )
    assert resp.status_code == 401
