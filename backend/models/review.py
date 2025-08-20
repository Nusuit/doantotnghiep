from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from core.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    location_name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    
    # Normalized location for uniqueness checking
    location_key = Column(String, unique=True, nullable=False, index=True)
    
    # Status và metadata
    is_premium = Column(Boolean, default=False)
    is_published = Column(Boolean, default=True)
    
    # Ownership và timing
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="reviews")
    
    def __repr__(self):
        return f"<Review(id={self.id}, title='{self.title}', location_key='{self.location_key}')>" 