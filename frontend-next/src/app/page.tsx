'use client'

import { Calendar, Coffee, MapPin, Search, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/chat?q=${encodeURIComponent(query)}`)
    }
  }

  const quickActions = [
    { icon: Calendar, label: 'Lên lịch trình', color: 'from-blue-500 to-blue-600' },
    { icon: Coffee, label: 'Gợi ý quán ăn', color: 'from-amber-500 to-orange-500' },
    { icon: MapPin, label: 'Gợi ý cafe', color: 'from-emerald-500 to-teal-500' },
    { icon: Search, label: 'Tìm kiếm', color: 'from-purple-500 to-indigo-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.15)_1px,_transparent_0)] bg-[length:20px_20px] opacity-20"></div>
      
      <div className="relative flex min-h-screen">
        <div className="fixed left-0 top-0 h-full w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 p-8">
          <div className="flex flex-col h-full">
            <div className="mb-12">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    Tri Thức
                  </h1>
                  <p className="text-sm text-white/60 font-medium">Vị Giác Pro</p>
                </div>
              </div>
            </div>

            <nav className="space-y-3 flex-1">
              <div className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-6">
                Khám phá
              </div>
              
              <button
                onClick={() => router.push('/chat')}
                className="w-full text-left px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 transition-all duration-200 border border-white/5 hover:border-white/20"
              >
                💬 Trò chuyện
              </button>
              
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 text-white/70 hover:text-white/90 transition-all duration-200">
                📚 Thư viện
              </button>
              
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 text-white/70 hover:text-white/90 transition-all duration-200">
                ⭐ Yêu thích
              </button>
              
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 text-white/70 hover:text-white/90 transition-all duration-200">
                📊 Thống kê
              </button>
            </nav>

            <div className="border-t border-white/10 pt-6 space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 text-white/70 hover:text-white/90 transition-all duration-200">
                ⚙️ Cài đặt
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 text-white/70 hover:text-white/90 transition-all duration-200">
                ❓ Trợ giúp
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 ml-80 p-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent leading-tight">
                Chào mừng đến với
                <span className="block text-6xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                  Tri Thức Vị Giác Pro
                </span>
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                Trải nghiệm AI thông minh, tìm kiếm thông tin chính xác và nhận được câu trả lời chi tiết cho mọi thắc mắc của bạn.
              </p>
            </div>

            <div className="relative mb-16">
              <div className="relative max-w-3xl mx-auto">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Hỏi bất cứ điều gì..."
                  className="w-full px-8 py-6 text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white transition-all duration-200 hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mb-16">
              <h3 className="text-2xl font-bold text-white/90 mb-8 text-center">
                Hành động nhanh
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(action.label)}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-white/20"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-white/90 text-left">
                      {action.label}
                    </h4>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-white/90 mb-3">Trả lời nhanh</h3>
                <p className="text-white/70 leading-relaxed">
                  Nhận câu trả lời chi tiết và chính xác trong vài giây với công nghệ AI tiên tiến.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-white/90 mb-3">Kết quả chính xác</h3>
                <p className="text-white/70 leading-relaxed">
                  Thông tin được kiểm chứng từ nhiều nguồn đáng tin cậy để đảm bảo độ chính xác cao nhất.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-bold text-white/90 mb-3">Gợi ý thông minh</h3>
                <p className="text-white/70 leading-relaxed">
                  AI hiểu ngữ cảnh và đưa ra những gợi ý phù hợp cho từng tình huống cụ thể.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}