# 🍴 Tri Thức Vị Giác

> **Nền tảng kiến thức ẩm thực độc nhất** - Mỗi địa điểm chỉ có một review chính thức duy nhất, được xây dựng và cập nhật bởi toàn bộ cộng đồng.

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-06B6D4?style=for-the-badge&logo=tailwindcss)
![SQLite](https://img.shields.io/badge/SQLite-3.45-003B57?style=for-the-badge&logo=sqlite)

**[🔍 Demo Live](http://localhost:5174)** • **[📚 API Docs](http://localhost:8000/docs)** • **[🐛 Issues](https://github.com/your-repo/issues)**

</div>

## ✨ Điểm Khác Biệt

- **🎯 Một Địa Điểm = Một Review**: Chấm dứt thông tin phân mảnh và mâu thuẫn
- **👥 Cộng Đồng Xây Dựng**: Review được cập nhật liên tục bởi cộng đồng  
- **💰 Hệ Thống Coin**: Thưởng coin cho đóng góp, sử dụng để unlock premium
- **⏰ Đặt Cọc Giữ Chỗ**: Cọc 50 coin để giữ quyền viết review 72 giờ
- **🤖 AI Hỗ Trợ**: Trợ lý thông minh tư vấn địa điểm (sắp ra mắt)
- **🏆 Hệ Thống Uy Tín**: Từ Contributor đến Polymath

## 🚀 Quick Start

### Prerequisites

```bash
# Backend Requirements
Python 3.8+
pip

# Frontend Requirements  
Node.js 16+
npm
```

### 🏃‍♂️ Chạy Ứng Dụng

**1. Clone Repository**
```bash
git clone <your-repo-url>
cd tri_thuc_vi_giac
```

**2. Setup Backend**
```bash
cd backend

# Create virtual environment (khuyên dùng)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc: venv\Scripts\activate  # Windows

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic passlib python-jose python-multipart

# Start server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**3. Setup Frontend** *(Terminal mới)*
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**4. Truy Cập Ứng Dụng**
- 🌐 **Frontend**: http://localhost:5174
- ⚙️ **API Docs**: http://localhost:8000/docs
- 📊 **API**: http://localhost:8000/api

## 🏗️ Architecture

```
tri_thuc_vi_giac/
├── 🔧 backend/                 # FastAPI Backend
│   ├── 🛣️  api/               # API Routes
│   │   ├── auth.py            # Authentication
│   │   ├── reviews.py         # Review Management  
│   │   ├── coins.py           # Coin System
│   │   └── reservations.py    # Location Reservations
│   ├── 🏗️  core/              # Core System
│   │   ├── database.py        # Database Config
│   │   ├── security.py        # JWT & Password
│   │   └── utils.py           # Location Utils
│   ├── 📊 models/             # Database Models
│   │   ├── user.py
│   │   ├── review.py
│   │   ├── coin_transaction.py
│   │   └── location_reservation.py
│   ├── 📝 schemas/            # Pydantic Schemas
│   └── 🔧 services/           # Business Logic
│
└── 🎨 frontend/               # React Frontend
    ├── 🧩 src/components/     # Reusable Components
    ├── 📄 src/pages/          # Page Components
    ├── 🛡️  src/context/       # React Context
    ├── 🔗 src/services/       # API Services
    └── 🎨 src/assets/         # Static Assets
```

## 🎯 Core Features

### 🔐 Authentication System
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes & middleware
- User registration with welcome bonus (200 coins)

### 📝 Review System
- **One Location, One Review** constraint
- Location normalization & similarity checking
- Content validation & quality control
- Auto-reward 50 coins for approved reviews

### 💰 Coin Economy
- **Earn**: Write reviews (50), suggestions approved (30)
- **Spend**: Reserve locations (50), tip authors, unlock premium
- **Purchase**: 4 coin packages with bonus tiers
- **Transfer**: Tip system between users
- Transaction history & balance tracking

### ⏰ Location Reservation
- 50 coin deposit for 72-hour exclusivity
- Auto-refund on successful review creation
- Penalty system for no-shows
- 7-day cooldown after losing deposit

### 🎨 Modern UI/UX
- **Tailwind CSS** with custom design system
- Responsive mobile-first design
- Smooth animations & transitions
- Thread-style interface for intuitive browsing
- Loading states & error handling

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **Pydantic** - Data validation using Python type hints
- **JWT** - JSON Web Token authentication
- **SQLite** - Development database (PostgreSQL ready)
- **Uvicorn** - Lightning-fast ASGI server

### Frontend  
- **React 18** - UI library with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next generation frontend tooling

### DevTools
- **Hot Reload** - Both backend & frontend
- **API Documentation** - Auto-generated with FastAPI
- **Type Safety** - TypeScript ready
- **ESLint** - Code linting

## 📈 Roadmap

### 🎯 Phase 1: Core Features *(Completed)*
- [x] Authentication system
- [x] Review CRUD operations  
- [x] One location constraint
- [x] Coin system basics
- [x] Location reservation
- [x] Modern UI with Tailwind

### 🚀 Phase 2: Advanced Features *(Next)*
- [ ] Comment system on reviews
- [ ] Edit suggestions workflow
- [ ] AI Assistant integration
- [ ] Premium content system
- [ ] Advanced search & filters
- [ ] User reputation system

### 🌟 Phase 3: Scale & Polish
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Advanced AI features
- [ ] Google Maps integration
- [ ] Social features
- [ ] Analytics dashboard

## 🤝 Contributing

Chúng tôi luôn chào đón contributions từ cộng đồng!

```bash
# Fork the repository
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m 'Add some amazing feature'

# Push to the branch  
git push origin feature/amazing-feature

# Open a Pull Request
```

## 📋 Development Notes

### Database Schema
```sql
-- Core tables created automatically
users                  # User accounts & profiles
reviews               # Official reviews  
coin_transactions     # All coin movements
location_reservations # 72h location reservations
```

### API Endpoints
```
Authentication:
POST /api/auth/register  # Create account
POST /api/auth/login     # Login
GET  /api/auth/me        # Current user

Reviews:
GET    /api/reviews/              # List reviews
POST   /api/reviews/              # Create review  
GET    /api/reviews/{id}          # Get review
PUT    /api/reviews/{id}          # Update review
DELETE /api/reviews/{id}          # Delete review
POST   /api/reviews/check-location # Check availability

Coins:
GET  /api/coins/balance      # User balance
GET  /api/coins/transactions # Transaction history
GET  /api/coins/packages     # Purchase packages
POST /api/coins/purchase/{package_id}  # Buy coins
POST /api/coins/tip/{user_id}          # Tip user

Reservations:
GET    /api/reservations/check-eligibility  # Can user reserve?
POST   /api/reservations/                   # Reserve location
GET    /api/reservations/my-reservations    # User reservations
GET    /api/reservations/{id}               # Get reservation
DELETE /api/reservations/{id}               # Cancel reservation
```

## 📸 Screenshots

### 🏠 Homepage
Beautiful gradient hero section with feature highlights and call-to-action

### 📝 Reviews List
Card-based layout with smooth animations and community stats

### 🔐 Authentication  
Modern forms with validation feedback and welcome bonuses

### 💰 Coin System
Transparent transaction history and purchase options

---

<div align="center">

**[⭐ Star this repo](https://github.com/your-repo)** • **[🐛 Report Bug](https://github.com/your-repo/issues)** • **[💡 Request Feature](https://github.com/your-repo/issues)**

Made with ❤️ by the **Tri Thức Vị Giác** team

</div> 