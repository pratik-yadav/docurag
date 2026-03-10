from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from src.utils.db import Base


class ChatRoomModel(Base):
    __tablename__ = "chat_room"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)

    user = relationship("UserModel", back_populates="chatrooms")
    chats = relationship("ChatModel", back_populates="chat_room", cascade="all, delete-orphan")


class ChatModel(Base):
    __tablename__ = "chat"

    id = Column(Integer, primary_key=True, index=True)
    chatroom_id = Column(Integer, ForeignKey("chat_room.id"), nullable=False)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=True)

    chat_room = relationship("ChatRoomModel", back_populates="chats")