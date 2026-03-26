from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.schemas.response import ResponseModel

router = APIRouter()  # 创建路由器对象

@router.get("/")
def get_categories(
    page: int = 1,  # 页码，默认为1
    page_size: int = 10,  # 每页记录数，默认为10
    db: Session = Depends(get_db)
):
    """获取分类列表（分页）
    
    Args:
        page: 页码
        page_size: 每页记录数
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 分类列表和总记录数
    """
    # 构建查询
    query = db.query(Category)
    
    # 计算总记录数
    total = query.count()
    
    # 计算偏移量
    skip = (page - 1) * page_size
    # 执行查询
    categories = query.offset(skip).limit(page_size).all()
    
    # 转换为字典列表，避免序列化错误
    categories_list = []
    for category in categories:
        # 计算该分类下的文章数量
        article_count = len(category.articles) if category.articles else 0
        
        categories_list.append({
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "articleCount": article_count,
        })
    
    # 返回包含总记录数和分类列表的数据
    return ResponseModel(data={
        "items": categories_list,
        "total": total
    })

@router.get("/simple")
def get_simple_categories(db: Session = Depends(get_db)):
    """获取所有分类列表（只包含id和名称）
    
    Args:
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 分类列表，只包含id和名称
    """
    # 查询所有分类
    categories = db.query(Category).all()
    
    # 转换为字典列表，只包含id和名称
    categories_list = []
    for category in categories:
        categories_list.append({
            "id": category.id,
            "name": category.name,
        })
    
    return ResponseModel(data=categories_list)

@router.post("/")
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """创建新分类
    
    Args:
        category: 分类创建对象，包含名称、描述等信息
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 创建的分类信息
    """
    # 创建分类对象
    db_category = Category(**category.model_dump())
    # 添加到数据库
    db.add(db_category)
    # 提交事务
    db.commit()
    # 刷新对象，获取最新数据
    db.refresh(db_category)
    
    # 转换为字典，避免序列化错误
    category_dict = {
        "id": db_category.id,
        "name": db_category.name,
        "description": db_category.description,
    }
    
    return ResponseModel(data=category_dict)

@router.get("/{category_id}")
def get_category(category_id: int, db: Session = Depends(get_db)):
    """获取分类详情
    
    Args:
        category_id: 分类ID
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 分类详细信息
    """
    # 查询分类
    category = db.query(Category).filter(Category.id == category_id).first()
    # 检查分类是否存在
    if not category:
        return ResponseModel(code=404, msg="分类不存在")
    
    # 转换为字典，避免序列化错误
    category_dict = {
        "id": category.id,
        "name": category.name,
        "description": category.description,
    }
    
    return ResponseModel(data=category_dict)

@router.put("/{category_id}")
def update_category(
    category_id: int,  # 分类ID
    category: CategoryUpdate,  # 分类更新对象
    db: Session = Depends(get_db)  # 数据库会话对象
):
    """更新分类
    
    Args:
        category_id: 分类ID
        category: 分类更新对象，包含需要更新的字段
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 更新后的分类信息
    """
    # 查询分类
    db_category = db.query(Category).filter(Category.id == category_id).first()
    # 检查分类是否存在
    if not db_category:
        return ResponseModel(code=404, msg="分类不存在")
    
    # 检查是否为系统分类
    if db_category.name == '其他':
        return ResponseModel(code=403, msg="系统分类不能修改")
    
    # 获取更新数据，排除未设置的字段
    update_data = category.model_dump(exclude_unset=True)
    # 更新字段
    for key, value in update_data.items():
        setattr(db_category, key, value)
    
    # 提交事务
    db.commit()
    # 刷新对象，获取最新数据
    db.refresh(db_category)
    
    # 转换为字典，避免序列化错误
    category_dict = {
        "id": db_category.id,
        "name": db_category.name,
        "description": db_category.description,
    }
    
    return ResponseModel(data=category_dict)

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """删除分类
    
    Args:
        category_id: 分类ID
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 删除结果信息
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return ResponseModel(code=404, msg="分类不存在")
    
    if category.name in ['其他', '技术']:
        return ResponseModel(code=403, msg="系统分类不能删除")
    
    if category.articles:
        return ResponseModel(code=400, msg="该分类下有文章，无法删除")
    
    db.delete(category)
    db.commit()
    return ResponseModel(msg="删除成功")