from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from ..config.settings import settings

# Tạo engine kết nối database
engine = create_engine(
    settings.DATABASE_URL,
    echo=True  # Log SQL queries (có thể tắt ở production)
)

# Tạo session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class cho các models
Base = declarative_base()

def get_database():
    """Dependency để lấy database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database - tạo các tables nếu chưa có"""
    Base.metadata.create_all(bind=engine)