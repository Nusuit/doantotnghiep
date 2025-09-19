'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Search,
  Paperclip,
  MapPin,
  Mic,
  UtensilsCrossed,
  MapPinned,
  Star,
  Calendar,
  Send,
  Plus
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import { chatService } from '../../services/chatService'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: Date
  messageCount: number
  messages: Message[]
}

export default function ChatPage() {
  const [inputValue, setInputValue] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isChatMode, setIsChatMode] = useState(false)
  const [hasNotifications] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentConversation = conversations.find(c => c.id === currentConversationId)
  const messages = useMemo(() => currentConversation?.messages || [], [currentConversation])

  // Function to clean markdown formatting from text
  const cleanMarkdownText = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold ** **
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic * *
      .replace(/~~(.*?)~~/g, '$1')     // Remove strikethrough ~~ ~~
      .replace(/`(.*?)`/g, '$1')       // Remove inline code ` `
      .replace(/#{1,6}\s/g, '')        // Remove headers # ## ###
      .trim()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Initialize user on component mount
  useEffect(() => {
    const initUser = async () => {
      try {
        const id = await chatService.getOrCreateUser()
        setUserId(id)
        // Load existing conversations
        const convs = await chatService.getUserConversations(id)
        const mappedConversations: Conversation[] = convs.map(conv => ({
          id: conv.id.toString(),
          title: conv.title,
          preview: '', // Will be set when messages are loaded
          timestamp: new Date(conv.updated_at),
          messageCount: 0, // Will be set when messages are loaded
          messages: []
        }))
        setConversations(mappedConversations)
      } catch (error) {
        console.error('Failed to initialize user:', error)
        setUserId(1) // Fallback
      }
    }
    initUser()
  }, [])

  const generateConversationTitle = (firstMessage: string) => {
    return firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + '...'
      : firstMessage
  }

  const createNewConversation = () => {
    // Reset to landing page without creating empty conversation
    setCurrentConversationId(null)
    setIsChatMode(false)
  }

  const selectConversation = async (id: string) => {
    setCurrentConversationId(id)
    const conversation = conversations.find(c => c.id === id)
    
    if (conversation) {
      // Load messages if not already loaded
      if (conversation.messages.length === 0) {
        try {
          const messages = await chatService.getConversationMessages(parseInt(id))
          const mappedMessages: Message[] = messages.map(msg => ({
            id: msg.id.toString(),
            text: msg.is_user ? msg.content : cleanMarkdownText(msg.content),
            isUser: msg.is_user,
            timestamp: new Date(msg.created_at)
          }))
          
          // Update conversation with loaded messages
          setConversations(prev => prev.map(conv => {
            if (conv.id === id) {
              return {
                ...conv,
                messages: mappedMessages,
                messageCount: mappedMessages.length,
                preview: mappedMessages.length > 0 ? mappedMessages[mappedMessages.length - 1].text : ''
              }
            }
            return conv
          }))
          
          setIsChatMode(mappedMessages.length > 0)
        } catch (error) {
          console.error('Failed to load conversation messages:', error)
          setIsChatMode(false)
        }
      } else {
        setIsChatMode(conversation.messages.length > 0)
      }
    } else {
      setIsChatMode(false)
    }
  }

  const deleteConversation = async (id: string) => {
    if (!userId) return
    
    try {
      await chatService.deleteConversation(parseInt(id), userId)
      setConversations(prev => prev.filter(conv => conv.id !== id))
      if (currentConversationId === id) {
        setCurrentConversationId(null)
        setIsChatMode(false)
      }
      // Focus back to input after deletion
      setTimeout(() => {
        const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement
        if (inputElement) {
          inputElement.focus()
        }
      }, 100)
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  const handleQuickAction = (action: string) => {
    setInputValue(action)
    // Auto-focus on input after setting quick action
    setTimeout(() => {
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement
      if (inputElement) {
        inputElement.focus()
      }
    }, 100)
  }

  const handleSend = async () => {
    if (!inputValue.trim() || !userId) return

    const messageText = inputValue.trim()
    setInputValue('')
    setIsChatMode(true)
    setIsTyping(true)

    try {
      // Send message to backend
      const response = await chatService.sendMessage({
        message: messageText,
        user_id: userId,
        conversation_id: currentConversationId ? parseInt(currentConversationId) : undefined
      })

      const conversationId = response.conversation_id.toString()

      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        isUser: true,
        timestamp: new Date()
      }

      // Create AI response message
      const aiMessage: Message = {
        id: response.message_id.toString(),
        text: cleanMarkdownText(response.response),
        isUser: false,
        timestamp: new Date(response.timestamp)
      }

      // Update or create conversation
      setConversations(prev => {
        const existingConvIndex = prev.findIndex(conv => conv.id === conversationId)
        
        if (existingConvIndex >= 0) {
          // Update existing conversation
          const updated = [...prev]
          updated[existingConvIndex] = {
            ...updated[existingConvIndex],
            messages: [...updated[existingConvIndex].messages, userMessage, aiMessage],
            messageCount: updated[existingConvIndex].messages.length + 2,
            timestamp: new Date(),
            preview: messageText
          }
          return updated
        } else {
          // Create new conversation
          const newConversation: Conversation = {
            id: conversationId,
            title: generateConversationTitle(messageText),
            preview: messageText,
            timestamp: new Date(),
            messageCount: 2,
            messages: [userMessage, aiMessage]
          }
          return [newConversation, ...prev]
        }
      })

      // Set current conversation if it's new
      if (!currentConversationId) {
        setCurrentConversationId(conversationId)
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      // Add error message to conversation
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        isUser: false,
        timestamp: new Date()
      }
      
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, errorMessage],
            messageCount: conv.messages.length + 1,
            timestamp: new Date()
          }
        }
        return conv
      }))
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        onNewConversation={createNewConversation}
        hasNotifications={hasNotifications}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {!isChatMode ? (
          // Landing Page
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-8">
            <div className="max-w-2xl w-full">
              {/* Logo */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-light text-gray-900 mb-2">
                  Trợ lý ảo Tri Thức Vị Giác
                </h1>
              </div>

              {/* Search Bar */}
              <div className="relative mb-8">
                <div className="bg-white border border-gray-300 rounded-3xl shadow-lg focus-within:border-gray-400 focus-within:shadow-xl transition-all">
                  <div className="flex items-center px-6 py-4">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="hỏi bất kì điều gì về ẩm thực Việt Nam..."
                      className="flex-1 text-lg text-gray-900 placeholder-gray-400 border-none outline-none"
                    />
                    
                    {/* Toolbar Icons */}
                    <div className="flex items-center space-x-3 ml-4">
                      {!inputValue.trim() ? (
                        <>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                            <Search className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                            <Paperclip className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                            <MapPin className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all">
                            <Mic className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleSend}
                          className="p-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => handleQuickAction("Tôi muốn tìm món ăn ngon")}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <UtensilsCrossed className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Tìm món ăn</span>
                </button>
                
                <button
                  onClick={() => handleQuickAction("Gợi ý cho tôi một địa điểm ăn uống thú vị")}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <MapPinned className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Gợi ý địa điểm</span>
                </button>
                
                <button
                  onClick={() => handleQuickAction("Tôi muốn xem đánh giá của địa điểm")}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <Star className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Đánh giá review</span>
                </button>
                
                <button
                  onClick={() => handleQuickAction("Lên lịch trình ăn uống cho chuyến đi")}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Lên plan</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Chat Interface
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Header */}
            <div className="flex-shrink-0 border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentConversation?.title || 'Trợ lý ảo Tri Thức Vị Giác'}
                </h2>
                <button
                  onClick={createNewConversation}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isUser
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{cleanMarkdownText(message.text)}</p>
                    <p className={`text-xs mt-1 ${
                      message.isUser ? 'text-teal-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-2xl">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
              <div className="bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:border-gray-400 transition-all">
                <div className="flex items-center px-4 py-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="hỏi bất kì điều gì về ẩm thực Việt Nam..."
                    className="flex-1 text-sm text-gray-900 placeholder-gray-400 border-none outline-none"
                  />
                  
                  <div className="flex items-center space-x-2 ml-3">
                    {!inputValue.trim() ? (
                      <>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                          <Search className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                          <MapPin className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all">
                          <Mic className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleSend}
                        className="p-1.5 text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

