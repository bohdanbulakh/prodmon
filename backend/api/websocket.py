from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from api.auth import get_current_user_from_token
from database import get_db
from sqlalchemy.orm import Session
from models.models import Agent
import asyncio

router = APIRouter()


@router.websocket("/metrics/{agent_id}")
async def websocket_metrics(websocket: WebSocket, agent_id: int, db: Session = Depends(get_db)):
    await websocket.accept()

    token = websocket.cookies.get("auth_token")
    if not token:
        return await websocket.close(code=1008, reason="Auth token not found")

    user = get_current_user_from_token(token, db)
    if not user:
        return await websocket.close(code=1008, reason="Invalid token")

    if agent_id not in [agent.id for agent in user.agents]:
        return await websocket.close(code=1008, reason="Forbidden access")

    try:
        while True:
            agent = db.query(Agent).filter_by(id=agent_id).first()
            db.refresh(agent)
            if not agent or not agent.metrics:
                await websocket.close()
                break
            await websocket.send_json({
                "hostname": agent.hostname,
                "cpu_usage_percent": agent.metrics.cpu_usage_percent,
                "memory_used_mb": agent.metrics.memory_used_mb,
                "memory_used_percent": agent.metrics.memory_used_percent,
                "memory_max": agent.metrics.memory_max,
                "processes": agent.metrics.processes,
            })
            await asyncio.sleep(agent.update_time)
    except WebSocketDisconnect:
        print("WebSocket disconnected")
