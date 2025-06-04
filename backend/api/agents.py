from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.ws_manager import ws_manager
from crud.agent import get_agents_by_username
from database import get_db
from crud import agent as crud_agent
from models.models import User
from utils.auth import get_current_user
from crud.user import get_user_by_username
from schemas.agent import AgentAddRemove, AgentSetTime, AgentSendSignal

router = APIRouter()


@router.post("/agents/remove")
def remove_agent(data: AgentAddRemove, db: Session = Depends(get_db), username: str = Depends(get_current_user)):
    user = get_user_by_username(db, username)
    crud_agent.remove_agent(db, data.hostname, user)
    return {"message": "Agent removed"}

@router.get("/agents/{agent_id}")
def get_agent_by_id(agent_id: int, db: Session = Depends(get_db), username: str = Depends(get_current_user)):
    user = get_user_by_username(db, username)
    return crud_agent.get_agent_by_id(user, agent_id)


@router.get("/agents")
def list_agents(db: Session = Depends(get_db), username: str = Depends(get_current_user)):
    user = db.query(User).filter_by(username=username).first()
    agents = [{"id": agent.id, "hostname": agent.hostname} for agent in user.agents]

    return agents


@router.post("/agents/setTime")
async def set_time(data: AgentSetTime, db: Session = Depends(get_db), username: str = Depends(get_current_user)):
    agent = get_agents_by_username(db, username, data)
    crud_agent.set_time(db, agent.id, data.dict())

    command = {
        "type": "setTime",
        "data": {"update_time": data.update_time},
    }
    await ws_manager.send_command(agent_id=agent.id, command=command)


@router.post("/agents/sendSignal")
async def send_process_signal(data: AgentSendSignal, db: Session = Depends(get_db),
                              username: str = Depends(get_current_user)):
    agent = get_agents_by_username(db, username, data)

    command = {
        "type": "sendSignal",
        "data": {
            "pid": data.pid,
            "signal": data.signal,
        },
    }
    await ws_manager.send_command(agent_id=agent.id, command=command)
