from pydantic import BaseModel
from pydantic import ConfigDict

class UserSchema(BaseModel):
    name: str
    password: str
    email: str

class UserResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    name: str
    email: str
    id: int

class LoginSchema(BaseModel):
    password: str
    email: str

class LoginResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    token: str
    user: UserResponseSchema