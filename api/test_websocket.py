from fastapi.testclient import TestClient
from main import app, latest_metrics
from datetime import datetime
import pytest

client = TestClient(app)


def test_websocket_basic_communication():
    latest_metrics.clear()
    latest_metrics["ws-host"] = {
        "cpu_usage_percent": 12.3,
        "memory_used_mb": 111,
        "memory_used_percent": 22.2,
        "memory_max": 20000,
        "processes": ["test"],
        "time": datetime.utcnow().isoformat() + "Z"
    }

    with client.websocket_connect("/metrics/ws-host") as websocket:
        data1 = websocket.receive_json()
        assert data1["cpu_usage_percent"] == 12.3
        assert data1["memory_used_mb"] == 111

        websocket.send_json({"seconds": 0.1})
        data2 = websocket.receive_json()
        assert data2


def test_websocket_disconnect_gracefully():
    with client.websocket_connect("/metrics/ws-host") as websocket:
        websocket.receive_json()
        websocket.close()
