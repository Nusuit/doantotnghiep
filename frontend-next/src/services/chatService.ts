// API service for chatbot backend
const API_BASE_URL = 'http://localhost:8000'

export interface ChatRequest {
  message: string
  user_id: number
  conversation_id?: number
}

export interface ChatResponse {
  message_id: number
  conversation_id: number
  response: string
  timestamp: string
}

export interface ConversationResponse {
  id: number
  title: string
  created_at: string
  updated_at: string
}

export interface MessageResponse {
  id: number
  content: string
  is_user: boolean
  created_at: string
}

export interface UserCreate {
  username: string
  email: string
}

export interface UserResponse {
  id: number
  username: string
  email: string
  created_at: string
}

class ChatService {
  private userId: number | null = null

  async getOrCreateUser(): Promise<number> {
    if (this.userId) {
      return this.userId
    }

    // Try to get user from localStorage
    const savedUserId = localStorage.getItem('chatbot_user_id')
    if (savedUserId) {
      this.userId = parseInt(savedUserId)
      return this.userId
    }

    // Create default user
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `user_${Date.now()}`,
          email: `user_${Date.now()}@example.com`
        }),
      })

      if (response.ok) {
        const user: UserResponse = await response.json()
        this.userId = user.id
        localStorage.setItem('chatbot_user_id', user.id.toString())
        return this.userId
      }
    } catch (error) {
      console.warn('Failed to create user:', error)
    }

    // Fallback to default user ID
    this.userId = 1
    return this.userId
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getUserConversations(userId: number): Promise<ConversationResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${userId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getConversationMessages(conversationId: number): Promise<MessageResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async deleteConversation(conversationId: number, userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}?user_id=${userId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  }
}

export const chatService = new ChatService()