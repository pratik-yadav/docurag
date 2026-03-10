from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from src.utils.db import Base


class SuggestionRoomModel(Base):
    __tablename__ = "suggestion_room"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)

    user = relationship("UserModel", back_populates="suggestion_rooms")
    suggestions = relationship("SuggestionModel", back_populates="suggestion_room", cascade="all, delete-orphan")
    questions = relationship("QuestionModel", back_populates="suggestion_room", cascade="all, delete-orphan")


class SuggestionModel(Base):
    __tablename__ = "suggestion"

    id = Column(Integer, primary_key=True, index=True)
    suggestion_room_id = Column(Integer, ForeignKey("suggestion_room.id"), nullable=False)
    content = Column(String, nullable=False)

    suggestion_room = relationship("SuggestionRoomModel", back_populates="suggestions")


class QuestionModel(Base):
    __tablename__ = "question"

    id = Column(Integer, primary_key=True, index=True)
    suggestion_room_id = Column(Integer, ForeignKey("suggestion_room.id"), nullable=False)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=True)

    suggestion_room = relationship("SuggestionRoomModel", back_populates="questions")