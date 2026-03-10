from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from src.user.models import UserModel
from src.suggestions.models import SuggestionRoomModel, SuggestionModel, QuestionModel
from src.ai.resume import analyze_resume


ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
]


def analyze_resume_controller(file: UploadFile, current_user: UserModel | None, db: Session):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOCX, and TXT files are allowed"
        )

    file_bytes = file.file.read()

    result = analyze_resume(file_bytes, file.filename, file.content_type)
    suggestions = result["suggestions"]
    questions = result["questions"]

    if current_user:
        room = SuggestionRoomModel(title=file.filename, user_id=current_user.id)
        db.add(room)
        db.flush()

        for content in suggestions:
            db.add(SuggestionModel(suggestion_room_id=room.id, content=content))

        for q in questions:
            db.add(QuestionModel(
                suggestion_room_id=room.id,
                question=q["question"],
                answer=q["answer"]
            ))

        db.commit()
        db.refresh(room)

        return {
            "saved": True,
            "room_id": room.id,
            "suggestions": suggestions,
            "questions": questions
        }
    return {
        "saved": False,
        "suggestions": suggestions,
        "questions": questions
    }


def get_all_rooms(current_user: UserModel | None, db: Session):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required to view saved rooms")

    rooms = db.query(SuggestionRoomModel).filter(SuggestionRoomModel.user_id == current_user.id).all()
    if not rooms:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No suggestion rooms found")
    return rooms


def get_room(room_id: int, current_user: UserModel | None, db: Session):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required to view saved rooms")

    room = db.query(SuggestionRoomModel).filter(
        SuggestionRoomModel.id == room_id,
        SuggestionRoomModel.user_id == current_user.id
    ).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suggestion room not found")

    suggestions = db.query(SuggestionModel).filter(SuggestionModel.suggestion_room_id == room_id).all()
    questions = db.query(QuestionModel).filter(QuestionModel.suggestion_room_id == room_id).all()

    return {"room": room, "suggestions": suggestions, "questions": questions}


def delete_room(room_id: int, current_user: UserModel | None, db: Session):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required to delete a room")

    room = db.query(SuggestionRoomModel).filter(
        SuggestionRoomModel.id == room_id,
        SuggestionRoomModel.user_id == current_user.id
    ).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suggestion room not found")

    db.delete(room)
    db.commit()
    return {"message": "Suggestion room deleted successfully"}