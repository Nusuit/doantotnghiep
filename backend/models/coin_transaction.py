from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func, Enum
from sqlalchemy.orm import relationship
from core.database import Base
import enum

class TransactionType(enum.Enum):
    PURCHASE = "purchase"  # Mua coin bằng tiền thật
    EARNED = "earned"      # Kiếm coin (viết review, đóng góp...)  
    SPENT = "spent"        # Chi coin (tip, unlock premium...)
    REWARD = "reward"      # Thưởng từ hệ thống
    REFUND = "refund"      # Hoàn tiền

class CoinTransaction(Base):
    __tablename__ = "coin_transactions"

    id = Column(Integer, primary_key=True, index=True)
    
    # User và amount
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # Positive = gain, Negative = loss
    
    # Transaction details
    transaction_type = Column(Enum(TransactionType), nullable=False)
    description = Column(Text, nullable=False)
    
    # Reference (optional)
    reference_id = Column(Integer, nullable=True)  # ID của review, comment, etc.
    reference_type = Column(String, nullable=True)  # "review", "comment", "tip", etc.
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="coin_transactions")
    
    def __repr__(self):
        return f"<CoinTransaction(user_id={self.user_id}, amount={self.amount}, type={self.transaction_type.value})>" 