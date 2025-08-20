from sqlalchemy import Column, Integer, String, DateTime, Boolean, func, Enum
from sqlalchemy.orm import relationship
from core.database import Base
import enum
from datetime import datetime, timedelta

class ReservationStatus(enum.Enum):
    ACTIVE = "active"      # Đang giữ chỗ
    COMPLETED = "completed"  # Đã hoàn thành (review được tạo)
    EXPIRED = "expired"    # Hết hạn 72 giờ
    CANCELLED = "cancelled"  # Bị hủy

class LocationReservation(Base):
    __tablename__ = "location_reservations"

    id = Column(Integer, primary_key=True, index=True)
    
    # Location info
    location_name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    location_key = Column(String, nullable=False, index=True)  # Normalized location key
    
    # User info
    user_id = Column(Integer, nullable=False, index=True)
    
    # Reservation details
    status = Column(Enum(ReservationStatus), default=ReservationStatus.ACTIVE)
    deposit_amount = Column(Integer, default=50)  # Số coin đã cọc
    
    # Timing
    reserved_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))  # 72 giờ từ reserved_at
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Reference
    review_id = Column(Integer, nullable=True)  # ID của review được tạo (nếu có)
    coin_transaction_id = Column(Integer, nullable=True)  # ID của transaction cọc tiền
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.expires_at:
            # Set expiry to 72 hours from now
            self.expires_at = datetime.utcnow() + timedelta(hours=72)
    
    @property
    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at
    
    @property
    def hours_remaining(self) -> float:
        if self.is_expired:
            return 0
        delta = self.expires_at - datetime.utcnow()
        return delta.total_seconds() / 3600
    
    def __repr__(self):
        return f"<LocationReservation(user_id={self.user_id}, location='{self.location_name}', status={self.status.value})>" 