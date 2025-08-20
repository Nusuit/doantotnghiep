from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    reputation_score = Column(Integer, default=0)
    coin_balance = Column(Integer, default=200)  # Tăng initial balance từ 100 lên 200
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    reviews = relationship("Review", back_populates="owner")
    coin_transactions = relationship("CoinTransaction", back_populates="user")
