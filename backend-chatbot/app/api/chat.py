from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import asyncio

from ..database import get_database
from ..models import User, Conversation, Message
from ..services.gemini_service import gemini_service
from ..schemas.chat import (
    ChatRequest, 
    ChatResponse, 
    ConversationCreate,
    ConversationResponse,
    MessageResponse
)

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("/send", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    db: Session = Depends(get_database)
):
    """
    Send a message and get AI response
    """
    try:
        # Get or create user
        user = db.query(User).filter(User.id == request.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get or create conversation
        if request.conversation_id:
            conversation = db.query(Conversation).filter(
                Conversation.id == request.conversation_id,
                Conversation.user_id == request.user_id
            ).first()
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
        else:
            # Create new conversation
            conversation = Conversation(
                user_id=request.user_id,
                title="Cuộc trò chuyện mới"
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
        
        # Save user message
        user_message = Message(
            conversation_id=conversation.id,
            content=request.message,
            is_user=True
        )
        db.add(user_message)
        db.commit()
        
        # Get conversation history
        messages = db.query(Message).filter(
            Message.conversation_id == conversation.id
        ).order_by(Message.created_at).all()
        
        # Convert to dict for AI service
        history = []
        for msg in messages[:-1]:  # Exclude current message
            history.append({
                "content": msg.content,
                "is_user": msg.is_user
            })
        
        # Generate AI response
        ai_response = await gemini_service.generate_response(
            message=request.message,
            conversation_history=history
        )
        
        # Save AI response
        ai_message = Message(
            conversation_id=conversation.id,
            content=ai_response,
            is_user=False
        )
        db.add(ai_message)
        
        # Update conversation title if it's the first exchange
        if len(messages) <= 2:  # First user message + AI response
            title = await gemini_service.get_conversation_summary([
                {"content": request.message, "is_user": True},
                {"content": ai_response, "is_user": False}
            ])
            conversation.title = title
        
        db.commit()
        db.refresh(ai_message)
        
        return ChatResponse(
            message_id=ai_message.id,
            conversation_id=conversation.id,
            response=ai_response,
            timestamp=ai_message.created_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router.get("/conversations/{user_id}", response_model=List[ConversationResponse])
async def get_user_conversations(
    user_id: int,
    db: Session = Depends(get_database)
):
    """
    Get all conversations for a user
    """
    conversations = db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).order_by(Conversation.updated_at.desc()).all()
    
    return [
        ConversationResponse(
            id=conv.id,
            title=conv.title,
            created_at=conv.created_at,
            updated_at=conv.updated_at
        )
        for conv in conversations
    ]

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_database)
):
    """
    Get all messages in a conversation
    """
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).all()
    
    return [
        MessageResponse(
            id=msg.id,
            content=msg.content,
            is_user=msg.is_user,
            created_at=msg.created_at
        )
        for msg in messages
    ]

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    user_id: int,
    db: Session = Depends(get_database)
):
    """
    Delete a conversation and all its messages
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Delete messages first (due to foreign key constraint)
    db.query(Message).filter(Message.conversation_id == conversation_id).delete()
    
    # Delete conversation
    db.delete(conversation)
    db.commit()
    
    return {"message": "Conversation deleted successfully"}