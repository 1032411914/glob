from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import  Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.response import ResponseModel
from app.api.auth import verify_password

class PasswordVerifyRequest(BaseModel):
    password: str

router = APIRouter()  # 创建路由器对象

@router.get("/")
def get_users(
    page: int = 1,  # 页码，默认为1
    page_size: int = 10,  # 每页记录数，默认为10
    role_id: Optional[int] = None,  # 角色ID，可选
    db: Session = Depends(get_db)  # 数据库会话对象
):
    """获取用户列表（分页）
    
    Args:
        page: 页码
        page_size: 每页记录数
        role_id: 按角色筛选
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 用户列表和总记录数
    """
    # 构建查询
    query = db.query(User)
    # 按角色筛选
    if role_id:
        query = query.filter(User.role_id == role_id)
    
    # 计算总记录数
    total = query.count()
    
    # 计算偏移量
    skip = (page - 1) * page_size
    # 执行查询
    users = query.offset(skip).limit(page_size).all()
    
    # 转换为字典列表，避免序列化错误
    users_list = []
    for user in users:
        users_list.append({
            "id": user.id,
            "username": user.username,
            "password": user.password,
            "email": user.email,
            "role_id": user.role_id,
            "avatar": user.avatar,
            "nickname": user.nickname,
            "bio": user.bio,
        })
    
    # 返回包含总记录数和用户列表的数据
    return ResponseModel(data={
        "items": users_list,
        "total": total
    })

@router.post("/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """创建新用户
    
    Args:
        user: 用户创建对象，包含用户名、邮箱、密码等信息
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 创建的用户信息
    """
    # 检查用户名是否已存在
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        return ResponseModel(code=400, msg="用户名已存在")
    
    # 检查邮箱是否已存在
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        return ResponseModel(code=400, msg="邮箱已存在")
    
    # 直接使用 password 字段
    user_data = user.model_dump()
    # 这里应该使用密码哈希函数，暂时使用原始密码作为示例
    # 实际项目中应该使用 bcrypt 等库进行密码哈希
    
    # 自动生成默认个人资料
    user_data['avatar'] = f"https://neeko-copilot.bytedance.net/api/text2image?prompt={user.username}%20avatar&size=128x128"
    user_data['nickname'] = user.username
    user_data['bio'] = f"{user.username}的个人简介"
    
    # 创建用户对象
    db_user = User(**user_data)
    # 添加到数据库
    db.add(db_user)
    # 提交事务
    db.commit()
    # 刷新对象，获取最新数据
    db.refresh(db_user)
    
    # 转换为字典，避免序列化错误
    user_dict = {
        "id": db_user.id,
        "username": db_user.username,
        "password": db_user.password,
        "email": db_user.email,
        "role_id": db_user.role_id,
        "avatar": db_user.avatar,
        "nickname": db_user.nickname,
        "bio": db_user.bio,
    }
    
    return ResponseModel(data=user_dict)

@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    """获取用户详情
    
    Args:
        user_id: 用户ID
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 用户详细信息
    """
    # 查询用户
    user = db.query(User).filter(User.id == user_id).first()
    # 检查用户是否存在
    if not user:
        return ResponseModel(code=404, msg="用户不存在")
    
    # 转换为字典，避免序列化错误
    user_dict = {
        "id": user.id,
        "username": user.username,
        "password": user.password,
        "email": user.email,
        "role_id": user.role_id,
        "avatar": user.avatar,
        "nickname": user.nickname,
        "bio": user.bio,
    }
    
    return ResponseModel(data=user_dict)

@router.put("/{user_id}")
def update_user(
    user_id: int,  # 用户ID
    user: UserUpdate,  # 用户更新对象
    db: Session = Depends(get_db)  # 数据库会话对象
):
    """更新用户
    
    Args:
        user_id: 用户ID
        user: 用户更新对象，包含需要更新的字段
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 更新后的用户信息
    """
    # 查询用户
    db_user = db.query(User).filter(User.id == user_id).first()
    # 检查用户是否存在
    if not db_user:
        return ResponseModel(code=404, msg="用户不存在")
    
    # 检查是否为管理员用户
    if db_user.username == 'admin':
        return ResponseModel(code=403, msg="管理员用户不能修改")
    
    # 检查用户名是否已被其他用户使用
    if user.username and user.username != db_user.username:
        existing_user = db.query(User).filter(User.username == user.username).first()
        if existing_user:
            return ResponseModel(code=400, msg="用户名已存在")
    
    # 检查邮箱是否已被其他用户使用
    if user.email and user.email != db_user.email:
        existing_email = db.query(User).filter(User.email == user.email).first()
        if existing_email:
            return ResponseModel(code=400, msg="邮箱已存在")
    
    # 获取更新数据，排除未设置的字段
    update_data = user.model_dump(exclude_unset=True)
    
    # 处理密码字段（直接使用 password 字段）
    if "password" in update_data:
        # 这里应该使用密码哈希函数，暂时使用原始密码作为示例
        # 实际项目中应该使用 bcrypt 等库进行密码哈希
        pass
    
    # 更新字段
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    # 提交事务
    db.commit()
    # 刷新对象，获取最新数据
    db.refresh(db_user)
  
    
    # 转换为字典，避免序列化错误
    user_dict = {
        "id": db_user.id,
        "username": db_user.username,
        "password": db_user.password,
        "email": db_user.email,
        "role_id": db_user.role_id,
        "avatar": db_user.avatar,
        "nickname": db_user.nickname,
        "bio": db_user.bio,
    }
    
    return ResponseModel(data=user_dict)

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """删除用户
    
    Args:
        user_id: 用户ID
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 删除成功信息
    """
    # 查询用户
    user = db.query(User).filter(User.id == user_id).first()
    # 检查用户是否存在
    if not user:
        return ResponseModel(code=404, msg="用户不存在")
    
    # 检查是否为系统用户
    if user.username in ['admin', 'guest']:
        return ResponseModel(code=403, msg="系统用户不能删除")
    
    # 删除用户
    db.delete(user)
    # 提交事务
    db.commit()
    return ResponseModel(msg="删除成功")

@router.post("/{user_id}/verify-password")
def verify_user_password(user_id: int, request: PasswordVerifyRequest, db: Session = Depends(get_db)):
    """验证用户密码
    
    Args:
        user_id: 用户ID
        request: 包含密码的请求体
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 验证结果
    """
    # 根据用户ID获取用户
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return ResponseModel(code=404, msg="用户不存在")
    
    # 验证密码
    if not verify_password(request.password, user.password):
        return ResponseModel(code=401, msg="密码错误")
    
    return ResponseModel(msg="密码验证成功")


