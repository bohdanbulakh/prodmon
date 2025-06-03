from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth, agents, metrics, websocket
from database import engine, Base

app = FastAPI()

origins = [
    "http://localhost",
    "https://prodmon.me",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(agents.router)
app.include_router(metrics.router)
app.include_router(websocket.router)
