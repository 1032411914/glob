from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Role(Base):
    """角色模型
    
    存储用户角色信息，包括角色名称、描述和权限
    """
    __tablename__ = "roles"  # 数据库表名
    
    # 主键
    id = Column(Integer, primary_key=True, index=True)  # 角色ID，自增主键
    
    # 基本信息
    name = Column(String(100), nullable=False, unique=True)  # 角色名称，不能为空，唯一
    description = Column(Text)  # 角色描述
    
    # 关联关系
    users = relationship("User", back_populates="role")  # 与User模型的双向关联