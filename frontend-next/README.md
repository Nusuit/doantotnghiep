# Chatbot Frontend

Frontend cho hệ thống Chatbot sử dụng Next.js, TypeScript và Tailwind CSS.

## 🚀 Tính năng

- **Next.js 15**: React framework hiệu suất cao
- **TypeScript**: Type safety và developer experience tốt hơn
- **Tailwind CSS**: Styling nhanh chóng và responsive
- **Real-time Chat**: Giao diện chat thân thiện
- **Conversation Management**: Quản lý lịch sử trò chuyện

## 📋 Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn

## 🛠️ Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/Nusuit/chatbot_frontend.git
cd chatbot_frontend
```

### 2. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### 3. Cấu hình environment

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Chạy development server

```bash
npm run dev
# hoặc
yarn dev
```

Mở [http://localhost:3000](http://localhost:3000) trong browser.

## 🏗️ Build production

```bash
npm run build
npm start
```

## 🔧 Cấu trúc project

```
frontend-next/
├── src/
│   └── app/
│       ├── page.tsx         # Home page
│       ├── chat/
│       │   └── page.tsx     # Chat interface
│       ├── globals.css      # Global styles
│       └── layout.tsx       # Root layout
├── public/                  # Static assets
├── next.config.ts          # Next.js configuration
├── tailwind.config.mjs     # Tailwind configuration
└── package.json            # Dependencies
```

## 💻 Các trang chính

- **Home** (`/`): Trang chủ giới thiệu
- **Chat** (`/chat`): Giao diện chat chính

## 🎨 UI Components

- Chat interface với input và message bubbles
- Responsive design cho mobile và desktop
- Tailwind CSS cho styling nhanh chóng
- TypeScript cho type safety

## 🔗 API Integration

Frontend tích hợp với Backend API:
- `POST /api/chat/send` - Gửi tin nhắn
- `GET /api/chat/conversations/{user_id}` - Lấy cuộc trò chuyện
- `GET /api/chat/conversations/{conversation_id}/messages` - Lấy tin nhắn

## 📱 Responsive Design

- Mobile-first approach
- Responsive cho tất cả device sizes
- Touch-friendly interface

## 🔧 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📝 License

MIT License

## 👥 Contributors

- Developer: [Your Name]
- Mentor: [Mentor Name]
