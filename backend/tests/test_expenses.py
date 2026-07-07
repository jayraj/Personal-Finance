import uuid

import pytest


@pytest.mark.asyncio
async def test_create_expense(client, auth_headers, test_category):
    payload = {
        "category_id": str(test_category.id),
        "amount": 42.50,
        "date": "2026-07-01",
        "notes": "Lunch",
    }
    resp = await client.post("/api/expenses", json=payload, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["amount"] == 42.50
    assert data["category_name"] == "Food"
    assert data["notes"] == "Lunch"


@pytest.mark.asyncio
async def test_create_expense_missing_amount(client, auth_headers, test_category):
    payload = {"category_id": str(test_category.id)}
    resp = await client.post("/api/expenses", json=payload, headers=auth_headers)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_expense_negative_amount(client, auth_headers, test_category):
    payload = {"category_id": str(test_category.id), "amount": -10}
    resp = await client.post("/api/expenses", json=payload, headers=auth_headers)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_expense_invalid_category(client, auth_headers):
    payload = {
        "category_id": str(uuid.uuid4()),
        "amount": 10,
    }
    resp = await client.post("/api/expenses", json=payload, headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_expenses_empty(client, auth_headers):
    resp = await client.get("/api/expenses", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["next_cursor"] is None


@pytest.mark.asyncio
async def test_get_expenses_pagination(client, auth_headers, test_category):
    for i in range(5):
        payload = {
            "category_id": str(test_category.id),
            "amount": 10.0 + i,
            "date": f"2026-07-{i+1:02d}",
        }
        resp = await client.post("/api/expenses", json=payload, headers=auth_headers)
        assert resp.status_code == 201

    resp = await client.get("/api/expenses", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) == 5


@pytest.mark.asyncio
async def test_get_expenses_filter_category(client, auth_headers, test_category, db_session):
    other_cat_id = uuid.uuid4()
    from app.models.category import Category
    other = Category(id=other_cat_id, user_id=test_category.user_id, name="Transport", is_predefined=True)
    db_session.add(other)
    await db_session.flush()

    for cat_id in [test_category.id, other_cat_id, test_category.id]:
        payload = {"category_id": str(cat_id), "amount": 15.0}
        await client.post("/api/expenses", json=payload, headers=auth_headers)

    resp = await client.get(
        f"/api/expenses?category_id={test_category.id}",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_get_expenses_sort_by_amount(client, auth_headers, test_category):
    amounts = [50, 10, 30]
    for amt in amounts:
        payload = {"category_id": str(test_category.id), "amount": amt}
        await client.post("/api/expenses", json=payload, headers=auth_headers)

    resp = await client.get(
        "/api/expenses?sort_by=amount&sort_order=asc",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert [item["amount"] for item in data["items"]] == [10, 30, 50]


@pytest.mark.asyncio
async def test_get_expense_by_id(client, auth_headers, test_category):
    create_resp = await client.post(
        "/api/expenses",
        json={"category_id": str(test_category.id), "amount": 25.0},
        headers=auth_headers,
    )
    expense_id = create_resp.json()["id"]

    resp = await client.get(f"/api/expenses/{expense_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["amount"] == 25.0


@pytest.mark.asyncio
async def test_get_expense_not_found(client, auth_headers):
    resp = await client.get(f"/api/expenses/{uuid.uuid4()}", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_expense(client, auth_headers, test_category):
    create_resp = await client.post(
        "/api/expenses",
        json={"category_id": str(test_category.id), "amount": 25.0, "notes": "old"},
        headers=auth_headers,
    )
    expense_id = create_resp.json()["id"]

    resp = await client.put(
        f"/api/expenses/{expense_id}",
        json={"amount": 30.0, "notes": "updated"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["amount"] == 30.0
    assert data["notes"] == "updated"


@pytest.mark.asyncio
async def test_delete_expense(client, auth_headers, test_category):
    create_resp = await client.post(
        "/api/expenses",
        json={"category_id": str(test_category.id), "amount": 25.0},
        headers=auth_headers,
    )
    expense_id = create_resp.json()["id"]

    resp = await client.delete(f"/api/expenses/{expense_id}", headers=auth_headers)
    assert resp.status_code == 204

    resp = await client.get(f"/api/expenses/{expense_id}", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_unauthorized_access(client):
    resp = await client.get("/api/expenses")
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_other_user_isolation(client, auth_headers, test_category, db_session):
    create_resp = await client.post(
        "/api/expenses",
        json={"category_id": str(test_category.id), "amount": 25.0},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201

    from app.models.user import User
    other_user = User(
        id=uuid.uuid4(),
        email="other@example.com",
        password_hash="$2b$12$hash",
        display_name="Other",
    )
    db_session.add(other_user)
    await db_session.flush()

    from app.core.security import create_access_token
    other_token = create_access_token(str(other_user.id))
    other_headers = {"Authorization": f"Bearer {other_token}"}

    resp = await client.get("/api/expenses", headers=other_headers)
    assert resp.status_code == 200
    assert resp.json()["items"] == []
