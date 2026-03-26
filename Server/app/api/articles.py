from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.article import Article
from app.schemas.article import ArticleCreate, ArticleUpdate, BatchDeleteRequest
from app.schemas.response import ResponseModel
from app.models.user import User

router = APIRouter()  # 创建路由器对象

@router.get("/")
def get_articles(
    page: int = 1,  # 页码，默认为1
    page_size: int = 10,  # 每页记录数，默认为10
    category_id: Optional[int] = None,  # 分类ID，可选
    db: Session = Depends(get_db)  # 数据库会话对象
):
    """获取文章列表
    
    Args:
        page: 页码
        page_size: 每页记录数
        category_id: 按分类筛选
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 文章列表和总记录数
    """
    from app.models.category import Category
    
    # 构建查询，关联分类表
    query = db.query(Article).join(Category, Article.category_id == Category.id)
    # 按分类筛选
    if category_id:
        query = query.filter(Article.category_id == category_id)
    
    # 计算总记录数
    total = query.count()
    
    # 计算偏移量
    skip = (page - 1) * page_size
    # 执行查询
    articles = query.offset(skip).limit(page_size).all()
    
    # 转换为字典列表，避免序列化错误
    articles_list = []
    for article in articles:
        category_name = article.category.name if article.category else "未分类"
        author_name = article.author.nickname if article.author else "未知"
        articles_list.append({
            "id": article.id,
            "title": article.title,
            "content": article.content,
            "summary": article.summary,
            "category_id": article.category_id,
            "category_name": category_name,
            "author_id": article.author_id,
            "author_name": author_name,
            "created_at": article.created_at,
            "updated_at": article.updated_at
        })
    
    # 返回包含总记录数和文章列表的数据
    return ResponseModel(data={
        "items": articles_list,
        "total": total
    })

@router.post("/")
def create_article(article: ArticleCreate, db: Session = Depends(get_db)):
    """创建新文章
    
    Args:
        article: 文章创建对象，包含标题、内容、摘要等信息
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 创建的文章信息
    """
    try:
        from app.models.category import Category
        
        # 打印接收到的数据，用于调试
        print(f"接收到的文章数据: {article.model_dump()}")
        
        # 检查分类是否存在
        if article.category_id:
            category = db.query(Category).filter(Category.id == article.category_id).first()
            if not category:
                return ResponseModel(code=400, msg=f"分类ID {article.category_id} 不存在")
        
        # 创建文章对象
        db_article = Article(
            title=article.title,
            content=article.content,
            summary=article.summary,
            category_id=article.category_id,
            author_id=article.author_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        # 添加到数据库
        db.add(db_article)
        # 提交事务
        db.commit()
        # 刷新对象，获取最新数据
        db.refresh(db_article)
        
        # 获取分类名称
        category_name = None
        if db_article.category_id:
            category = db.query(Category).filter(Category.id == db_article.category_id).first()
            category_name = category.name if category else None
        
        # 获取作者名称
        author_name = None
        if db_article.author_id:
            author = db.query(User).filter(User.id == db_article.author_id).first()
            author_name = author.nickname if author else None
        
        # 转换为字典，避免序列化错误
        article_dict = {
            "id": db_article.id,
            "title": db_article.title,
            "content": db_article.content,
            "summary": db_article.summary,
            "category_id": db_article.category_id,
            "category_name": category_name,
            "author_id": db_article.author_id,
            "author_name": author_name,
            "created_at": db_article.created_at,
            "updated_at": db_article.updated_at
        }
        
        return ResponseModel(data=article_dict)
    except Exception as e:
        db.rollback()
        print(f"创建文章失败: {str(e)}")
        return ResponseModel(code=500, msg=f"创建文章失败: {str(e)}")

@router.delete("/")
def delete_articles(request: BatchDeleteRequest, db: Session = Depends(get_db)):
    """删除文章（支持单个和批量）
    
    Args:
        request: 删除请求对象，包含文章ID列表
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 删除成功信息
    """
    try:
        if not request.ids:
            return ResponseModel(code=400, msg="请提供要删除的文章ID列表")
        
        # 查询所有要删除的文章
        articles = db.query(Article).filter(Article.id.in_(request.ids)).all()
        
        if not articles:
            return ResponseModel(code=404, msg="未找到要删除的文章")
        
        # 检查是否包含系统默认文章
        for article in articles:
            if article.title == '欢迎使用博客系统':
                return ResponseModel(code=403, msg="系统默认文章不能删除")
        
        # 删除文章
        for article in articles:
            db.delete(article)
        
        # 提交事务
        db.commit()
        
        # 根据删除数量返回不同的消息
        if len(articles) == 1:
            return ResponseModel(msg="删除成功")
        else:
            return ResponseModel(msg=f"成功删除 {len(articles)} 篇文章")
    except Exception as e:
        db.rollback()
        print(f"删除文章失败: {str(e)}")
        return ResponseModel(code=500, msg=f"删除文章失败: {str(e)}")

@router.get("/{article_id}")
def get_article(article_id: int, db: Session = Depends(get_db)):
    """获取文章详情
    
    Args:
        article_id: 文章ID
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 文章详细信息
    """
    from app.models.category import Category
    
    # 查询文章
    article = db.query(Article).filter(Article.id == article_id).first()
    # 检查文章是否存在
    if not article:
        return ResponseModel(code=404, msg="文章不存在")
    
    # 获取分类名称
    category_name = None
    if article.category_id:
        category = db.query(Category).filter(Category.id == article.category_id).first()
        category_name = category.name if category else None
    
    # 获取作者名称
    author_name = None
    if article.author_id:
        author = db.query(User).filter(User.id == article.author_id).first()
        author_name = author.nickname if author else None
    
    # 转换为字典，避免序列化错误
    article_dict = {
        "id": article.id,
        "title": article.title,
        "content": article.content,
        "summary": article.summary,
        "category_id": article.category_id,
        "category_name": category_name,
        "author_id": article.author_id,
        "author_name": author_name,
        "created_at": article.created_at,
        "updated_at": article.updated_at
    }
    
    return ResponseModel(data=article_dict)

@router.put("/{article_id}")
def update_article(
    article_id: int,  # 文章ID
    article: ArticleUpdate,  # 文章更新对象
    db: Session = Depends(get_db)  # 数据库会话对象
):
    """更新文章
    
    Args:
        article_id: 文章ID
        article: 文章更新对象，包含需要更新的字段
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 更新后的文章信息
    """
    try:
        # 打印接收到的数据，用于调试
        print(f"更新文章ID: {article_id}, 接收到的数据: {article.model_dump()}")
        
        # 查询文章
        db_article = db.query(Article).filter(Article.id == article_id).first()
        # 检查文章是否存在
        if not db_article:
            return ResponseModel(code=404, msg="文章不存在")
        
        # 获取更新数据，排除未设置的字段
        update_data = article.model_dump(exclude_unset=True)
        print(f"需要更新的字段: {update_data}")
        
        # 检查分类是否存在（如果更新了分类）
        if 'category_id' in update_data and update_data['category_id'] is not None:
            from app.models.category import Category
            category = db.query(Category).filter(Category.id == update_data['category_id']).first()
            if not category:
                return ResponseModel(code=400, msg=f"分类ID {update_data['category_id']} 不存在")
        
        # 更新字段
        for key, value in update_data.items():
            if value is not None:  # 只更新非None的值
                setattr(db_article, key, value)
        
        # 更新更新时间
        db_article.updated_at = datetime.now()
        
        # 提交事务
        db.commit()
        # 刷新对象，获取最新数据
        db.refresh(db_article)
        
        # 获取分类名称
        from app.models.category import Category
        category_name = None
        if db_article.category_id:
            category = db.query(Category).filter(Category.id == db_article.category_id).first()
            category_name = category.name if category else None
        
        # 获取作者名称
        author_name = None
        if db_article.author_id:
            author = db.query(User).filter(User.id == db_article.author_id).first()
            author_name = author.nickname if author else None
        
        # 转换为字典，避免序列化错误
        article_dict = {
            "id": db_article.id,
            "title": db_article.title,
            "content": db_article.content,
            "summary": db_article.summary,
            "category_id": db_article.category_id,
            "category_name": category_name,
            "author_id": db_article.author_id,
            "author_name": author_name,
            "created_at": db_article.created_at,
            "updated_at": db_article.updated_at
        }
        
        return ResponseModel(data=article_dict)
    except Exception as e:
        db.rollback()
        print(f"更新文章失败: {str(e)}")
        return ResponseModel(code=500, msg=f"更新文章失败: {str(e)}")


