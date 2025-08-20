from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from schemas.user import User

class ReviewBase(BaseModel):
    title: str
    content: str
    location_name: str
    address: str
    
    @validator('title')
    def title_must_be_valid(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Tiêu đề phải có ít nhất 10 ký tự')
        if len(v.strip()) > 200:
            raise ValueError('Tiêu đề không được vượt quá 200 ký tự')
        return v.strip()
    
    @validator('content')
    def content_must_be_valid(cls, v):
        if len(v.strip()) < 50:
            raise ValueError('Nội dung phải có ít nhất 50 ký tự để đảm bảo chất lượng')
        if len(v.strip()) > 10000:
            raise ValueError('Nội dung không được vượt quá 10,000 ký tự')
        return v.strip()
    
    @validator('location_name')
    def location_name_must_be_valid(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('Tên địa điểm phải có ít nhất 3 ký tự')
        if len(v.strip()) > 100:
            raise ValueError('Tên địa điểm không được vượt quá 100 ký tự')
        return v.strip()
    
    @validator('address')
    def address_must_be_valid(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Địa chỉ phải có ít nhất 10 ký tự')
        if len(v.strip()) > 500:
            raise ValueError('Địa chỉ không được vượt quá 500 ký tự')
        return v.strip()

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    
    @validator('title')
    def title_must_be_valid(cls, v):
        if v is not None and len(v.strip()) < 10:
            raise ValueError('Tiêu đề phải có ít nhất 10 ký tự')
        return v.strip() if v else None
    
    @validator('content')
    def content_must_be_valid(cls, v):
        if v is not None and len(v.strip()) < 50:
            raise ValueError('Nội dung phải có ít nhất 50 ký tự')
        return v.strip() if v else None

class Review(ReviewBase):
    id: int
    location_key: str
    is_premium: bool
    is_published: bool
    owner_id: int
    owner: User
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ReviewSummary(BaseModel):
    """Simplified review info for listings"""
    id: int
    title: str
    location_name: str
    location_key: str
    is_premium: bool
    owner: User
    created_at: datetime
    
    class Config:
        from_attributes = True 