from fastapi import FastAPI
from api import auth, agents, metrics, websocket
from database import engine, Base

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(agents.router)
app.include_router(metrics.router)
app.include_router(websocket.router)
