'use client'

import { useState } from 'react'
import { MoreHorizontal, Trash2 } from 'lucide-react'

interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: Date
  messageCount: number
}

interface ChatHistoryProps {
  conversations: Conversation[]
  currentConversationId?: string | null
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onNewConversation: () => void
}

export default function ChatHistory({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation
}: ChatHistoryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (conversations.length === 0) {
    return (
      <div className="absolute left-16 top-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Library</h3>
          <button
            onClick={onNewConversation}
            className="text-gray-400 hover:text-gray-600"
          >
            +
          </button>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
          <button
            onClick={onNewConversation}
            className="mt-2 text-teal-600 hover:text-teal-700 text-sm font-medium"
          >
            Bắt đầu trò chuyện mới
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute left-16 top-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Library</h3>
        <button
          onClick={onNewConversation}
          className="text-gray-400 hover:text-gray-600"
        >
          +
        </button>
      </div>

      {/* Conversations List */}
      <div className="p-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`group relative p-3 rounded-lg transition-colors cursor-pointer ${
              currentConversationId === conversation.id
                ? 'bg-teal-50 border border-teal-200'
                : 'hover:bg-gray-50'
            }`}
            onMouseEnter={() => setHoveredId(conversation.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {conversation.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {conversation.preview}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  <span>{conversation.messageCount} tin nhắn</span>
                  <span className="mx-1">•</span>
                  <span>
                    {conversation.timestamp.toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
              
              {hoveredId === conversation.id && (
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: Add more options menu
                    }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <MoreHorizontal className="w-3 h-3 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(conversation.id)
                    }}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}