from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class ReservationStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class LocationReservationCreate(BaseModel):
    location_name: str
    address: str
    
    @validator('location_name')
    def location_name_must_be_valid(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('Tên địa điểm phải có ít nhất 3 ký tự')
        return v.strip()
    
    @validator('address')
    def address_must_be_valid(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Địa chỉ phải có ít nhất 10 ký tự')
        return v.strip()

class LocationReservation(BaseModel):
    id: int
    location_name: str
    address: str
    location_key: str
    user_id: int
    status: ReservationStatus
    deposit_amount: int
    reserved_at: datetime
    expires_at: datetime
    completed_at: Optional[datetime]
    review_id: Optional[int]
    
    # Computed fields
    is_expired: bool
    hours_remaining: float
    
    class Config:
        from_attributes = True

class ReservationSummary(BaseModel):
    """Simplified reservation info"""
    id: int
    location_name: str
    status: ReservationStatus
    hours_remaining: float
    deposit_amount: int
    reserved_at: datetime
    
    class Config:
        from_attributes = True 