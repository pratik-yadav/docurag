from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from src.utils.db import get_db
from src.user.dtos import UserSchema, UserResponseSchema, LoginSchema, LoginResponseSchema
from src.user import controllers

user_routes = APIRouter(prefix='/api/user')

@user_routes.post('/register', response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED)
def register(body:UserSchema, db:Session=Depends(get_db)):
    pass
    # return controllers.register(body, db)

@user_routes.post('/login', response_model=LoginResponseSchema, status_code=status.HTTP_200_OK)
def login(body:LoginSchema, db:Session=Depends(get_db)):
    return controllers.login_user(body, db)
