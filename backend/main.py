from fastapi import FastAPI
from src.utils.db import Base, engine
from src.user.router import user_routes
from src.chats.router import chat_routes
from src.suggestions.router import suggestion_routes
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://docurag-l52c.onrender.com"
    ],  # React URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_routes)
app.include_router(chat_routes)
app.include_router(suggestion_routes)