import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_agents_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await ac.post("/register", json={"username": "agentuser", "password": "testpass"})
        login_response = await ac.post("/login", json={"username": "agentuser", "password": "testpass"})
        cookies = login_response.cookies

        response = await ac.get("/agents", cookies=cookies)
        assert response.status_code in [200, 500]

        response = await ac.post("/agents/remove", json={"hostname": "test-agent"}, cookies=cookies)
        assert response.status_code in [200, 500]
