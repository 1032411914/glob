from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# 创建数据库引擎
# engine是数据库连接的核心，负责与数据库建立连接
engine = create_engine(
    settings.DATABASE_URL,  # 数据库连接URL，从配置文件中获取
)

# 创建会话工厂
# SessionLocal是一个会话类，每次调用时会创建一个新的数据库会话
SessionLocal = sessionmaker(
    autocommit=False,  # 自动提交设置为False，需要手动调用commit()
    autoflush=False,  # 自动刷新设置为False，需要手动调用flush()
    bind=engine  # 绑定到上面创建的数据库引擎
)

# 创建基类
# Base是所有模型类的基类，所有模型都继承自这个类
Base = declarative_base()


# 依赖项：获取数据库会话
def get_db():
    """获取数据库会话的依赖函数
    
    使用yield关键字实现上下文管理，确保会话在使用完毕后被正确关闭
    
    Yields:
        Session: 数据库会话对象
    """
    db = SessionLocal()  # 创建新的数据库会话
    try:
        yield db  # 生成会话对象给调用者使用
    finally:
        db.close()  # 无论如何都会关闭会话，确保资源被释放