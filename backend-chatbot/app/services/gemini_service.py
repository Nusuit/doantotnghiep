import google.generativeai as genai
from typing import List, Dict, Any
import os
from ..config.settings import settings

class GeminiService:
    def __init__(self):
        # Configure Gemini API
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        
        # Initialize the model
        try:
            self.model = genai.GenerativeModel('gemini-pro')
        except:
            # Fallback for older versions
            self.model = None
    
    async def generate_response(self, message: str, conversation_history: List[Dict[str, Any]] = None) -> str:
        """
        Generate response from Gemini AI based on user message and conversation history
        
        Args:
            message: User's current message
            conversation_history: Previous messages in the conversation
            
        Returns:
            Generated response from Gemini
        """
        try:
            # Prepare context from conversation history
            context = self._prepare_context(conversation_history)
            
            # Create prompt with context
            prompt = self._create_prompt(message, context)
            
            # Generate response
            if self.model:
                response = self.model.generate_content(prompt)
                return response.text.strip() if response.text else "Xin lỗi, tôi không thể tạo ra câu trả lời."
            else:
                # Fallback response
                return f"Echo: {message} (Gemini API chưa được cấu hình)"
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau."
    
    def _prepare_context(self, conversation_history: List[Dict[str, Any]]) -> str:
        """Prepare conversation context for the AI model"""
        if not conversation_history:
            return ""
        
        context_parts = []
        for msg in conversation_history[-10:]:  # Chỉ lấy 10 tin nhắn gần nhất
            role = "Người dùng" if msg.get('is_user') else "Assistant"
            content = msg.get('content', '')
            context_parts.append(f"{role}: {content}")
        
        return "\n".join(context_parts)
    
    def _create_prompt(self, message: str, context: str) -> str:
        """Create a well-structured prompt for the AI model"""
        system_prompt = """
        Bạn là một AI assistant thông minh và hữu ích. Hãy trả lời các câu hỏi một cách:
        - Chính xác và chi tiết
        - Thân thiện và lịch sự
        - Bằng tiếng Việt (trừ khi được yêu cầu khác)
        - Dựa trên ngữ cảnh cuộc trò chuyện trước đó
        
        Nếu có lịch sử trò chuyện, hãy tham khảo để đưa ra câu trả lời phù hợp.
        """
        
        if context:
            prompt = f"{system_prompt}\n\nLịch sử trò chuyện:\n{context}\n\nCâu hỏi hiện tại: {message}\n\nTrả lời:"
        else:
            prompt = f"{system_prompt}\n\nCâu hỏi: {message}\n\nTrả lời:"
        
        return prompt
    
    async def get_conversation_summary(self, messages: List[Dict[str, Any]]) -> str:
        """Generate a summary title for the conversation"""
        if not messages:
            return "Cuộc trò chuyện mới"
        
        # Get first few messages for context
        first_messages = messages[:3]
        content = " ".join([msg.get('content', '') for msg in first_messages])
        
        prompt = f"""
        Hãy tạo một tiêu đề ngắn gọn (tối đa 50 ký tự) cho cuộc trò chuyện dựa trên nội dung sau:
        
        {content}
        
        Tiêu đề nên:
        - Ngắn gọn, súc tích
        - Bằng tiếng Việt
        - Thể hiện chủ đề chính
        - Không có dấu ngoặc kép
        
        Tiêu đề:
        """
        
        try:
            if self.model:
                response = self.model.generate_content(prompt)
                if response.text:
                    title = response.text.strip().replace('"', '').replace("'", "")
                    return title[:50]  # Giới hạn độ dài
            return "Cuộc trò chuyện"
        except Exception as e:
            print(f"Error generating summary: {e}")
            return "Cuộc trò chuyện"

# Singleton instance
gemini_service = GeminiService()