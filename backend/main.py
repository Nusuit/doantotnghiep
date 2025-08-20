from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth
from api import reviews
from api import coins
from api import reservations
from core.database import Base, engine

app = FastAPI(title="Tri Thức Vị Giác")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tạo bảng nếu chưa có
Base.metadata.create_all(bind=engine)

# Đăng ký router
app.include_router(auth.router)
app.include_router(reviews.router)
app.include_router(coins.router)
app.include_router(reservations.router)
