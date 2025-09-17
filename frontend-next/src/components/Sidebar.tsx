'use client'

import { useState, useEffect } from 'react'
import { 
  Home, 
  Search, 
  Grid3X3, 
  User, 
  ArrowUp, 
  Download,
  Plus,
  Bell
} from 'lucide-react'
import ChatHistory from './ChatHistory'

interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: Date
  messageCount: number
}

interface SidebarProps {
  conversations: Conversation[]
  currentConversationId?: string | null
  hasNotifications: boolean
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onNewConversation: () => void
}

export default function Sidebar({
  conversations,
  currentConversationId,
  hasNotifications,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation
}: SidebarProps) {
  const [activeItem, setActiveItem] = useState('home')
  const [showHistory, setShowHistory] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleHomeMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    setShowHistory(true)
  }

  const handleHomeMouseLeave = () => {
    // Delay hiding to allow mouse to move to ChatHistory
    const timeout = setTimeout(() => {
      setShowHistory(false)
    }, 200)
    setHoverTimeout(timeout)
  }

  const handleHistoryMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
  }

  const handleHistoryMouseLeave = () => {
    setShowHistory(false)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
    }
  }, [hoverTimeout])

  const sidebarItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'discover', icon: Search, label: 'Discover' },
    { id: 'spaces', icon: Grid3X3, label: 'Spaces' },
  ]

  const bottomItems = [
    { id: 'notifications', icon: Bell, label: '' },
    { id: 'account', icon: User, label: 'Account' },
    { id: 'upgrade', icon: ArrowUp, label: 'Upgrade' },
    { id: 'install', icon: Download, label: 'Install' },
  ]

  return (
    <div className="relative">
      <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 h-screen">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <div className="text-white text-sm font-bold">🔍</div>
          </div>
        </div>

        {/* New Chat Button */}
        <button 
          onClick={onNewConversation}
          className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center mb-6 hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-5 h-5 text-gray-600" />
        </button>

        {/* Main Navigation */}
        <div className="flex flex-col space-y-4 flex-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                onMouseEnter={() => {
                  if (item.id === 'home') {
                    handleHomeMouseEnter()
                  }
                }}
                onMouseLeave={() => {
                  if (item.id === 'home') {
                    handleHomeMouseLeave()
                  }
                }}
                className="flex flex-col items-center space-y-1"
                title={item.label}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isActive 
                    ? 'bg-gray-200 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs ${
                  isActive ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col space-y-4">
          {bottomItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className="flex flex-col items-center space-y-1 relative"
                title={item.label}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isActive 
                    ? 'bg-gray-200 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                  <Icon className="w-5 h-5" />
                  {item.id === 'notifications' && hasNotifications && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
                {item.label && (
                  <span className={`text-xs ${
                    isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat History Overlay */}
      {showHistory && (
        <div
          onMouseEnter={handleHistoryMouseEnter}
          onMouseLeave={handleHistoryMouseLeave}
        >
          <ChatHistory
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={onSelectConversation}
            onDeleteConversation={onDeleteConversation}
            onNewConversation={onNewConversation}
          />
        </div>
      )}
    </div>
  )
}