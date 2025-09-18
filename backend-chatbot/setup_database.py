"""
Database setup script
Run this to create database and tables
"""
import sys
import os

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

from sqlalchemy import create_engine, text
from app.config.settings import settings
from app.models import Base

def create_database():
    """Create the chatbot_db database"""
    # Connect without database to create it
    engine_url = f"mysql+mysqlconnector://{settings.MYSQL_USER}:{settings.MYSQL_PASSWORD}@{settings.MYSQL_HOST}:{settings.MYSQL_PORT}/"
    engine = create_engine(engine_url)
    
    with engine.connect() as connection:
        # Create database if it doesn't exist
        connection.execute(text(f"CREATE DATABASE IF NOT EXISTS {settings.MYSQL_DATABASE}"))
        print(f"Database '{settings.MYSQL_DATABASE}' created successfully!")

def create_tables():
    """Create all tables"""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully!")

if __name__ == "__main__":
    print("Setting up database...")
    create_database()
    create_tables()
    print("Database setup complete!")