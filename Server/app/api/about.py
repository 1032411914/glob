from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_about():
    # 动态数据示例：可根据需要改为从数据库/配置获取
    data = {
        "title": "关于我",
        "intro": [
            "嗨，我是冯驷驹，一个普通的技术爱好者和博客作者。",
            "这个博客用于记录我的生活、技术心得和一些思考。"
        ],
        "tech_stack": [
            "前端：Vue 3, TypeScript, Element Plus",
            "后端：FastAPI, Python, PostgreSQL",
            "其他：Vite, Git, Docker"
        ],
        "contact": {
            "email": "example@example.com"
        }
    }
    # 统一包装为 { data: { ... } }，以保持前端习惯的响应结构
    return { "data": data }
