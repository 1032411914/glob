from pydantic import BaseModel
from typing import Optional, Any


class ResponseModel(BaseModel):
    """统一响应模型"""
    code: int = 200
    msg: str = "success"
    data: Optional[Any] = None


class ErrorResponseModel(BaseModel):
    """错误响应模型"""
    code: int
    msg: str
    data: Optional[Any] = None