'use client'

import { useState, useCallback, useEffect } from 'react'

export interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  isTyping?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  lastMessage: string
  timestamp: Date
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat-conversations')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const conversationsWithDates = parsed.map((conv: Omit<Conversation, 'timestamp' | 'messages'> & { 
          timestamp: string, 
          messages: Array<Omit<ChatMessage, 'timestamp'> & { timestamp: string }> 
        }) => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages.map((msg: Omit<ChatMessage, 'timestamp'> & { timestamp: string }) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }))
        setConversations(conversationsWithDates)
        
        // Auto select the most recent conversation
        if (conversationsWithDates.length > 0) {
          setCurrentConversationId(conversationsWithDates[0].id)
        }
      } catch (e) {
        console.error('Failed to load conversations:', e)
      }
    }
  }, [])

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('chat-conversations', JSON.stringify(conversations))
    }
  }, [conversations])

  const currentConversation = conversations.find(c => c.id === currentConversationId)

  const generateTitle = (message: string): string => {
    // Generate a smart title from the first message
    const words = message.trim().split(' ')
    if (words.length <= 6) return message
    return words.slice(0, 6).join(' ') + '...'
  }

  const createConversation = useCallback((): string => {
    const id = Date.now().toString()
    const newConversation: Conversation = {
      id,
      title: 'Cuộc trò chuyện mới',
      messages: [],
      lastMessage: '',
      timestamp: new Date()
    }

    setConversations(prev => [newConversation, ...prev])
    setCurrentConversationId(id)
    setError(null)
    
    return id
  }, [])

  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id)
    setError(null)
  }, [])

  const addMessage = useCallback((text: string, isUser: boolean = true) => {
    if (!currentConversationId) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      isTyping: false
    }

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        const updatedMessages = [...conv.messages, newMessage]
        return {
          ...conv,
          messages: updatedMessages,
          lastMessage: text,
          timestamp: new Date(),
          title: conv.title === 'Cuộc trò chuyện mới' ? generateTitle(text) : conv.title
        }
      }
      return conv
    }))

    return newMessage.id
  }, [currentConversationId])

  const addTypingIndicator = useCallback(() => {
    if (!currentConversationId) return

    const typingMessage: ChatMessage = {
      id: 'typing-' + Date.now(),
      text: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    }

    console.log('Adding typing indicator:', typingMessage.id)

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        return {
          ...conv,
          messages: [...conv.messages, typingMessage]
        }
      }
      return conv
    }))

    return typingMessage.id
  }, [currentConversationId])

  const removeTypingIndicator = useCallback((typingId: string) => {
    console.log('Removing typing indicator:', typingId)
    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        return {
          ...conv,
          messages: conv.messages.filter(msg => msg.id !== typingId)
        }
      }
      return conv
    }))
  }, [currentConversationId])

  const clearAllTypingIndicators = useCallback(() => {
    console.log('Clearing all typing indicators...')
    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        const typingCount = conv.messages.filter(msg => msg.isTyping).length
        console.log(`Found ${typingCount} typing indicators to clear`)
        return {
          ...conv,
          messages: conv.messages.filter(msg => !msg.isTyping)
        }
      }
      return conv
    }))
  }, [currentConversationId])

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return
    
    let conversationId = currentConversationId
    if (!conversationId) {
      conversationId = createConversation()
    }

    // Add user message
    addMessage(message, true)
    
    // Show typing indicator
    setIsLoading(true)
    setError(null)
    const typingId = addTypingIndicator()

    try {
      // Simulate API call - will be replaced with real API later
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
      
      // Remove typing indicator
      if (typingId) removeTypingIndicator(typingId)
      
      // Add AI response
      const responses = [
        `Tôi hiểu bạn muốn tìm hiểu về "${message}". Đây là một câu hỏi thú vị về ẩm thực! Tôi sẽ giúp bạn tìm những gợi ý tuyệt vời.`,
        `Về "${message}", tôi có thể gợi ý một số địa điểm và món ăn phù hợp. Bạn có muốn tôi tìm kiếm thêm thông tin chi tiết không?`,
        `Đây là một chủ đề hay về ẩm thực! Dựa trên câu hỏi "${message}", tôi có thể đưa ra những gợi ý cụ thể và hữu ích cho bạn.`
      ]
      
      const response = responses[Math.floor(Math.random() * responses.length)]
      addMessage(response, false)
      
    } catch (err) {
      if (typingId) removeTypingIndicator(typingId)
      setError('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.')
      console.error('Send message error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currentConversationId, createConversation, addMessage, addTypingIndicator, removeTypingIndicator])

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id)
      
      // If we deleted the current conversation, select another one
      if (id === currentConversationId) {
        if (filtered.length > 0) {
          setCurrentConversationId(filtered[0].id)
        } else {
          setCurrentConversationId(null)
        }
      }
      
      return filtered
    })
  }, [currentConversationId])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    conversations,
    currentConversation,
    currentConversationId,
    isLoading,
    error,
    createConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    clearError,
    clearAllTypingIndicators
  }
}