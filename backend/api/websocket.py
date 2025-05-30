from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from database import get_db
from sqlalchemy.orm import Session
from models.models import Agent
import asyncio

router = APIRouter()

@router.websocket("/metrics/{hostname}")
async def websocket_metrics(websocket: WebSocket, hostname: str, db: Session = Depends(get_db)):
    await websocket.accept()
    try:
        while True:
            agent = db.query(Agent).filter_by(hostname=hostname).first()
            db.refresh(agent.metrics)
            if not agent or not agent.metrics:
                await websocket.close()
                break
            await websocket.send_json({
                "hostname": hostname,
                "cpu_usage_percent": agent.metrics.cpu_usage_percent,
                "memory_used_mb": agent.metrics.memory_used_mb,
                "memory_used_percent": agent.metrics.memory_used_percent,
                "memory_max": agent.metrics.memory_max,
                "processes": agent.metrics.processes,
            })
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        print("WebSocket disconnected")
