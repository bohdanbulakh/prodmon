from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List
import asyncio

app = FastAPI()

latest_metrics = {}


class Metrics(BaseModel):
    hostname: str
    cpu_usage_percent: float
    memory_used_mb: int
    memory_used_percent: float
    processes: List[str]


@app.post("/metrics")
async def receive_metrics(data: Metrics):
    proc_data = data.dict()
    proc_data.pop("hostname", None)
    latest_metrics[data.hostname] = proc_data
    return {"status": "received"}


@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            await websocket.send_json(latest_metrics)
            await asyncio.sleep(3)

    except WebSocketDisconnect:
        print("Client disconnected")
