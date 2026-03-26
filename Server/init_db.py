from datetime import datetime
from sqlalchemy import text
from app.database import engine, Base, SessionLocal
from app.models import Article, Category, User, Role

def init_database():
    """初始化数据库，创建所有表"""
    try:
        # 测试数据库连接
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))

            print(f"✓ 数据库连接成功,{result}")
        
        # 创建所有表
        print("开始创建数据库表...")
        Base.metadata.create_all(bind=engine)
        
        # 初始化系统数据
        init_system_data()
        
    except Exception as e:
        print(f"✗ 数据库初始化失败: {e}")
        raise


def init_system_data():
    """初始化系统数据：角色、用户、分类和文章"""
    db = SessionLocal()
    try:
        # 初始化角色
        init_roles(db)
        
        # 初始化用户
        init_users(db)
        
        # 初始化分类
        init_categories(db)
        
        # 初始化文章
        init_articles(db)
        
        print("✓ 系统数据初始化完成")
        
    except Exception as e:
        db.rollback()
        print(f"✗ 系统数据初始化失败: {e}")
        raise
    finally:
        db.close()

def init_roles(db):
    """初始化角色数据"""
    # 检查是否已经初始化
    existing_roles = db.query(Role).all()
    if existing_roles:
        print("✓ 角色数据已存在，跳过初始化")
        return
    
    # 创建管理员角色
    admin_role = Role(
        name="管理员",
        description="系统管理员，拥有所有权限",
    )
    db.add(admin_role)
    
    # 创建普通用户角色
    user_role = Role(
        name="普通用户",
        description="普通用户，拥有基本权限",
    )
    db.add(user_role)
    
    # 提交角色数据
    db.commit()
    print("✓ 角色数据初始化完成")

def init_users(db):
    """初始化用户数据"""
    # 检查是否已经初始化
    existing_users = db.query(User).all()
    if existing_users:
        print("✓ 用户数据已存在，跳过初始化")
        return
    
    # 获取管理员角色
    admin_role = db.query(Role).filter(Role.name == "管理员").first()
    if not admin_role:
        print("✗ 管理员角色不存在，请先初始化角色")
        return
    
    # 获取普通用户角色
    user_role = db.query(Role).filter(Role.name == "普通用户").first()
    if not user_role:
        print("✗ 普通用户角色不存在，请先初始化角色")
        return
    
   
    
    # 创建管理员用户
    admin_user = User(
        username="admin",
        email="admin@example.com",
        password="admin123",
        role_id=admin_role.id,
        avatar="https://neeko-copilot.bytedance.net/api/text2image?prompt=admin%20user%20avatar&size=128x128",
        nickname="系统管理员",
        bio="负责系统的日常维护和管理",
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    db.add(admin_user)
    
    # 创建游客用户
    guest_user = User(
        username="guest",
        email="guest@example.com",
        password="guest123",
        role_id=user_role.id,
        avatar="https://neeko-copilot.bytedance.net/api/text2image?prompt=guest%20user%20avatar&size=128x128",
        nickname="访客",
        bio="系统访客用户",
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    db.add(guest_user)
    
    # 提交用户数据
    db.commit()
    print("✓ 用户数据初始化完成")

def init_categories(db):
    """初始化分类数据"""
    # 检查是否已经初始化
    existing_categories = db.query(Category).all()
    if existing_categories:
        print("✓ 分类数据已存在，跳过初始化")
        return
    
    # 创建技术分类
    tech_category = Category(
        name="技术",
        description="技术相关文章"
    )
    db.add(tech_category)
    
    # 创建其他分类
    other_category = Category(
        name="其他",
        description="其他分类"
    )
    db.add(other_category)
    
    # 提交分类数据
    db.commit()
    print("✓ 分类数据初始化完成")

def init_articles(db):
    """初始化文章数据"""
    # 检查是否已经初始化
    existing_articles = db.query(Article).all()
    if existing_articles:
        print("✓ 文章数据已存在，跳过初始化")
        return
    
    # 获取其他分类
    other_category = db.query(Category).filter(Category.name == "其他").first()
    if not other_category:
        print("✗ 其他分类不存在，请先初始化分类")
        return
    
    # 获取管理员用户
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        print("✗ 管理员用户不存在，请先初始化用户")
        return
    
    # 创建示例文章
    sample_article = Article(
        title="欢迎使用博客系统",
        content="这是一篇示例文章，欢迎使用博客系统。\n\n你可以在这里发布技术文章、生活感悟等各种内容。\n\n系统功能包括：\n- 文章管理\n- 分类管理\n- 用户管理\n- 角色管理\n\n祝你使用愉快！",
        summary="欢迎使用博客系统，这是一篇示例文章。",
        category_id=other_category.id,
        author_id=admin_user.id,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    db.add(sample_article)
    
    # 提交文章数据
    db.commit()
    print("✓ 文章数据初始化完成")

if __name__ == "__main__":
    init_database()