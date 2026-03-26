from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Article(Base):
    """文章模型
    
    存储博客文章的基本信息，包括标题、内容、摘要等
    """
    __tablename__ = "articles"  # 数据库表名
    
    # 主键
    id = Column(Integer, primary_key=True, index=True)  # 文章ID，自增主键
    
    # 基本信息
    title = Column(String(255), nullable=False)  # 文章标题，不能为空
    content = Column(Text, nullable=False)  # 文章内容，不能为空
    summary = Column(String(500))  # 文章摘要，最多500字
    created_at = Column(DateTime, index=True)  # 创建时间，添加索引
    updated_at = Column(DateTime)  # 更新时间
    
    # 外键关系
    category_id = Column(Integer, ForeignKey("categories.id"))  # 分类ID，关联categories表
    author_id = Column(Integer, ForeignKey("users.id"))  # 作者ID，关联users表
    
    # 关联关系
    category = relationship("Category", back_populates="articles")  # 与Category模型的双向关联
    author = relationship("User", back_populates="articles")  # 与User模型的双向关联