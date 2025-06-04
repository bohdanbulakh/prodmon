import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from starlette.websockets import WebSocketDisconnect
from crud.user import get_user_by_username
from main import app
from database import Base, get_db

TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


def test_websocket_metrics_requires_auth(client):
    with client.websocket_connect("/metrics/1") as websocket:
        try:
            data = websocket.receive_text()
            assert False, f"Unexpected response: {data}"
        except Exception as e:
            assert "1008" in str(e) or "WebSocketDisconnect" in str(type(e))


def test_websocket_stream_metrics_from_agent(client):
    client.post("/register", json={"username": "agentviewer", "password": "1234"})

    login_resp = client.post("/login", json={"username": "agentviewer", "password": "1234"})
    cookies = login_resp.cookies

    with client.websocket_connect("/metrics") as websocket:
        websocket.send_json({
            "hostname": "testagent",
            "username": "agentviewer",
            "cpu_usage_percent": 11.5,
            "memory_used_mb": 1488,
            "memory_used_percent": 13.3,
            "memory_max": 4325,
            "processes": [
                {"pid": 123, "name": "test1", "memory_used_mb": 2453, "memory_used_percent": 32},
                {"pid": 145, "name": "test2", "memory_used_mb": 12, "memory_used_percent": 12}
            ]
        })

    with TestingSessionLocal() as db:
        user = get_user_by_username(db, "agentviewer")
        agent = next((a for a in user.agents if a.hostname == "testagent"), None)
        assert agent is not None
        agent_id = agent.id

    with client.websocket_connect(f"/metrics/{agent_id}", cookies=cookies) as websocket:
        data = websocket.receive_json()
        assert isinstance(data, dict)
        assert "cpu_usage_percent" in data or "memory_used_mb" in data


def test_websocket_receive_metrics_closes(client):
    with pytest.raises(Exception) as exc_info:
        with client.websocket_connect("/metrics") as websocket:
            websocket.send_json({"invalid": "data"})
            websocket.receive_text()
    assert "1008" in str(exc_info.value) or "WebSocketDisconnect" in str(exc_info.type)
