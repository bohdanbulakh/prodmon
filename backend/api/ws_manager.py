from typing import Dict
from fastapi import WebSocket


class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    def connect(self, agent_id: int, websocket: WebSocket):
        self.active_connections[agent_id] = websocket
        print(f"[+] Connected: agent_id={agent_id}")

    def disconnect(self, agent_id: int):
        if agent_id in self.active_connections:
            del self.active_connections[agent_id]
            print(f"[-] Disconnected: agent_id={agent_id}")

    def is_connected(self, agent_id: int) -> bool:
        return agent_id in self.active_connections

    async def send_command(self, agent_id: int, command: dict):
        websocket = self.active_connections.get(agent_id)
        if websocket:
            await websocket.send_json(command)


ws_manager = WebSocketManager()
