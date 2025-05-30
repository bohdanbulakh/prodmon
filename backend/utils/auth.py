from fastapi import Cookie, HTTPException, Depends
from itsdangerous import URLSafeSerializer

serializer = URLSafeSerializer("secret-key")

def get_current_user(auth_token: str = Cookie(None)) -> str:
    if not auth_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return serializer.loads(auth_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
