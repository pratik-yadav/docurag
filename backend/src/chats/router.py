from fastapi import APIRouter, Depends, UploadFile, File, status, Request
from sqlalchemy.orm import Session
from src.utils.db import get_db
from src.user.models import UserModel
from src.middlewares.auth_middleware import get_optional_user, get_current_user
from src.chats import controllers

chat_routes = APIRouter(prefix='/api/chat')


@chat_routes.post('/upload', status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    current_user: UserModel | None = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    return controllers.upload_document(file, current_user, db)


@chat_routes.post('/ask/{room_id}', status_code=status.HTTP_200_OK)
def ask_question(
    room_id: str,
    question: str,
    current_user: UserModel | None = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    return controllers.ask_question(room_id, question, current_user, db)


@chat_routes.post('/guest/cleanup', status_code=status.HTTP_200_OK)
async def cleanup_guest_session(request: Request):
    body = await request.json()
    session_id = body.get('session_id')
    return controllers.cleanup_guest_session(session_id)


@chat_routes.get('/rooms', status_code=status.HTTP_200_OK)
def get_all_rooms(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return controllers.get_all_rooms(current_user, db)


@chat_routes.get('/rooms/{room_id}', status_code=status.HTTP_200_OK)
def get_room(
    room_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return controllers.get_room(room_id, current_user, db)


@chat_routes.delete('/rooms/{room_id}', status_code=status.HTTP_200_OK)
def delete_room(
    room_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return controllers.delete_room(room_id, current_user, db)