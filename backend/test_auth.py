import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_register_login_logout():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/register", json={"username": "testuser", "password": "testpass"})
        assert response.status_code == 200 or response.status_code == 400

        response = await ac.post("/login", json={"username": "testuser", "password": "testpass"})
        assert response.status_code == 200
        assert "auth_token" in response.cookies

        response = await ac.post("/logout", cookies=response.cookies)
        assert response.status_code == 200
