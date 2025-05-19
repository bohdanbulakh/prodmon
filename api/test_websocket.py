from fastapi.testclient import TestClient
from main import app, latest_metrics
import pytest

client = TestClient(app)


def test_websocket_basic_communication():
    latest_metrics.clear()
    latest_metrics["ws-host"] = {
        "cpu_usage_percent": 12.3,
        "memory_used_mb": 111,
        "memory_used_percent": 22.2,
        "processes": ["wsproc"]
    }

    with client.websocket_connect("/ws/metrics") as websocket:
        data1 = websocket.receive_json()
        assert "ws-host" in data1
        assert data1["ws-host"]["cpu_usage_percent"] == 12.3

        websocket.send_json({"seconds": 0.1})
        data2 = websocket.receive_json()
        assert "ws-host" in data2


def test_websocket_disconnect_gracefully():
    with client.websocket_connect("/ws/metrics") as websocket:
        websocket.receive_json()
        websocket.close()
