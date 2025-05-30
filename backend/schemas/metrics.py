from pydantic import BaseModel
from typing import List, Dict


class ProcessInfo(BaseModel):
    pid: int
    name: str
    memory_used_mb: int
    memory_used_percent: float


class MetricsCreate(BaseModel):
    hostname: str
    username: str
    cpu_usage_percent: float
    memory_used_mb: int
    memory_used_percent: float
    memory_max: int
    processes: List[ProcessInfo]
