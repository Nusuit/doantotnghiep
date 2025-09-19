const API_BASE_URL = 'http://localhost:8000';

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Message {
  id: number;
  content: string;
  is_user: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  message_id: number;
  conversation_id: number;
  response: string;
  timestamp: string;
}

class ChatAPI {
  // Create user
  async createUser(username: string, email: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return response.json();
  }

  // Get user by ID
  async getUser(userId: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.statusText}`);
    }

    return response.json();
  }

  // Send chat message
  async sendMessage(
    userId: number, 
    message: string, 
    conversationId?: number
  ): Promise<ChatResponse> {
    const body: {
      user_id: number;
      message: string;
      conversation_id?: number;
    } = {
      user_id: userId,
      message: message,
    };

    if (conversationId) {
      body.conversation_id = conversationId;
    }

    const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.json();
  }

  // Get user conversations
  async getConversations(userId: number): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get conversations: ${response.statusText}`);
    }

    return response.json();
  }

  // Get messages in conversation
  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`);
    
    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.statusText}`);
    }

    return response.json();
  }

  // Delete conversation
  async deleteConversation(conversationId: number, userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}?user_id=${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.statusText}`);
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
}

export const chatAPI = new ChatAPI();