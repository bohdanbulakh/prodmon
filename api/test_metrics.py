import pytest
from fastapi.testclient import TestClient
from main import app, latest_metrics

client = TestClient(app)

valid_cases = [
    {
        "name": "basic valid",
        "data": {
            "hostname": "host1",
            "cpu_usage_percent": 45.0,
            "memory_used_mb": 1024,
            "memory_used_percent": 50.0,
            "processes": ["python", "nginx"]
        },
        "expected_status": 200,
        "expected_response": {"status": "received"}
    },
    {
        "name": "empty process list",
        "data": {
            "hostname": "host2",
            "cpu_usage_percent": 0.0,
            "memory_used_mb": 0,
            "memory_used_percent": 0.0,
            "processes": []
        },
        "expected_status": 200,
        "expected_response": {"status": "received"}
    }
]

invalid_cases = [
    {
        "name": "missing field",
        "data": {
            "hostname": "host3",
            "cpu_usage_percent": 30.0,
            "memory_used_mb": 512,
            # "memory_used_percent" is missing
            "processes": ["node"]
        },
        "expected_status": 422
    },
    {
        "name": "wrong type in cpu_usage_percent",
        "data": {
            "hostname": "host4",
            "cpu_usage_percent": "high",  # invalid type
            "memory_used_mb": 512,
            "memory_used_percent": 30.0,
            "processes": ["java"]
        },
        "expected_status": 422
    },
    {
        "name": "null instead of list",
        "data": {
            "hostname": "host5",
            "cpu_usage_percent": 20.0,
            "memory_used_mb": 256,
            "memory_used_percent": 15.0,
            "processes": None
        },
        "expected_status": 422
    }
]


@pytest.mark.parametrize("case", valid_cases)
def test_post_valid_metrics(case):
    response = client.post("/metrics", json=case["data"])
    assert response.status_code == case["expected_status"], case["name"]
    assert response.json() == case["expected_response"], case["name"]
    hostname = case["data"]["hostname"]
    assert hostname in latest_metrics, case["name"]
    assert "hostname" not in latest_metrics[hostname], case["name"]


@pytest.mark.parametrize("case", invalid_cases)
def test_post_invalid_metrics(case):
    response = client.post("/metrics", json=case["data"])
    assert response.status_code == case["expected_status"], case["name"]
