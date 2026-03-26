from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import articles, categories, users, roles, auth, about

app = FastAPI(
    title="博客系统API",
    description="包含文章管理、分类管理、用户管理、角色管理的API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证管理"])
app.include_router(articles.router, prefix="/api/articles", tags=["文章管理"])
app.include_router(categories.router, prefix="/api/categories", tags=["分类管理"])
app.include_router(users.router, prefix="/api/users", tags=["用户管理"])
app.include_router(roles.router, prefix="/api/roles", tags=["角色管理"])
app.include_router(about.router, prefix="/api/about", tags=["关于"])

@app.get("/")
def read_root():
    return {"message": "欢迎使用博客系统API"}
