'use client'

import { Calendar, Coffee, MapPin, Search } from 'lucide-react'
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tri Thức</h1>
                <p className="text-sm text-gray-600">Vị Giác Pro</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/chat')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Bắt đầu Chat
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trợ lý AI cho
            <br />
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Ẩm thực Việt Nam
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Khám phá những nhà hàng tuyệt vời nhất và lên kế hoạch cho hành trình ẩm thực của bạn
          </p>
        </div>

        <div className="mb-12">
          <div className="bg-white border border-gray-300 rounded-2xl shadow-lg focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
            <div className="flex items-center p-4">
              <Search className="w-6 h-6 text-gray-400 mr-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi về món ăn Việt Nam, nhà hàng, hoặc ẩm thực..."
                className="flex-1 text-lg text-gray-800 placeholder-gray-400 border-0 focus:ring-0 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={!query.trim()}
                className={`ml-4 px-6 py-2 rounded-xl transition-all ${
                  query.trim()
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Khám phá nhà hàng</h3>
              <p className="text-gray-600 text-sm">
                Tìm những nhà hàng địa phương tuyệt nhất và các địa điểm ẩn giấu ở Việt Nam
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gợi ý món ăn</h3>
              <p className="text-gray-600 text-sm">
                Nhận những đề xuất cá nhân hóa dựa trên sở thích của bạn
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lập kế hoạch ẩm thực</h3>
              <p className="text-gray-600 text-sm">
                Lên kế hoạch hành trình ẩm thực và trải nghiệm ăn uống của bạn
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}