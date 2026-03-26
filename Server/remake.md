Server/
├── app/
│   ├── api/            # API路由
│   │   ├── articles.py   # 文章管理接口
│   │   ├── categories.py # 分类管理接口
│   │   ├── users.py      # 用户管理接口
│   │   └── roles.py      # 角色管理接口
│   ├── core/           # 核心配置
│   │   └── config.py     # 配置文件
│   ├── models/         # 数据库模型
│   │   ├── article.py    # 文章模型
│   │   ├── category.py   # 分类模型
│   │   ├── user.py       # 用户模型
│   │   └── role.py       # 角色模型
│   ├── schemas/        # 数据验证模型
│   │   ├── article.py    # 文章验证模型
│   │   ├── category.py   # 分类验证模型
│   │   ├── user.py       # 用户验证模型
│   │   └── role.py       # 角色验证模型
│   └── database.py     # 数据库连接
├── main.py             # 主应用文件
├── init_db.py          # 数据库初始化
├── requirements.txt    # 依赖包
└── start.sh            # 启动脚本