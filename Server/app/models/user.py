from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    """用户模型
    
    存储用户信息，包括用户名、邮箱、密码等
    """
    __tablename__ = "users"  # 数据库表名
    
    # 主键
    id = Column(Integer, primary_key=True, index=True)  # 用户ID，自增主键
    
    # 基本信息
    username = Column(String(100), nullable=False, unique=True)  # 用户名，不能为空，唯一
    email = Column(String(255), nullable=False, unique=True)  # 邮箱，不能为空，唯一
    password = Column(String(255), nullable=False)  # 密码哈希值，不能为空
    created_at = Column(DateTime, index=True)  # 创建时间，添加索引
    updated_at = Column(DateTime)  # 更新时间
    
    # 个人资料
    avatar = Column(String(255), default="https://neeko-copilot.bytedance.net/api/text2image?prompt=default%20user%20avatar&size=128x128")  # 头像URL
    nickname = Column(String(100), nullable=True)  # 昵称
    bio = Column(String(500), nullable=True)  # 个人简介
    
    # 外键关系
    role_id = Column(Integer, ForeignKey("roles.id"))  # 角色ID，关联roles表
    
    # 关联关系
    role = relationship("Role", back_populates="users")  # 与Role模型的双向关联
    articles = relationship("Article", back_populates="author")  # 与Article模型的双向关联