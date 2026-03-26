from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.models.role import Role
from app.schemas.role import RoleCreate, RoleUpdate
from app.schemas.response import ResponseModel

router = APIRouter()  # 创建路由器对象

@router.get("/")
def get_roles(
    page: int = 1,  # 页码，默认为1
    page_size: int = 10,  # 每页记录数，默认为10
    db: Session = Depends(get_db)
):
    """获取角色列表（分页）
    
    Args:
        page: 页码
        page_size: 每页记录数
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 角色列表和总记录数
    """
    # 构建查询
    query = db.query(Role)
    
    # 计算总记录数
    total = query.count()
    
    # 计算偏移量
    skip = (page - 1) * page_size
    # 执行查询
    roles = query.offset(skip).limit(page_size).all()
    
    # 转换为字典列表，添加userCount字段
    roles_list = []
    for role in roles:
        roles_list.append({
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "userCount": len(role.users)  # 添加用户数量
        })
    
    # 返回包含总记录数和角色列表的数据
    return ResponseModel(data={
        "items": roles_list,
        "total": total
    })

@router.get("/all")
def get_all_roles(db: Session = Depends(get_db)):
    """获取所有角色列表（不分页）
    
    Args:
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 角色列表
    """
    # 查询所有角色
    roles = db.query(Role).all()
    
    # 转换为字典列表，添加userCount字段
    roles_list = []
    for role in roles:
        roles_list.append({
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "userCount": len(role.users)  # 添加用户数量
        })
    
    return ResponseModel(data=roles_list)


@router.get("/simple")
def get_simple_roles(db: Session = Depends(get_db)):
    """获取所有角色列表（只包含id和名称）
    
    Args:
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 角色列表，只包含id和名称
    """
    # 查询所有角色
    roles = db.query(Role).all()
    
    # 转换为字典列表，只包含id和名称
    roles_list = []
    for role in roles:
        roles_list.append({
            "id": role.id,
            "name": role.name,
        })
    
    return ResponseModel(data=roles_list)

@router.post("/")
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    """创建新角色
    
    Args:
        role: 角色创建对象，包含角色名称、描述和权限
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 创建的角色信息
    """
    try:
        # 检查角色名是否已存在
        existing_role = db.query(Role).filter(Role.name == role.name).first()
        if existing_role:
            return ResponseModel(code=400, msg="角色名已存在")
        
        # 创建角色对象
        db_role = Role(**role.model_dump())
        # 添加到数据库
        db.add(db_role)
        # 提交事务
        db.commit()
        # 刷新对象，获取最新数据
        db.refresh(db_role)
        
        # 转换为字典，避免序列化错误
        role_dict = {
            "id": db_role.id,
            "name": db_role.name,
            "description": db_role.description
        }
        
        return ResponseModel(data=role_dict)
    except Exception as e:
        db.rollback()
        return ResponseModel(code=500, msg=f"创建角色失败: {str(e)}")

@router.get("/{role_id}")
def get_role(role_id: int, db: Session = Depends(get_db)):
    """获取角色详情
    
    Args:
        role_id: 角色ID
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 角色详细信息
    """
    # 查询角色
    role = db.query(Role).filter(Role.id == role_id).first()
    # 检查角色是否存在
    if not role:
        return ResponseModel(code=404, msg="角色不存在")
    return ResponseModel(data=role)

@router.put("/{role_id}")
def update_role(
    role_id: int,  # 角色ID
    role: RoleUpdate,  # 角色更新对象
    db: Session = Depends(get_db)  # 数据库会话对象
):
    """更新角色
    
    Args:
        role_id: 角色ID
        role: 角色更新对象，包含需要更新的字段
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 更新后的角色信息
    """
    try:
        # 查询角色
        db_role = db.query(Role).filter(Role.id == role_id).first()
        # 检查角色是否存在
        if not db_role:
            return ResponseModel(code=404, msg="角色不存在")
        
        # 检查是否为系统角色
        if db_role.name in ['管理员', '普通用户']:
            return ResponseModel(code=403, msg="系统角色不能修改")
        
        # 检查角色名是否已被其他角色使用
        if role.name and role.name != db_role.name:
            existing_role = db.query(Role).filter(Role.name == role.name).first()
            if existing_role:
                return ResponseModel(code=400, msg="角色名已存在")
        
        # 获取更新数据，排除未设置的字段
        update_data = role.model_dump(exclude_unset=True)
        # 更新字段
        for key, value in update_data.items():
            setattr(db_role, key, value)
        
        # 提交事务
        db.commit()
        # 刷新对象，获取最新数据
        db.refresh(db_role)
        
        # 转换为字典，避免序列化错误
        role_dict = {
            "id": db_role.id,
            "name": db_role.name,
            "description": db_role.description
        }
        
        return ResponseModel(data=role_dict)
    except Exception as e:
        db.rollback()
        return ResponseModel(code=500, msg=f"更新角色失败: {str(e)}")

@router.delete("/{role_id}")
def delete_role(role_id: int, db: Session = Depends(get_db)):
    """删除角色
    
    Args:
        role_id: 角色ID
        db: 数据库会话对象
    
    Returns:
        ResponseModel: 删除成功信息
    """
    # 查询角色
    role = db.query(Role).filter(Role.id == role_id).first()
    # 检查角色是否存在
    if not role:
        return ResponseModel(code=404, msg="角色不存在")
    
    # 检查是否为系统角色
    if role.name in ['管理员', '普通用户']:
        return ResponseModel(code=403, msg="系统角色不能删除")
    
    # 检查是否有用户使用该角色
    if role.users:
        return ResponseModel(code=400, msg="该角色下有用户，无法删除")
    
    # 删除角色
    db.delete(role)
    # 提交事务
    db.commit()
    return ResponseModel(msg="删除成功")