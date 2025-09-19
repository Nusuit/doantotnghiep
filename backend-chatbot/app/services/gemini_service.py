import requests
import json
from typing import List, Dict, Any, Optional
import os
from ..config.settings import settings

class GeminiService:
    def __init__(self):
        # Store API key for REST calls
        self.api_key = settings.GOOGLE_API_KEY
        
        # Chat history for context
        self.chat_history = []
    
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
            
            # Use REST API directly for more reliable results
            response = self._call_gemini_rest_api(prompt)
            
            return response
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return f"Xin chào! Tôi là AI assistant. Bạn vừa hỏi: '{message}'. Tôi sẽ cố gắng trả lời dựa trên lịch sử cuộc trò chuyện của chúng ta."
    
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
    
    def _call_gemini_rest_api(self, prompt: str) -> str:
        """Call Gemini API using REST endpoint directly"""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={self.api_key}"
            
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 1000
                }
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if "candidates" in result and len(result["candidates"]) > 0:
                    content = result["candidates"][0]["content"]["parts"][0]["text"]
                    return content.strip()
                else:
                    return "Xin lỗi, tôi không thể tạo ra câu trả lời phù hợp."
            else:
                print(f"API Error: {response.status_code} - {response.text}")
                return f"Xin chào! Tôi đang gặp sự cố kỹ thuật nhưng tôi hiểu bạn đang hỏi về: '{prompt[:100]}...'"
                
        except Exception as e:
            print(f"REST API Error: {e}")
            return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau."
    
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