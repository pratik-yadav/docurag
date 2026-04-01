from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from src.user.models import UserModel
from src.chats.models import ChatRoomModel, ChatModel
from src.ai.embeddings import embed_and_store, delete_collection, get_collection_name
from src.ai.chat import ask_document
import uuid

# In-memory store for guest sessions: { session_id: { "collection_name": str, "history": [...] } }
guest_sessions: dict = {}

ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
]


def upload_document(file: UploadFile, current_user: UserModel | None, db: Session):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOCX, and TXT files are allowed"
        )

    file_bytes = file.file.read()

    if current_user:
        room = ChatRoomModel(title=file.filename, user_id=current_user.id)
        db.add(room)
        db.commit()
        db.refresh(room)

        collection_name = get_collection_name(room.id)
        chunk_count = embed_and_store(file_bytes, file.filename, file.content_type, collection_name)

        return {
            "saved": True,
            "room_id": room.id,
            "chunks_embedded": chunk_count,
            "message": "Document uploaded and embedded. You can now ask questions."
        }

    # Guest
    session_id = str(uuid.uuid4())
    collection_name = get_collection_name(session_id)
    chunk_count = embed_and_store(file_bytes, file.filename, file.content_type, collection_name)

    guest_sessions[session_id] = {
        "collection_name": collection_name,
        "history": []
    }

    return {
        "saved": False,
        "session_id": session_id,
        "chunks_embedded": chunk_count,
        "message": "Document uploaded and embedded. Use session_id to ask questions."
    }


def ask_question(room_id: str, question: str, current_user: UserModel | None, db: Session):
    if not question or not question.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question cannot be empty")

    if current_user:
        room = db.query(ChatRoomModel).filter(
            ChatRoomModel.id == int(room_id),
            ChatRoomModel.user_id == current_user.id
        ).first()

        if not room:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat room not found")

        history = db.query(ChatModel).filter(ChatModel.chatroom_id == room.id).all()
        collection_name = get_collection_name(room.id)

        answer = ask_document(question, collection_name, history)

        new_chat = ChatModel(chatroom_id=room.id, question=question, answer=answer)
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)

        return {"question": question, "answer": answer, "chat_id": new_chat.id}

    # Guest
    session = guest_sessions.get(room_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or expired. Please upload the document again."
        )

    answer = ask_document(question, session["collection_name"], session["history"])
    session["history"].append({"question": question, "answer": answer})

    return {"question": question, "answer": answer, "session_id": room_id}


def get_all_rooms(current_user: UserModel, db: Session):
    rooms = db.query(ChatRoomModel).filter(ChatRoomModel.user_id == current_user.id).all()
    if not rooms:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No chat rooms found")
    return rooms


def get_room(room_id: int, current_user: UserModel, db: Session):
    room = db.query(ChatRoomModel).filter(
        ChatRoomModel.id == room_id,
        ChatRoomModel.user_id == current_user.id
    ).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat room not found")

    chats = db.query(ChatModel).filter(ChatModel.chatroom_id == room_id).all()
    return {"room": room, "chats": chats}


def delete_room(room_id: int, current_user: UserModel, db: Session):
    room = db.query(ChatRoomModel).filter(
        ChatRoomModel.id == room_id,
        ChatRoomModel.user_id == current_user.id
    ).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat room not found")

    # Delete vectors from PGVector before removing DB record
    delete_collection(get_collection_name(room_id))

    db.delete(room)
    db.commit()
    return {"message": "Chat room deleted successfully"}


def cleanup_guest_session(session_id: str):
    if not session_id:
        return {"message": "No session_id provided"}

    session = guest_sessions.pop(session_id, None)

    if session:
        from src.ai.embeddings import delete_collection, get_collection_name
        delete_collection(get_collection_name(session_id))
        return {"message": "Guest session cleaned up"}

    return {"message": "Session not found or already cleaned up"}