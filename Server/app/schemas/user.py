from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    role_id: int
    avatar: Optional[str] = None
    nickname: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role_id: int


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    role_id: Optional[int] = None
    avatar: Optional[str] = None
    nickname: Optional[str] = None
    bio: Optional[str] = None


class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True