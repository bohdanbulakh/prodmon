from fastapi import APIRouter, HTTPException, Response, Depends, Cookie, Request
from passlib.hash import bcrypt
from itsdangerous import URLSafeSerializer, BadSignature
from models.models import User
from schemas.user import UserCreate, UserLogin
from database import get_db
from sqlalchemy.orm import Session
from crud import user as crud_user
from utils.auth import get_current_user

router = APIRouter()
serializer = URLSafeSerializer("secret-key")


def get_current_user_from_token(token: str, db: Session):
    try:
        username = serializer.loads(token)
        return db.query(User).filter_by(username=username).first()
    except BadSignature:
        return None


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if crud_user.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username exists")
    hashed_password = bcrypt.hash(user.password)
    crud_user.create_user(db, user.username, hashed_password)
    return {"message": "Registered"}


@router.post("/login")
def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_username(db, user.username)
    if not db_user or not bcrypt.verify(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = serializer.dumps(user.username)
    response.set_cookie(key="auth_token", value=token, httponly=True)
    return {"message": "Login successful"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("auth_token")
    return {"message": "Logged out"}


@router.get("/me")
def me(username: str = Depends(get_current_user)):
    return { "username": username }
