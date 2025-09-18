from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ChatRequest(BaseModel):
    user_id: int
    message: str
    conversation_id: Optional[int] = None

class ChatResponse(BaseModel):
    message_id: int
    conversation_id: int
    response: str
    timestamp: datetime

class ConversationCreate(BaseModel):
    user_id: int
    title: str = "Cuộc trò chuyện mới"

class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    id: int
    content: str
    is_user: bool
    created_at: datetime
    
    class Config:
        from_attributes = True