import json

from fastapi import APIRouter, Depends, WebSocketDisconnect, WebSocket, Request
from pydantic import ValidationError

from api.ws_manager import ws_manager
from crud.user import get_user_by_username
from schemas.metrics import MetricsCreate
from database import get_db
from sqlalchemy.orm import Session
from crud.agent import save_metrics, add_agent

router = APIRouter()


@router.websocket("/metrics")
async def receive_metrics(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    agent = None

    try:
        data = await websocket.receive_json()
        metrics = MetricsCreate(**data)
        user = get_user_by_username(db, metrics.username)
        if not user:
            return await websocket.close()

        user_agents = [agent.hostname for agent in user.agents]

        if metrics.hostname in user_agents:
            agent = user.agents[user_agents.index(metrics.hostname)]
        else:
            agent = add_agent(db, metrics.hostname, metrics.username)

        ws_manager.connect(agent.id, websocket)

        await websocket.send_json({
            "type": "setTime",
            "data": {"update_time": agent.update_time}
        })
    except (json.JSONDecodeError, ValidationError) as e:
        print(e)

    try:
        while True:
            try:
                data = await websocket.receive_json()
                metrics = MetricsCreate(**data)
            except (json.JSONDecodeError, ValidationError) as e:
                print(e)
                continue

            save_metrics(db, agent.id, metrics.dict())

    except WebSocketDisconnect:
        ws_manager.disconnect(agent.id)
