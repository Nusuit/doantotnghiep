# Chatbot Backend API

Backend API cho hệ thống Chatbot sử dụng FastAPI, MySQL và Gemini 2.5 Flash AI.

## 🚀 Tính năng

- **FastAPI Framework**: API REST hiệu suất cao
- **MySQL Database**: Lưu trữ users, conversations, messages
- **Gemini 2.5 Flash**: AI chatbot thông minh
- **SQLAlchemy ORM**: Quản lý database dễ dàng
- **Auto Documentation**: Swagger UI tại `/docs`

## 📋 Yêu cầu hệ thống

- Python 3.8+
- MySQL 8.0+
- Google AI API Key

## 🛠️ Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/Nusuit/chatbot_backend.git
cd chatbot_backend
```

### 2. Tạo virtual environment

```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
```

### 3. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 4. Cấu hình environment

Tạo file `.env`:

```env
# Database Configuration
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/chatbot_db

# Google AI Configuration
GOOGLE_API_KEY=your_gemini_api_key

# Server Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

### 5. Tạo database

```sql
CREATE DATABASE chatbot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Chạy SQL script:

```bash
mysql -u root -p < database_schema.sql
```

## 🏃‍♂️ Chạy server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Server sẽ chạy tại: http://localhost:8000

## 📚 API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔌 API Endpoints

### Chat Endpoints
- `POST /api/chat/send` - Gửi tin nhắn và nhận phản hồi AI
- `GET /api/chat/conversations/{user_id}` - Lấy danh sách cuộc trò chuyện
- `GET /api/chat/conversations/{conversation_id}/messages` - Lấy tin nhắn trong cuộc trò chuyện
- `DELETE /api/chat/conversations/{conversation_id}` - Xóa cuộc trò chuyện

### User Endpoints
- `POST /api/users/` - Tạo user mới
- `GET /api/users/{user_id}` - Lấy thông tin user
- `GET /api/users/username/{username}` - Lấy user theo username

## 🗄️ Database Schema

```
users
├── id (Primary Key)
├── username (Unique)
├── email (Unique)
├── created_at
└── updated_at

conversations
├── id (Primary Key)
├── user_id (Foreign Key -> users.id)
├── title
├── created_at
└── updated_at

messages
├── id (Primary Key)
├── conversation_id (Foreign Key -> conversations.id)
├── content (Text)
├── is_user (Boolean)
└── created_at
```

## 🔧 Cấu trúc project

```
backend-chatbot/
├── app/
│   ├── api/
│   │   ├── chat.py          # Chat endpoints
│   │   └── users.py         # User endpoints
│   ├── config/
│   │   └── settings.py      # Configuration
│   ├── database/
│   │   ├── __init__.py      # Database setup
│   │   └── connection.py    # Connection config
│   ├── models/
│   │   └── __init__.py      # SQLAlchemy models
│   ├── schemas/
│   │   ├── chat.py          # Chat schemas
│   │   └── user.py          # User schemas
│   ├── services/
│   │   └── gemini_service.py # Gemini AI service
│   └── main.py              # FastAPI app
├── .env                     # Environment variables
├── requirements.txt         # Dependencies
└── database_schema.sql      # Database schema
```

## 🤖 Gemini AI Integration

- **Model**: gemini-2.0-flash-exp
- **Context**: Sử dụng lịch sử cuộc trò chuyện
- **Language**: Hỗ trợ tiếng Việt
- **Features**: 
  - Sinh câu trả lời thông minh
  - Tự động tạo tiêu đề cuộc trò chuyện
  - Ghi nhớ context

## 🚦 Health Check

```bash
curl http://localhost:8000/health
```

## 🐛 Troubleshooting

### Lỗi kết nối MySQL
```bash
# Kiểm tra MySQL service
Get-Service | Where-Object {$_.Name -like "*mysql*"}

# Start MySQL service
net start mysql
```

### Lỗi import modules
```bash
# Kiểm tra virtual environment
pip list
pip install -r requirements.txt
```

## 📝 License

MIT License

## 👥 Contributors

- Developer: [Your Name]
- Mentor: [Mentor Name]