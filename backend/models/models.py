from sqlalchemy import Column, Integer, String, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import JSON
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    password = Column(String)
    agents = relationship("Agent", back_populates="user")


class Agent(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True)
    hostname = Column(String)
    update_time = Column(Integer, default=5)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="agents")
    metrics = relationship("Metrics", back_populates="agent", uselist=False)

    __table_args__ = (
        UniqueConstraint("user_id", "hostname", name="uix_user_hostname"),
    )


class Metrics(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True)
    hostname = Column(String)
    cpu_usage_percent = Column(Float)
    memory_used_mb = Column(Integer)
    memory_used_percent = Column(Float)
    memory_max = Column(Integer)

    # processes: зберігає список об’єктів (JSON)
    processes = Column(JSON)

    agent_id = Column(Integer, ForeignKey("agents.id"))
    agent = relationship("Agent", back_populates="metrics")
