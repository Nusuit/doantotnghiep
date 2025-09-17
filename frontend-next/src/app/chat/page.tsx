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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentConversation = conversations.find(c => c.id === currentConversationId)
  const messages = useMemo(() => currentConversation?.messages || [], [currentConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const generateConversationTitle = (firstMessage: string) => {
    return firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + '...'
      : firstMessage
  }

  const createNewConversation = () => {
    const newId = Date.now().toString()
    const newConversation: Conversation = {
      id: newId,
      title: 'Cuộc trò chuyện mới',
      preview: 'Bắt đầu cuộc trò chuyện...',
      timestamp: new Date(),
      messageCount: 0,
      messages: []
    }
    
    setConversations(prev => [newConversation, ...prev])
    setCurrentConversationId(newId)
    setIsChatMode(false)
  }

  const selectConversation = (id: string) => {
    setCurrentConversationId(id)
    const conversation = conversations.find(c => c.id === id)
    if (conversation && conversation.messages.length > 0) {
      setIsChatMode(true)
    } else {
      setIsChatMode(false)
    }
  }

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (currentConversationId === id) {
      setCurrentConversationId(null)
      setIsChatMode(false)
    }
  }

  const handleQuickAction = (suggestion: string) => {
    setInputValue(suggestion)
    // Optionally focus the input field
    setTimeout(() => {
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement
      if (inputElement) {
        inputElement.focus()
      }
    }, 100)
  }

  const handleSend = async () => {
    if (inputValue.trim()) {
      let conversationId = currentConversationId

      // Create new conversation if none exists
      if (!conversationId) {
        conversationId = Date.now().toString()
        const newConversation: Conversation = {
          id: conversationId,
          title: generateConversationTitle(inputValue.trim()),
          preview: inputValue.trim(),
          timestamp: new Date(),
          messageCount: 0,
          messages: []
        }
        setConversations(prev => [newConversation, ...prev])
        setCurrentConversationId(conversationId)
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        isUser: true,
        timestamp: new Date()
      }
      
      // Update conversation with new message
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedMessages = [...conv.messages, userMessage]
          return {
            ...conv,
            messages: updatedMessages,
            messageCount: updatedMessages.length,
            timestamp: new Date(),
            title: conv.title === 'Cuộc trò chuyện mới' ? generateConversationTitle(userMessage.text) : conv.title,
            preview: userMessage.text
          }
        }
        return conv
      }))

      setInputValue('')
      setIsChatMode(true)
      setIsTyping(true)
      
      // Simulate bot response
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Cảm ơn bạn đã hỏi về "${userMessage.text}". Tôi đang phát triển để có thể trả lời tốt hơn về ẩm thực Việt Nam!`,
          isUser: false,
          timestamp: new Date()
        }
        
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            const updatedMessages = [...conv.messages, botMessage]
            return {
              ...conv,
              messages: updatedMessages,
              messageCount: updatedMessages.length,
              timestamp: new Date()
            }
          }
          return conv
        }))
        
        setIsTyping(false)
      }, 1500)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        hasNotifications={hasNotifications}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        onNewConversation={createNewConversation}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {!isChatMode ? (
          // Landing Page
          <div className="flex-1 flex flex-col items-center justify-center px-8">
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
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    <p className="text-sm">{message.text}</p>
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
            <div className="border-t border-gray-200 p-4">
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