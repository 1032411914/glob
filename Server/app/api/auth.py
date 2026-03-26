from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.config import settings
from app.core.security import verify_password, create_access_token, decode_access_token
from app.models.user import User
from app.schemas.user import UserResponse
from app.schemas.auth import ProfileUpdate, PasswordUpdate, LoginRequest, LoginResponse
from app.schemas.response import ResponseModel

router = APIRouter()

# OAuth2密码承载令牌
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """获取当前用户"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """用户登录"""
    # 查找用户
    user = db.query(User).filter(User.username == login_data.username).first()

    if not user:
        return ResponseModel(code=401, msg="用户名或密码错误")
    
    # 验证密码
    if not verify_password(login_data.password, user.password):
        return ResponseModel(code=401, msg="用户名或密码错误")
    
    # 创建访问令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    # 序列化用户信息
    user_response = UserResponse.model_validate(user)
    
    return ResponseModel(data={"token": access_token, "user": user_response})

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    user_response = UserResponse.model_validate(current_user)
    return ResponseModel(data=user_response)

@router.put("/profile")
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新当前用户个人资料"""
    update_data = profile_data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    
    user_response = UserResponse.model_validate(current_user)
    return ResponseModel(data=user_response, msg="个人资料更新成功")

@router.put("/password")
def update_password(
    password_data: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """修改当前用户密码"""
    if not verify_password(password_data.old_password, current_user.password):
        return ResponseModel(code=400, msg="当前密码错误")
    
    current_user.password = password_data.new_password
    db.commit()
    
    return ResponseModel(msg="密码修改成功")