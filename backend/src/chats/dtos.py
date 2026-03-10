from pydantic import BaseModel
from typing import List

class ChatRoomSchema(BaseModel):
    id: int
    title: str

class ChatRoomsSchema(BaseModel):
    content: List[ChatRoomSchema]

class ChatSchema(BaseModel):
    question: str
    answer: str

class ChatsSchema(BaseModel):
    chat: List[ChatSchema]