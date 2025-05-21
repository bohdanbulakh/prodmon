from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List
from datetime import datetime, timezone
import asyncio

app = FastAPI()

latest_metrics = {}


class Metrics(BaseModel):
    hostname: str
    cpu_usage_percent: float
    memory_used_mb: int
    memory_used_percent: float
    memory_max: int
    processes: List[str]


def check_time(hostname):
    if hostname in latest_metrics:
        metric = latest_metrics[hostname]
        time_str = metric.get("time")
        if time_str:
            try:
                metric_time = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
                now = datetime.now(timezone.utc)
                if (now - metric_time).total_seconds() > 10:
                    del latest_metrics[hostname]
                else:
                    return True
            except ValueError:
                del latest_metrics[hostname]
    return False


@app.post("/metrics")
async def receive_metrics(data: Metrics):
    proc_data = data.dict()
    proc_data.pop("hostname", None)

    proc_data["time"] = datetime.utcnow().isoformat() + "Z"

    latest_metrics[data.hostname] = proc_data
    return {"status": "received"}


@app.get("/hosts")
async def get_hosts():
    return list(latest_metrics.keys())


@app.websocket("/metrics/{hostname}")
async def websocket_metrics(websocket: WebSocket, hostname: str):
    await websocket.accept()

    try:
        while True:
            if check_time(hostname):
                await websocket.send_json(latest_metrics[hostname])
            else:
                await websocket.close()
            await asyncio.sleep(3)

    except WebSocketDisconnect:
        print("Client disconnected")
