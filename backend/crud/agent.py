from fastapi import HTTPException

from crud.user import get_user_by_username
from models.models import Agent, Metrics, User
from sqlalchemy.orm import Session


def get_agents_by_username(db, username, data):
    user = db.query(User).filter_by(username=username).first()
    if data.hostname not in [agent.hostname for agent in user.agents]:
        raise HTTPException(status_code=403, detail="Forbidden access")

    user_agents = [agent.hostname for agent in user.agents]
    agents = user.agents[user_agents.index(data.hostname)]
    return agents

def get_agent_by_id(user, agent_id: int):
    if agent_id not in [agent.id for agent in user.agents]:
        raise HTTPException(status_code=403, detail="Forbidden access")

    agent = list(filter(lambda x: x.id == agent_id, user.agents))[0]
    return {
        "id": agent.id,
        "hostname": agent.hostname,
        "update_time": agent.update_time,
    }


def add_agent(db: Session, hostname: str, username: str):
    user = get_user_by_username(db, username)
    agent = Agent(hostname=hostname, user=user)
    db.add(agent)
    db.commit()
    return agent


def remove_agent(db: Session, hostname: str, user: User):
    agent = db.query(Agent).filter(Agent.hostname == hostname, Agent.user_id == user.id).first()
    if agent:
        db.delete(agent)
        db.commit()


def save_metrics(db: Session, agent_id: int, data: dict):
    agent = db.query(Agent).filter_by(id=agent_id).first()
    if not agent:
        return
    existing = db.query(Metrics).filter_by(agent_id=agent.id).first()
    if not existing:
        existing = Metrics(agent=agent)
    for key, value in data.items():
        setattr(existing, key, value)
    db.add(existing)
    db.commit()


def set_time(db: Session, agent_id: int, data: dict):
    agent = db.query(Agent).filter_by(id=agent_id).first()
    if not agent:
        return
    for key, value in data.items():
        setattr(agent, key, value)
    db.add(agent)
    db.commit()
