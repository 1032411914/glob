from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ArticleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    summary: Optional[str] = Field(None, max_length=500)
    category_id: int


class ArticleCreate(ArticleBase):
    author_id: int


class ArticleUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    summary: Optional[str] = Field(None, max_length=500)
    category_id: Optional[int] = None
    author_id: Optional[int] = None


class ArticleResponse(ArticleBase):
    id: int
    author_id: int
    author_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class BatchDeleteRequest(BaseModel):
    ids: List[int] = Field(..., min_length=1, description="要删除的文章ID列表")