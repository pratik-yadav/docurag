from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.orm import Session
from src.utils.db import get_db
from src.user.models import UserModel
from src.middlewares.auth_middleware import get_optional_user
from src.suggestions import controllers

suggestion_routes = APIRouter(prefix='/api/suggestion')


@suggestion_routes.post('/analyze', status_code=status.HTTP_200_OK)
def analyze_resume(
    file: UploadFile = File(...),
    current_user: UserModel | None = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    return controllers.analyze_resume_controller(file, current_user, db)


@suggestion_routes.get('/rooms', status_code=status.HTTP_200_OK)
def get_all_rooms(current_user: UserModel = Depends(get_optional_user), db: Session = Depends(get_db)):
    return controllers.get_all_rooms(current_user, db)


@suggestion_routes.get('/rooms/{room_id}', status_code=status.HTTP_200_OK)
def get_room(room_id: int, current_user: UserModel = Depends(get_optional_user), db: Session = Depends(get_db)):
    return controllers.get_room(room_id, current_user, db)


@suggestion_routes.delete('/rooms/{room_id}', status_code=status.HTTP_200_OK)
def delete_room(room_id: int, current_user: UserModel = Depends(get_optional_user), db: Session = Depends(get_db)):
    return controllers.delete_room(room_id, current_user, db)