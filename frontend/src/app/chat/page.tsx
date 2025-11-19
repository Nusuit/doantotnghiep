"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, ArrowLeft } from "lucide-react";

export default function ChatPlaceholder() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-6 rounded-full">
            <MessageCircle className="w-16 h-16 text-blue-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tính năng Chat AI
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Tính năng chat với AI đang được phát triển và sẽ được triển khai trong
          phiên bản tiếp theo.
        </p>

        <button
          onClick={() => router.push("/home")}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}
