from pydantic import BaseModel


class AgentAddRemove(BaseModel):
    hostname: str


class AgentSetTime(BaseModel):
    hostname: str
    update_time: int


class AgentSendSignal(BaseModel):
    hostname: str
    pid: int
    signal: str
