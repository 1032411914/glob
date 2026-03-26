from typing import Optional

from pydantic import BaseModel, EmailStr


class ProfileUpdate(BaseModel):
    """个人资料更新模型"""
    avatar: Optional[str] = None
    nickname: Optional[str] = None
    bio: Optional[str] = None


class PasswordUpdate(BaseModel):
    """密码更新模型"""
    old_password: str
    new_password: str


class LoginRequest(BaseModel):
    """登录请求模型"""
    username: str
    password: str


class LoginResponse(BaseModel):
    """登录响应模型"""
    token: str
    user: dict