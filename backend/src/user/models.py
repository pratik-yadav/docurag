from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from src.utils.db import Base


class UserModel(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hash_password = Column(String, nullable=False)

    chatrooms = relationship("ChatRoomModel", back_populates="user", cascade="all, delete-orphan")
    suggestion_rooms = relationship("SuggestionRoomModel", back_populates="user", cascade="all, delete-orphan")